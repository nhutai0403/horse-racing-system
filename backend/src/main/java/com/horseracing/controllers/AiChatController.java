package com.horseracing.controllers;

import com.horseracing.entities.AiChatHistory;
import com.horseracing.entities.User;
import com.horseracing.repositories.AiChatHistoryRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final UserRepository userRepository;
    private final AiChatHistoryRepository aiChatHistoryRepository;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> payload, Authentication authentication) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        User user = null;
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }

        String reply = aiChatService.chat(message, user);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(reply);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        List<AiChatHistory> history = aiChatHistoryRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
        Collections.reverse(history);

        List<Map<String, Object>> response = history.stream().map(h -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("sender", h.getSender());
            map.put("message", h.getMessage());
            map.put("createdAt", h.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearChatHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        aiChatHistoryRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "Chat history cleared successfully"));
    }
}
