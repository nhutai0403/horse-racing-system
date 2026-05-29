package com.horseracing.dto.response;

import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpgradeRequestResponse {
    private Integer id;
    private Integer userId;
    private String userEmail;
    private String userFullName;
    private Role requestedRole;
    private RequestStatus status;
    private String notes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UpgradeRequestResponse fromEntity(UpgradeRequest request) {
        return UpgradeRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userEmail(request.getUser().getEmail())
                .userFullName(request.getUser().getFullName())
                .requestedRole(request.getRequestedRole())
                .status(request.getStatus())
                .notes(request.getNotes())
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
