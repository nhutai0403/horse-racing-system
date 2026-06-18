package com.horseracing.dto.request;

import com.horseracing.entities.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {
    private Integer recipientId;
    private String title;
    private String content;
    private NotificationType type;
}
