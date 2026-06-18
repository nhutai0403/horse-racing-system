package com.horseracing.services;

import com.horseracing.dto.response.NotificationResponse;
import com.horseracing.entities.Notification;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.repositories.NotificationRepository;
import com.horseracing.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    public void setUp() {
        user = User.builder()
                .id(1)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        notification = Notification.builder()
                .id(100)
                .user(user)
                .title("Test Title")
                .content("Test Content")
                .type(NotificationType.GENERAL)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testSendNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.sendNotification(user, "Test Title", "Test Content", NotificationType.GENERAL);

        assertNotNull(result);
        assertEquals("Test Title", result.getTitle());
        assertEquals("Test Content", result.getContent());
        assertEquals(NotificationType.GENERAL, result.getType());
        assertFalse(result.getIsRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetMyNotifications() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1)).thenReturn(Arrays.asList(notification));

        List<NotificationResponse> result = notificationService.getMyNotifications("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Title", result.get(0).getTitle());
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(notificationRepository, times(1)).findByUserIdOrderByCreatedAtDesc(1);
    }

    @Test
    void testMarkAsRead() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findById(100)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse result = notificationService.markAsRead("test@example.com", 100);

        assertNotNull(result);
        assertTrue(result.getIsRead());
        assertNotNull(result.getReadAt());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testMarkAllAsRead() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1)).thenReturn(Arrays.asList(notification));

        notificationService.markAllAsRead("test@example.com");

        assertTrue(notification.getIsRead());
        assertNotNull(notification.getReadAt());
        verify(notificationRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testGetUnreadCount() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.countByUserIdAndIsReadFalse(1)).thenReturn(5L);

        long count = notificationService.getUnreadCount("test@example.com");

        assertEquals(5L, count);
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(notificationRepository, times(1)).countByUserIdAndIsReadFalse(1);
    }

    @Test
    void testSendNotificationWithRecipientId() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.sendNotification(1, "Test Title", "Test Content", NotificationType.GENERAL);

        assertNotNull(result);
        assertEquals("Test Title", result.getTitle());
        verify(userRepository, times(1)).findById(1);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testSubscribe() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = notificationService.subscribe("test@example.com");

        assertNotNull(emitter);
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }
}
