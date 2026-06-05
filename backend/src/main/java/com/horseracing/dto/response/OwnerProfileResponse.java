package com.horseracing.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerProfileResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String stableName;
    private String stableAddress;
    private String description;
    private Double reputationStars;
    private String bankAccount;
    private String identityNumber;
    private LocalDate dateOfBirth;
    private List<String> documentUrls;
}

