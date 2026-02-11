package com.euroroute.dto;

import java.time.LocalDateTime;

/**
 * Standard error response DTO for all API errors
 */
public class ErrorResponse {
    
    private Integer status;
    private String error;
    private String message;
    private String errorCode;
    private String details;
    private String context;
    private LocalDateTime timestamp;
    private String path;

    public ErrorResponse() {
    }

    public ErrorResponse(Integer status, String error, String message, String errorCode) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(Integer status, String error, String message, String errorCode, String details) {
        this(status, error, message, errorCode);
        this.details = details;
    }

    public ErrorResponse(Integer status, String error, String message, String errorCode, 
                         String details, String context) {
        this(status, error, message, errorCode, details);
        this.context = context;
    }

    // Getters
    public Integer getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getDetails() {
        return details;
    }

    public String getContext() {
        return context;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }

    // Setters
    public void setStatus(Integer status) {
        this.status = status;
    }

    public void setError(String error) {
        this.error = error;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setPath(String path) {
        this.path = path;
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "status=" + status +
                ", error='" + error + '\'' +
                ", message='" + message + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", details='" + details + '\'' +
                ", context='" + context + '\'' +
                ", timestamp=" + timestamp +
                ", path='" + path + '\'' +
                '}';
    }
}
