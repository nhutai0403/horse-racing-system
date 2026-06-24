package com.horseracing.controllers;

import com.horseracing.dto.request.PlaceBetRequest;
import com.horseracing.dto.response.BetResponse;
import com.horseracing.entities.User;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.BetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
public class BetController {

    private final BetService betService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<BetResponse> placeBet(@Valid @RequestBody PlaceBetRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        BetResponse response = betService.placeBet(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-bets")
    public ResponseEntity<List<BetResponse>> getMyBets(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<BetResponse> response = betService.getUserBets(user);
        return ResponseEntity.ok(response);
    }
}
