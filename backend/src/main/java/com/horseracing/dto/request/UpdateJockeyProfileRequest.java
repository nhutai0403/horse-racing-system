package com.horseracing.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJockeyProfileRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Double height;
    private Double weight;
    private Integer experienceYear;
    private String licenseNumber;
    private String bankAccount;
}
