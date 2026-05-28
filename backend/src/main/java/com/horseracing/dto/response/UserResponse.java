package com.horseracing.dto.response;

import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
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
public class UserResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private AuthProvider provider;
    private boolean enabled;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .provider(user.getProvider())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
