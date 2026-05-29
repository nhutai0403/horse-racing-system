package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectUpgradeRequest {
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}
