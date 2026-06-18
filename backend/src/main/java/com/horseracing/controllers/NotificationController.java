package com.horseracing.controllers;

import com.horseracing.dto.request.SendNotificationRequest;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.MessageResponse;
import com.horseracing.dto.response.NotificationResponse;
import com.horseracing.entities.Notification;
import com.horseracing.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<NotificationResponse> response = notificationService.getMyNotifications(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            NotificationResponse response = notificationService.markAsRead(userDetails.getUsername(), id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            notificationService.markAllAsRead(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("All notifications marked as read successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return notificationService.subscribe(userDetails.getUsername());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            long count = notificationService.getUnreadCount(userDetails.getUsername());
            return ResponseEntity.ok(java.util.Collections.singletonMap("unreadCount", count));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> sendManualNotification(@RequestBody SendNotificationRequest request) {
        try {
            Notification notification = notificationService.sendNotification(
                    request.getRecipientId(),
                    request.getTitle(),
                    request.getContent(),
                    request.getType()
            );
            return ResponseEntity.ok(NotificationResponse.fromEntity(notification));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
