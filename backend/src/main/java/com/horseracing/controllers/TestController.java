package com.horseracing.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<?> getPublic() {
        return ResponseEntity.ok(Map.of(
                "message", "Public content - accessible by anyone"
        ));
    }

    @GetMapping("/spectator")
    @PreAuthorize("hasRole('SPECTATOR')")
    public ResponseEntity<?> getSpectator() {
        return ResponseEntity.ok(Map.of(
                "message", "Spectator content - accessible by SPECTATOR role"
        ));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('HORSE_OWNER')")
    public ResponseEntity<?> getOwner() {
        return ResponseEntity.ok(Map.of(
                "message", "Horse Owner content - accessible by HORSE_OWNER role"
        ));
    }

    @GetMapping("/jockey")
    @PreAuthorize("hasRole('JOCKEY')")
    public ResponseEntity<?> getJockey() {
        return ResponseEntity.ok(Map.of(
                "message", "Jockey content - accessible by JOCKEY role"
        ));
    }

    @GetMapping("/referee")
    @PreAuthorize("hasRole('RACE_REFEREE')")
    public ResponseEntity<?> getReferee() {
        return ResponseEntity.ok(Map.of(
                "message", "Race Referee content - accessible by RACE_REFEREE role"
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdmin() {
        return ResponseEntity.ok(Map.of(
                "message", "Admin content - accessible by ADMIN role"
        ));
    }

    @GetMapping("/any-role")
    @PreAuthorize("hasAnyRole('SPECTATOR', 'HORSE_OWNER', 'JOCKEY', 'RACE_REFEREE', 'ADMIN')")
    public ResponseEntity<?> getAnyRole() {
        return ResponseEntity.ok(Map.of(
                "message", "Any authenticated role content"
        ));
    }
}
