package com.horseracing.services;

import com.horseracing.dto.request.UpdateJockeyProfileRequest;
import com.horseracing.dto.response.JockeyProfileResponse;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.User;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.UpgradeRequestRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JockeyService {

    private final UserRepository userRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;

    @Transactional(readOnly = true)
    public JockeyProfileResponse getJockeyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        JockeyProfile jockey = jockeyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.JOCKEY)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .height(jockey.getHeight())
                .weight(jockey.getWeight())
                .winRate(jockey.getWinRate())
                .experienceYear(jockey.getExperienceYear())
                .rankingScore(jockey.getRankingScore())
                .licenseNumber(jockey.getLicenseNumber())
                .bankAccount(jockey.getBankAccount())
                .approvalStatus(jockey.getApprovalStatus())
                .documentUrls(documentUrls)
                .build();
    }

    @Transactional
    public JockeyProfileResponse updateJockeyProfile(String email, UpdateJockeyProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        JockeyProfile jockey = jockeyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        
        if (request.getHeight() != null) jockey.setHeight(request.getHeight());
        if (request.getWeight() != null) jockey.setWeight(request.getWeight());
        if (request.getExperienceYear() != null) jockey.setExperienceYear(request.getExperienceYear());
        if (request.getLicenseNumber() != null) jockey.setLicenseNumber(request.getLicenseNumber());
        if (request.getBankAccount() != null) jockey.setBankAccount(request.getBankAccount());

        userRepository.save(user);
        jockey = jockeyProfileRepository.save(jockey);

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.JOCKEY)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .height(jockey.getHeight())
                .weight(jockey.getWeight())
                .winRate(jockey.getWinRate())
                .experienceYear(jockey.getExperienceYear())
                .rankingScore(jockey.getRankingScore())
                .licenseNumber(jockey.getLicenseNumber())
                .bankAccount(jockey.getBankAccount())
                .approvalStatus(jockey.getApprovalStatus())
                .documentUrls(documentUrls)
                .build();
    }
}
