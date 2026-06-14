package com.horseracing.controllers;

import com.horseracing.dto.request.CreateHorseRequest;
import com.horseracing.dto.request.RegisterRaceRequest;
import com.horseracing.dto.request.UpdateOwnerProfileRequest;
import com.horseracing.dto.response.*;
import com.horseracing.services.HorseService;
import com.horseracing.services.RaceRegistrationService;
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
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('HORSE_OWNER')")
@RequiredArgsConstructor
public class OwnerController {

    private final HorseService horseService;
    private final RaceRegistrationService raceRegistrationService;

    @PostMapping("/horses")
    public ResponseEntity<?> createHorse(@Valid @RequestBody CreateHorseRequest request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            HorseResponse response = horseService.createHorse(userDetails.getUsername(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/horses")
    public ResponseEntity<?> getMyHorses(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<HorseResponse> response = horseService.getMyHorses(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PostMapping("/race-registrations")
    public ResponseEntity<?> submitRegistration(@Valid @RequestBody RegisterRaceRequest request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            RaceRegistrationResponse response = raceRegistrationService.submitRegistration(userDetails.getUsername(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            OwnerProfileResponse response = horseService.getOwnerProfile(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateOwnerProfileRequest request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            OwnerProfileResponse response = horseService.updateOwnerProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
