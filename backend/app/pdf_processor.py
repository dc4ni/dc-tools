"""
PDF processing utilities for merge, split, and compress operations.
"""
import os
import io
from typing import List, Optional
from PyPDF2 import PdfReader, PdfWriter


class PDFProcessor:
    """Handle PDF operations including merge, split, and compress."""
    
    def __init__(self):
        self.temp_dir = os.path.join(os.path.dirname(__file__), '..', 'temp')
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def merge_pdfs(self, pdf_files: List[bytes], compress: bool = False) -> bytes:
        """
        Merge multiple PDF files into one.
        
        Args:
            pdf_files: List of PDF file contents as bytes
            compress: Whether to compress the output
            
        Returns:
            Merged PDF as bytes
        """
        writer = PdfWriter()
        
        # Add all pages from all PDFs
        for pdf_bytes in pdf_files:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            for page in reader.pages:
                writer.add_page(page)
        
        # Write to bytes
        output = io.BytesIO()
        writer.write(output)
        
        if compress:
            output.seek(0)
            return self._compress_pdf(output.read())
        
        output.seek(0)
        return output.read()
    
    def split_pdf(self, pdf_file: bytes, ranges: Optional[str] = None, 
                  compress: bool = False) -> List[bytes]:
        """
        Split PDF into multiple files.
        
        Args:
            pdf_file: PDF file content as bytes
            ranges: Page ranges to split (e.g., "1-3,5-7") or None for all pages
            compress: Whether to compress the outputs
            
        Returns:
            List of PDF files as bytes
        """
        reader = PdfReader(io.BytesIO(pdf_file))
        total_pages = len(reader.pages)
        
        if ranges:
            # Parse ranges like "1-3,5-7"
            page_groups = self._parse_page_ranges(ranges, total_pages)
        else:
            # Split into individual pages
            page_groups = [[i] for i in range(total_pages)]
        
        result_pdfs = []
        
        for page_group in page_groups:
            writer = PdfWriter()
            for page_num in page_group:
                if 0 <= page_num < total_pages:
                    writer.add_page(reader.pages[page_num])
            
            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            
            pdf_bytes = output.read()
            if compress:
                pdf_bytes = self._compress_pdf(pdf_bytes)
            
            result_pdfs.append(pdf_bytes)
        
        return result_pdfs
    
    def _parse_page_ranges(self, ranges: str, total_pages: int) -> List[List[int]]:
        """
        Parse page range string into list of page number groups.
        
        Args:
            ranges: String like "1-3,5-7,10"
            total_pages: Total number of pages in the PDF
            
        Returns:
            List of page number lists (0-indexed)
        """
        page_groups = []
        parts = ranges.split(',')
        
        for part in parts:
            part = part.strip()
            if '-' in part:
                start, end = part.split('-')
                start = int(start.strip()) - 1  # Convert to 0-indexed
                end = int(end.strip()) - 1
                page_groups.append(list(range(start, end + 1)))
            else:
                page_num = int(part.strip()) - 1  # Convert to 0-indexed
                page_groups.append([page_num])
        
        return page_groups
    
    def _compress_pdf(self, pdf_bytes: bytes) -> bytes:
        """
        Compress PDF by reducing image quality and removing redundant data.
        
        Args:
            pdf_bytes: PDF content as bytes
            
        Returns:
            Compressed PDF as bytes
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            writer = PdfWriter()
            
            for page in reader.pages:
                # Compress page content
                page.compress_content_streams()
                writer.add_page(page)
            
            # Write with compression
            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            
            return output.read()
        except Exception as e:
            print(f"Compression error: {e}")
            # Return original if compression fails
            return pdf_bytes
    
    def get_pdf_info(self, pdf_bytes: bytes) -> dict:
        """
        Get information about a PDF file.
        
        Args:
            pdf_bytes: PDF content as bytes
            
        Returns:
            Dictionary with PDF information
        """
        reader = PdfReader(io.BytesIO(pdf_bytes))
        
        return {
            'pages': len(reader.pages),
            'metadata': reader.metadata,
            'size': len(pdf_bytes)
        }


# Global instance
pdf_processor = PDFProcessor()
