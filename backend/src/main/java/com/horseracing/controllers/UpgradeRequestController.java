package com.horseracing.controllers;

import com.horseracing.dto.request.UpgradeRequestSubmit;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.UpgradeRequestResponse;
import com.horseracing.services.UpgradeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/upgrade-requests")
@RequiredArgsConstructor
public class UpgradeRequestController {

    private final UpgradeRequestService upgradeRequestService;

    /**
     * Submit a new upgrade request. Available to SPECTATORs.
     */
    @PostMapping
    @PreAuthorize("hasRole('SPECTATOR')")
    public ResponseEntity<?> submitRequest(
            @Valid @RequestBody UpgradeRequestSubmit requestDto,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            UpgradeRequestResponse response = upgradeRequestService.submitRequest(userDetails.getUsername(), requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Get upgrade requests of the current user. Available to authenticated users.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getUserRequests(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<UpgradeRequestResponse> response = upgradeRequestService.getUserRequests(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
