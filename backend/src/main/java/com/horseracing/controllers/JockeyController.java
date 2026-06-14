package com.horseracing.controllers;

import com.horseracing.dto.request.UpdateJockeyProfileRequest;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.JockeyProfileResponse;
import com.horseracing.services.JockeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jockey")
@PreAuthorize("hasRole('JOCKEY')")
@RequiredArgsConstructor
public class JockeyController {

    private final JockeyService jockeyService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            JockeyProfileResponse response = jockeyService.getJockeyProfile(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateJockeyProfileRequest request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            JockeyProfileResponse response = jockeyService.updateJockeyProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
