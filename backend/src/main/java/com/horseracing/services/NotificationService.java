package com.horseracing.services;

import com.horseracing.dto.response.NotificationResponse;
import com.horseracing.entities.Notification;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.repositories.NotificationRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final Map<Integer, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Transactional
    public Notification sendNotification(User recipient, String title, String content, NotificationType type) {
        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .content(content)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Push notification real-time via SSE
        List<SseEmitter> userEmitters = emitters.get(recipient.getId());
        if (userEmitters != null) {
            NotificationResponse payload = NotificationResponse.fromEntity(saved);
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("NOTIFICATION")
                            .data(payload));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            userEmitters.removeAll(deadEmitters);
        }

        return saved;
    }

    @Transactional
    public Notification sendNotification(Integer recipientId, String title, String content, NotificationType type) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
        return sendNotification(recipient, title, content, type);
    }

    public SseEmitter subscribe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SseEmitter emitter = new SseEmitter(3600000L); // 1 hour timeout

        List<SseEmitter> userEmitters = emitters.computeIfAbsent(user.getId(), k -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);

        emitter.onCompletion(() -> userEmitters.remove(emitter));
        emitter.onTimeout(() -> userEmitters.remove(emitter));
        emitter.onError((e) -> userEmitters.remove(emitter));

        // Send a connection success event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECT")
                    .data("Connected successfully"));
        } catch (Exception e) {
            userEmitters.remove(emitter);
        }

        return emitter;
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(String email, Integer notificationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to access this notification");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notification = notificationRepository.save(notification);

        return NotificationResponse.fromEntity(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unread) {
            notification.setIsRead(true);
            notification.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
    }
}
