package com.horseracing.services;

import com.horseracing.dto.request.RegisterRaceRequest;
import com.horseracing.dto.response.RaceRegistrationResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceRegistrationService {

    private final RaceRegistrationRepository raceRegistrationRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final RaceParticipantRepository raceParticipantRepository;

    @Transactional
    public RaceRegistrationResponse submitRegistration(String ownerEmail, RegisterRaceRequest request) {
        // Validate share percentage
        if (Math.abs((request.getOwnerSharePercent() + request.getJockeySharePercent()) - 100.0) > 0.001) {
            throw new RuntimeException("Total profit sharing percentage must equal 100%");
        }

        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // Check race status
        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is not open for registration");
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        // Verify horse belongs to owner
        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("This horse does not belong to you");
        }

        JockeyProfile jockey = jockeyProfileRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        // Verify horse or jockey is not already registered in this race
        boolean horseRegistered = raceRegistrationRepository.existsByRaceIdAndHorseIdAndStatusNot(
                race.getId(), horse.getId(), "REJECTED");
        if (horseRegistered) {
            throw new RuntimeException("This horse is already registered for this race");
        }

        boolean jockeyRegistered = raceRegistrationRepository.existsByRaceIdAndJockeyIdAndStatusNot(
                race.getId(), jockey.getId(), "REJECTED");
        if (jockeyRegistered) {
            throw new RuntimeException("This jockey is already registered for this race");
        }

        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .horse(horse)
                .jockey(jockey)
                .owner(owner)
                .ownerSharePercent(request.getOwnerSharePercent())
                .jockeySharePercent(request.getJockeySharePercent())
                .status("PENDING")
                .build();

        registration = raceRegistrationRepository.save(registration);
        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getRegistrationsByRace(Integer raceId) {
        return raceRegistrationRepository.findByRaceId(raceId).stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getAllRegistrations() {
        return raceRegistrationRepository.findAll().stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RaceRegistrationResponse approveRegistration(Integer registrationId) {
        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be approved");
        }

        Race race = registration.getRace();
        long approvedCount = raceParticipantRepository.countByRaceId(race.getId());

        if (approvedCount >= race.getMaxHorses()) {
            throw new RuntimeException("Race has reached its maximum slots of " + race.getMaxHorses());
        }

        // Update registration status
        registration.setStatus("APPROVED");
        registration = raceRegistrationRepository.save(registration);

        // Create race participant and assign gate number
        RaceParticipant participant = RaceParticipant.builder()
                .race(race)
                .horse(registration.getHorse())
                .jockey(registration.getJockey())
                .gateNumber((int) approvedCount + 1)
                .status("READY")
                .build();

        raceParticipantRepository.save(participant);

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public RaceRegistrationResponse rejectRegistration(Integer registrationId) {
        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be rejected");
        }

        registration.setStatus("REJECTED");
        registration = raceRegistrationRepository.save(registration);

        return RaceRegistrationResponse.fromEntity(registration);
    }
}
