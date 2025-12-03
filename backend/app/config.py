"""
Configuration settings for the image converter application
"""
import os
from pathlib import Path

# File paths
BACKEND_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
TEMP_DIR = BACKEND_DIR / "temp"
LOGS_DIR = BACKEND_DIR / "logs"

# Create directories if they don't exist
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# Error log file
ERROR_LOG_FILE = LOGS_DIR / "error_log.json"

# File configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_FORMATS = {"png", "jpg", "jpeg", "gif", "bmp", "webp"}
ALLOWED_MIME_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/webp": "webp",
}

# Conversion quality settings
QUALITY_SETTINGS = {
    "jpg": 85,
    "jpeg": 85,
    "webp": 85,
    "png": 9,
}

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://172.238.14.142:3000",
    "http://172.238.14.142",
    "*",  # Allow all origins in production (you can restrict this later)
]

# Error logging
MAX_ERROR_LOG_SIZE = 100  # Keep last 100 errors
