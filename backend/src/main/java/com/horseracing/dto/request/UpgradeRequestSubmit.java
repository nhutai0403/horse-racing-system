package com.horseracing.dto.request;

import com.horseracing.entities.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpgradeRequestSubmit {
    @NotNull(message = "Requested role is required")
    private Role requestedRole;
    
    private String notes;
}
