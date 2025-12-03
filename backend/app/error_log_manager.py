"""
Error logging module for frontend error tracking
"""
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from app.config import ERROR_LOG_FILE, MAX_ERROR_LOG_SIZE


class ErrorLogManager:
    """Manages error logging to persistent storage"""
    
    @staticmethod
    def add_error(error_data: Dict[str, Any]) -> None:
        """Add an error to the log file"""
        try:
            # Read existing errors
            errors = ErrorLogManager.get_errors()
            
            # Add new error
            errors.append(error_data)
            
            # Keep only recent errors
            if len(errors) > MAX_ERROR_LOG_SIZE:
                errors = errors[-MAX_ERROR_LOG_SIZE:]
            
            # Write back to file
            with open(ERROR_LOG_FILE, 'w', encoding='utf-8') as f:
                json.dump(errors, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Error saving error log: {e}")
    
    @staticmethod
    def get_errors() -> List[Dict[str, Any]]:
        """Retrieve all errors from log file"""
        try:
            if ERROR_LOG_FILE.exists():
                with open(ERROR_LOG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error reading error log: {e}")
            return []
    
    @staticmethod
    def clear_errors() -> None:
        """Clear all errors from log file"""
        try:
            with open(ERROR_LOG_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f)
        except Exception as e:
            print(f"Error clearing error log: {e}")
    
    @staticmethod
    def get_recent_errors(limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent errors (default last 50)"""
        errors = ErrorLogManager.get_errors()
        return errors[-limit:] if limit else errors
