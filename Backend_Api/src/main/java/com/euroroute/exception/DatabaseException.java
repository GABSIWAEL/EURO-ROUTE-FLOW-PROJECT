package com.euroroute.exception;

/**
 * Exception thrown when a database operation fails
 */
public class DatabaseException extends ApplicationException {
    public DatabaseException(String message) {
        super(message, "DATABASE_ERROR");
    }

    public DatabaseException(String message, Throwable cause) {
        super(message, "DATABASE_ERROR", null, cause);
    }

    public DatabaseException(String message, String details, Throwable cause) {
        super(message, "DATABASE_ERROR", details, cause);
    }
}
