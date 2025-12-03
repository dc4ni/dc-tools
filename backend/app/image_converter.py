"""
Image conversion logic using Pillow
"""
from pathlib import Path
from typing import Tuple
from PIL import Image
import io
from app.config import QUALITY_SETTINGS, TEMP_DIR


class ImageConverter:
    """Handle image format conversions"""
    
    @staticmethod
    def get_image_format(file_path: Path) -> str:
        """Get the format of an image"""
        try:
            with Image.open(file_path) as img:
                return img.format.lower() if img.format else "unknown"
        except Exception as e:
            raise ValueError(f"Failed to identify image format: {str(e)}")
    
    @staticmethod
    def get_image_info(file_path: Path) -> dict:
        """Get image information"""
        try:
            with Image.open(file_path) as img:
                return {
                    "format": img.format or "unknown",
                    "size": img.size,
                    "mode": img.mode,
                    "file_size": file_path.stat().st_size,
                }
        except Exception as e:
            raise ValueError(f"Failed to get image info: {str(e)}")
    
    @staticmethod
    def convert_image(
        input_path: Path,
        output_format: str,
        quality: int = None,
        output_path: Path = None
    ) -> Path:
        """
        Convert image to a different format
        
        Args:
            input_path: Path to input image
            output_format: Target format (png, jpg, webp, etc.)
            quality: Conversion quality (1-100, optional)
            output_path: Custom output path (optional)
        
        Returns:
            Path to converted image
        """
        try:
            # Normalize format
            output_format = output_format.lower().strip(".")
            # Normalize jpg to jpeg for Pillow
            if output_format == "jpg":
                output_format = "jpeg"
            
            # Open image
            with Image.open(input_path) as img:
                # Convert RGBA to RGB if converting to JPG
                if output_format in ["jpg", "jpeg", "bmp"] and img.mode in ["RGBA", "LA", "P"]:
                    # Create white background
                    rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                    
                    # Handle different image modes
                    if img.mode == "RGBA":
                        rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
                    elif img.mode == "LA":
                        # Grayscale with alpha
                        img_rgb = img.convert("RGBA")
                        rgb_img.paste(img_rgb, mask=img_rgb.split()[3])
                    elif img.mode == "P":
                        # Palette mode - convert to RGBA first
                        img_rgba = img.convert("RGBA")
                        rgb_img.paste(img_rgba, mask=img_rgba.split()[3])
                    
                    img = rgb_img
                
                # Generate output path if not provided
                if output_path is None:
                    # Use jpg for filenames even though Pillow uses JPEG
                    display_format = "jpg" if output_format == "jpeg" else output_format
                    output_filename = f"{input_path.stem}_converted.{display_format}"
                    output_path = TEMP_DIR / output_filename
                
                # Determine save parameters
                save_format = output_format.upper()
                save_kwargs = {"format": save_format}
                
                # Set quality for lossy formats
                if quality is None:
                    quality = QUALITY_SETTINGS.get(output_format, 85)
                
                if output_format in ["jpeg", "webp"]:
                    save_kwargs["quality"] = quality
                    save_kwargs["optimize"] = True
                elif output_format == "png":
                    save_kwargs["compress_level"] = min(9, quality // 11) if quality else 9
                
                # Save converted image
                img.save(str(output_path), **save_kwargs)
                
                return output_path
        
        except Exception as e:
            raise ValueError(f"Failed to convert image: {str(e)}")
    
    @staticmethod
    def batch_convert(
        input_paths: list,
        output_format: str,
        quality: int = None
    ) -> list:
        """
        Convert multiple images
        
        Args:
            input_paths: List of paths to input images
            output_format: Target format
            quality: Conversion quality
        
        Returns:
            List of paths to converted images
        """
        converted_paths = []
        for input_path in input_paths:
            try:
                output_path = ImageConverter.convert_image(
                    Path(input_path),
                    output_format,
                    quality
                )
                converted_paths.append(output_path)
            except Exception as e:
                # Log error but continue with other images
                print(f"Failed to convert {input_path}: {str(e)}")
                continue
        
        return converted_paths
    
    @staticmethod
    def get_supported_formats() -> dict:
        """Get supported image formats"""
        return {
            "input": ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
            "output": ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
            "conversions": {
                "png": ["jpg", "webp", "bmp", "gif"],
                "jpg": ["png", "webp", "bmp", "gif"],
                "jpeg": ["png", "webp", "bmp", "gif"],
                "gif": ["png", "jpg", "webp", "bmp"],
                "bmp": ["png", "jpg", "webp", "gif"],
                "webp": ["png", "jpg", "bmp", "gif"],
            }
        }
