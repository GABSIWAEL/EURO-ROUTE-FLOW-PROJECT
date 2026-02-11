package com.euroroute.exception;

/**
 * Exception thrown when a resource is not found
 */
public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String message) {
        super(message, "NOT_FOUND");
    }

    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s with ID '%s' not found", resourceType, resourceId), "RESOURCE_NOT_FOUND");
        this.setDetails(String.format("Requested %s: %s", resourceType, resourceId));
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, "NOT_FOUND", null, cause);
    }
}
