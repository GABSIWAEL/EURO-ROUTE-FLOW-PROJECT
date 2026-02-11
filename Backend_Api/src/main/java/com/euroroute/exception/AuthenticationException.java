package com.euroroute.exception;

/**
 * Exception thrown when authentication fails
 */
public class AuthenticationException extends ApplicationException {
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_FAILED");
    }

    public AuthenticationException(String message, String details) {
        super(message, "AUTHENTICATION_FAILED", details);
    }
}
