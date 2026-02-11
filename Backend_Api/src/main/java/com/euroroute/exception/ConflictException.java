package com.euroroute.exception;

/**
 * Exception thrown when there's a conflict (e.g., duplicate resource)
 */
public class ConflictException extends ApplicationException {
    public ConflictException(String message) {
        super(message, "CONFLICT");
    }

    public ConflictException(String resourceType, String identifier) {
        super(String.format("%s with identifier '%s' already exists", resourceType, identifier), "DUPLICATE_RESOURCE");
        this.setDetails(String.format("Attempted to create duplicate %s: %s", resourceType, identifier));
    }
}
