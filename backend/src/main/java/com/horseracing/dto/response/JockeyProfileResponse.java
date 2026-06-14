package com.horseracing.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyProfileResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    
    private Double height;
    private Double weight;
    private Double winRate;
    private Integer experienceYear;
    private Integer rankingScore;
    private String licenseNumber;
    private String bankAccount;
    private String approvalStatus;
    
    private List<String> documentUrls;
}
