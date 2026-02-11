package com.euroroute.exception;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends ApplicationException {
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
    }

    public ValidationException(String message, String details) {
        super(message, "VALIDATION_ERROR", details);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, "VALIDATION_ERROR", null, cause);
    }
}
