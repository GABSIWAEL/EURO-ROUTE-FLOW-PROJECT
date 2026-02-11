package com.euroroute.exception;

import java.time.LocalDateTime;

/**
 * Base custom exception for all application exceptions
 */
public class ApplicationException extends RuntimeException {
    private String errorCode;
    private String details;
    private LocalDateTime timestamp;
    private String context;

    public ApplicationException(String message) {
        super(message);
        this.timestamp = LocalDateTime.now();
    }

    public ApplicationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
        this.timestamp = LocalDateTime.now();
    }

    public ApplicationException(String message, String errorCode, String details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public ApplicationException(String message, String errorCode, String details, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}
