package com.horseracing.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a requested resource is not found.
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id, HttpStatus.NOT_FOUND);
    }
}
