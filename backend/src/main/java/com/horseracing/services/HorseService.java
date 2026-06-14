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
    private final RaceParticipantRepository raceParticipantRepository;

    @Transactional
    public HorseResponse createHorse(String ownerEmail, CreateHorseRequest request) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        HorseBreed breed = horseBreedRepository.findByBreedName(request.getBreedName())
                .orElseGet(() -> {
                    HorseBreed newBreed = HorseBreed.builder()
                            .breedName(request.getBreedName())
                            .build();
                    return horseBreedRepository.save(newBreed);
                });

        Horse horse = Horse.builder()
                .owner(ownerProfile)
                .breed(breed)
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .trainingStatus("ACTIVE")
                .healthStatus("EXCELLENT")
                .status("ACTIVE")
                .imageUrl(request.getImageUrl())
                .build();

        horse = horseRepository.save(horse);
        return toHorseResponse(horse);
    }

    @Transactional(readOnly = true)
    public List<HorseResponse> getMyHorses(String ownerEmail) {
        return horseRepository.findByOwnerUserEmail(ownerEmail).stream()
                .map(this::toHorseResponse)
                .collect(Collectors.toList());
    }

    private HorseResponse toHorseResponse(Horse horse) {
        List<RaceParticipant> participations = raceParticipantRepository.findByHorseId(horse.getId());
        int totalRaces = 0;
        int top1Count = 0;
        int top2Count = 0;
        int top3Count = 0;

        for (RaceParticipant rp : participations) {
            if (rp.getFinalRank() != null) {
                totalRaces++;
                if (rp.getFinalRank() == 1) {
                    top1Count++;
                } else if (rp.getFinalRank() == 2) {
                    top2Count++;
                } else if (rp.getFinalRank() == 3) {
                    top3Count++;
                }
            }
        }

        double top1Rate = totalRaces > 0 ? ((double) top1Count / totalRaces) * 100.0 : 0.0;
        double top2Rate = totalRaces > 0 ? ((double) top2Count / totalRaces) * 100.0 : 0.0;
        double top3Rate = totalRaces > 0 ? ((double) top3Count / totalRaces) * 100.0 : 0.0;
        boolean isNewbie = totalRaces == 0;

        HorseResponse response = HorseResponse.fromEntity(horse);
        response.setTotalRaces(totalRaces);
        response.setTop1Rate(top1Rate);
        response.setTop2Rate(top2Rate);
        response.setTop3Rate(top3Rate);
        response.setIsNewbie(isNewbie);
        return response;
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
