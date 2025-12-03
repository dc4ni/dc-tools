"""
FastAPI application for image converter
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import logging
from pathlib import Path
from typing import List

from app.config import (
    UPLOAD_DIR, 
    TEMP_DIR, 
    MAX_FILE_SIZE, 
    ALLOWED_MIME_TYPES,
    CORS_ORIGINS
)
from app.image_converter import ImageConverter
from app.error_log_manager import ErrorLogManager

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Image Converter API",
    description="Convert images between different formats",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {"message": "Image Converter API is running"}


@app.get("/api/formats", tags=["Formats"])
async def get_supported_formats():
    """Get list of supported image formats and conversions"""
    try:
        formats = ImageConverter.get_supported_formats()
        return {
            "status": "success",
            "data": formats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload", tags=["Upload"])
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    try:
        # Validate file type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}"
            )
        
        # Read file content
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit"
            )
        
        # Save file with unique name
        file_id = str(uuid.uuid4())
        file_extension = ALLOWED_MIME_TYPES.get(file.content_type, "bin")
        file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get image info
        image_info = ImageConverter.get_image_info(file_path)
        
        return {
            "status": "success",
            "data": {
                "file_id": file_id,
                "original_filename": file.filename,
                "image_info": image_info
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/convert", tags=["Convert"])
async def convert_image(
    file_id: str = Form(...),
    output_format: str = Form(...),
    quality: int = Form(default=85)
):
    """Convert an uploaded image to a different format"""
    try:
        # Validate parameters
        if not file_id or not output_format:
            raise HTTPException(
                status_code=400,
                detail="Missing required parameters: file_id, output_format"
            )
        
        output_format = output_format.lower().strip(".")
        if quality < 1 or quality > 100:
            quality = 85
        
        # Find uploaded file
        uploaded_files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
        if not uploaded_files:
            raise HTTPException(
                status_code=404,
                detail="Uploaded file not found"
            )
        
        input_path = uploaded_files[0]
        
        # Convert image
        output_path = ImageConverter.convert_image(
            input_path,
            output_format,
            quality
        )
        
        # Get converted image info
        converted_info = ImageConverter.get_image_info(output_path)
        
        return {
            "status": "success",
            "data": {
                "output_filename": output_path.name,
                "output_format": output_format,
                "image_info": converted_info,
                "download_url": f"/api/download/{output_path.name}"
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/batch-convert", tags=["Convert"])
async def batch_convert(
    files: List[UploadFile] = File(...),
    output_format: str = Form(...),
    quality: int = Form(default=85)
):
    """Convert multiple images at once"""
    try:
        if not files or len(files) == 0:
            raise HTTPException(
                status_code=400,
                detail="No files provided"
            )
        
        output_format = output_format.lower().strip(".")
        if quality < 1 or quality > 100:
            quality = 85
        
        results = []
        errors = []
        
        for file in files:
            try:
                # Validate file type
                if file.content_type not in ALLOWED_MIME_TYPES:
                    errors.append({
                        "filename": file.filename,
                        "error": f"Unsupported file type: {file.content_type}"
                    })
                    continue
                
                # Read and save file
                content = await file.read()
                
                if len(content) > MAX_FILE_SIZE:
                    errors.append({
                        "filename": file.filename,
                        "error": f"File size exceeds limit"
                    })
                    continue
                
                file_id = str(uuid.uuid4())
                file_extension = ALLOWED_MIME_TYPES.get(file.content_type, "bin")
                file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
                
                with open(file_path, "wb") as f:
                    f.write(content)
                
                # Convert image
                output_path = ImageConverter.convert_image(
                    file_path,
                    output_format,
                    quality
                )
                
                converted_info = ImageConverter.get_image_info(output_path)
                
                results.append({
                    "original_filename": file.filename,
                    "output_filename": output_path.name,
                    "image_info": converted_info,
                    "download_url": f"/api/download/{output_path.name}"
                })
            
            except Exception as e:
                error_msg = f"Failed to convert {file.filename}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                errors.append({
                    "filename": file.filename,
                    "error": error_msg
                })
                continue
        
        return {
            "status": "success" if results else "partial",
            "data": {
                "converted": results,
                "errors": errors,
                "total": len(files),
                "successful": len(results),
                "failed": len(errors)
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{filename}", tags=["Download"])
async def download_image(filename: str):
    """Download a converted image"""
    try:
        file_path = TEMP_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="image/png"
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/cleanup", tags=["Maintenance"])
async def cleanup_files():
    """Clean up temporary and uploaded files"""
    try:
        import shutil
        
        cleaned = 0
        
        # Clean temp directory
        if TEMP_DIR.exists():
            for file in TEMP_DIR.glob("*"):
                if file.is_file():
                    file.unlink()
                    cleaned += 1
        
        # Clean upload directory (optional - adjust as needed)
        if UPLOAD_DIR.exists():
            for file in UPLOAD_DIR.glob("*"):
                if file.is_file():
                    file.unlink()
                    cleaned += 1
        
        return {
            "status": "success",
            "data": {
                "files_deleted": cleaned
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/info", tags=["Info"])
async def get_app_info():
    """Get application information"""
    return {
        "name": "Image Converter",
        "version": "1.0.0",
        "max_file_size": f"{MAX_FILE_SIZE / 1024 / 1024}MB",
        "supported_formats": list(ALLOWED_MIME_TYPES.values()),
        "processing": "Local (Client-side privacy)"
    }


@app.post("/api/log-error", tags=["Logging"])
async def log_error(error_data: dict):
    """Log frontend error to persistent storage"""
    try:
        ErrorLogManager.add_error(error_data)
        return {
            "status": "success",
            "message": "Error logged successfully"
        }
    except Exception as e:
        logger.error(f"Failed to log error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/get-error-log", tags=["Logging"])
async def get_error_log(limit: int = 50):
    """Retrieve recent errors from log"""
    try:
        errors = ErrorLogManager.get_recent_errors(limit)
        return {
            "status": "success",
            "data": errors,
            "total": len(errors)
        }
    except Exception as e:
        logger.error(f"Failed to retrieve error log: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/clear-error-log", tags=["Logging"])
async def clear_error_log():
    """Clear error log"""
    try:
        ErrorLogManager.clear_errors()
        return {
            "status": "success",
            "message": "Error log cleared"
        }
    except Exception as e:
        logger.error(f"Failed to clear error log: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/compress", tags=["Compress"])
async def compress_image(file: UploadFile = File(...)):
    """Compress an image to reduce file size"""
    try:
        # Validate file type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}"
            )
        
        # Read file content
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower()
        upload_filename = f"{file_id}{file_extension}"
        upload_path = UPLOAD_DIR / upload_filename
        
        # Save uploaded file
        with open(upload_path, "wb") as f:
            f.write(content)
        
        # Determine output format based on file extension
        format_map = {
            '.jpg': 'JPEG',
            '.jpeg': 'JPEG',
            '.png': 'PNG',
            '.webp': 'WEBP',
            '.gif': 'GIF',
            '.bmp': 'BMP'
        }
        output_format = format_map.get(file_extension, 'JPEG')
        
        # Set compression quality based on format
        # For JPEG/WebP: use 75% quality (good compression with acceptable quality)
        # For PNG: optimize and reduce colors if possible
        # For GIF: optimize
        # For BMP: convert to JPEG for compression
        if output_format in ['JPEG', 'WEBP']:
            quality = 75
        elif output_format == 'PNG':
            quality = 90  # PNG is lossless, but we can optimize
        elif output_format == 'GIF':
            quality = 85
        elif output_format == 'BMP':
            # Convert BMP to JPEG for better compression
            output_format = 'JPEG'
            quality = 75
        else:
            quality = 85
        
        # Compress image
        temp_filename = f"{file_id}_compressed{file_extension if output_format != 'JPEG' or file_extension == '.jpg' or file_extension == '.jpeg' else '.jpg'}"
        temp_path = TEMP_DIR / temp_filename
        
        converter = ImageConverter(str(upload_path))
        converter.compress(str(temp_path), output_format, quality=quality)
        
        logger.info(f"Compressed {file.filename} -> {temp_filename} (format: {output_format}, quality: {quality})")
        
        # Return compressed file
        return FileResponse(
            temp_path,
            media_type=f"image/{output_format.lower()}",
            filename=f"compressed_{file.filename}"
        )
        
    except Exception as e:
        logger.error(f"Compression error: {e}")
        ErrorLogManager.log_error(
            error_type="CompressionError",
            message=str(e),
            filename=file.filename if file else "unknown"
        )
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
