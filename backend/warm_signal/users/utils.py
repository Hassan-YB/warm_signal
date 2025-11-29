"""
Utility functions for API responses.

This module provides standardized response formatting to ensure
consistent API response structure across the entire application.
"""

from rest_framework.response import Response
from rest_framework import status
from typing import Any, Dict, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK
) -> Response:
    """
    Create a standardized success response.
    
    Response structure:
    {
        "success": true,
        "message": "Success message",
        "data": { ... }
    }
    
    Args:
        data: Response data (dict, list, or any serializable object)
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Response: Standardized success response
    """
    response_data = {
        "success": True,
        "message": message,
    }
    
    if data is not None:
        response_data["data"] = data
    
    return Response(response_data, status=status_code)


def error_response(
    message: str = "An error occurred",
    errors: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Response:
    """
    Create a standardized error response.
    
    Response structure:
    {
        "success": false,
        "message": "Error message",
        "errors": { ... }  # Optional field-specific errors
    }
    
    Args:
        message: Error message
        errors: Optional dictionary of field-specific errors
        status_code: HTTP status code
    
    Returns:
        Response: Standardized error response
    """
    response_data = {
        "success": False,
        "message": message,
    }
    
    if errors:
        response_data["errors"] = errors
    
    return Response(response_data, status=status_code)

