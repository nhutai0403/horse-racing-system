package com.horseracing.services;

import com.horseracing.dto.request.CreateHorseRequest;
import com.horseracing.dto.request.UpdateOwnerProfileRequest;
import com.horseracing.dto.response.HorseResponse;
import com.horseracing.dto.response.OwnerProfileResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorseService {

    private final HorseRepository horseRepository;
    private final HorseBreedRepository horseBreedRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final UserRepository userRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;

    @Transactional
    public HorseResponse createHorse(String ownerEmail, CreateHorseRequest request) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        HorseBreed breed = horseBreedRepository.findById(request.getBreedId())
                .orElseThrow(() -> new RuntimeException("Horse breed not found"));

        Horse horse = Horse.builder()
                .owner(ownerProfile)
                .breed(breed)
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .color(request.getColor())
                .trainingStatus("ACTIVE")
                .healthStatus("EXCELLENT")
                .speedRating(75.0)
                .status("ACTIVE")
                .build();

        horse = horseRepository.save(horse);
        return HorseResponse.fromEntity(horse);
    }

    @Transactional(readOnly = true)
    public List<HorseResponse> getMyHorses(String ownerEmail) {
        return horseRepository.findByOwnerUserEmail(ownerEmail).stream()
                .map(HorseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OwnerProfileResponse getOwnerProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.HORSE_OWNER)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return OwnerProfileResponse.builder()
                .id(owner.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .stableName(owner.getStableName())
                .stableAddress(owner.getStableAddress())
                .description(owner.getDescription())
                .reputationStars(owner.getReputationStars())
                .bankAccount(owner.getBankAccount())
                .identityNumber(owner.getIdentityNumber())
                .dateOfBirth(owner.getDateOfBirth())
                .documentUrls(documentUrls)
                .build();
    }

    @Transactional
    public OwnerProfileResponse updateOwnerProfile(String email, UpdateOwnerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            owner.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        
        if (request.getStableName() != null) owner.setStableName(request.getStableName());
        if (request.getStableAddress() != null) owner.setStableAddress(request.getStableAddress());
        if (request.getDescription() != null) owner.setDescription(request.getDescription());
        if (request.getBankAccount() != null) owner.setBankAccount(request.getBankAccount());
        if (request.getIdentityNumber() != null) owner.setIdentityNumber(request.getIdentityNumber());
        if (request.getDateOfBirth() != null) owner.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);
        owner = horseOwnerProfileRepository.save(owner);

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.HORSE_OWNER)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return OwnerProfileResponse.builder()
                .id(owner.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .stableName(owner.getStableName())
                .stableAddress(owner.getStableAddress())
                .description(owner.getDescription())
                .reputationStars(owner.getReputationStars())
                .bankAccount(owner.getBankAccount())
                .identityNumber(owner.getIdentityNumber())
                .dateOfBirth(owner.getDateOfBirth())
                .documentUrls(documentUrls)
                .build();
    }
}
