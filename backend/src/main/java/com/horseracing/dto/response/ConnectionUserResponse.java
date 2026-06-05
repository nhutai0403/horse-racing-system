package com.horseracing.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectionUserResponse {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String avatar;
    private String friendStatus; // FRIEND, PENDING_SENT, PENDING_RECEIVED, NONE
    private Integer connectionId; // ID of the UserConnection record

    // Jockey fields
    private Integer experienceYears;
    private Double weight;
    private Double height;
    private String licenseNumber;

    // Owner fields
    private String stableName;
    private String stableAddress;
    private String description;
    private Double reputationStars;

    private java.util.List<String> documentUrls;
}
