package com.horseracing.dto.response;

import com.horseracing.entities.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Integer id;
    private Integer userId;
    private String title;
    private String content;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationResponse fromEntity(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
