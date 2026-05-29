package com.horseracing.controllers;

import com.horseracing.dto.request.RejectUpgradeRequest;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.UpgradeRequestResponse;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.services.UpgradeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/upgrade-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUpgradeRequestController {

    private final UpgradeRequestService upgradeRequestService;

    /**
     * Get all upgrade requests. Filter by status if provided.
     */
    @GetMapping
    public ResponseEntity<?> getAllRequests(@RequestParam(required = false) RequestStatus status) {
        try {
            List<UpgradeRequestResponse> response = upgradeRequestService.getAllRequests(status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Approve an upgrade request.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id) {
        try {
            UpgradeRequestResponse response = upgradeRequestService.approveRequest(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Reject an upgrade request.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Integer id,
            @Valid @RequestBody RejectUpgradeRequest rejectDto) {
        try {
            UpgradeRequestResponse response = upgradeRequestService.rejectRequest(id, rejectDto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
