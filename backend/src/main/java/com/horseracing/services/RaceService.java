package com.horseracing.services;

import com.horseracing.dto.request.CreateRaceRequest;
import com.horseracing.dto.response.RaceResponse;
import com.horseracing.entities.Race;
import com.horseracing.entities.RaceTrack;
import com.horseracing.entities.Tournament;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceService {

    private final RaceRepository raceRepository;
    private final TournamentRepository tournamentRepository;
    private final RaceTrackRepository raceTrackRepository;

    @Transactional
    public RaceResponse createRace(CreateRaceRequest request) {
        // Validate max horses
        int maxHorses = request.getMaxHorses();
        if (maxHorses != 7 && maxHorses != 8 && maxHorses != 12) {
            throw new RuntimeException("Maximum participating horses must be either 7, 8, or 12");
        }

        // Validate time sequence
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        // Validate tournament is not already finished
        if ("Finished".equalsIgnoreCase(tournament.getTournamentStatus()) 
                || "Cancelled".equalsIgnoreCase(tournament.getTournamentStatus())) {
            throw new RuntimeException("Cannot create race for a finished or cancelled tournament");
        }

        // Validate race date is not in the past
        if (request.getRaceDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Race date cannot be in the past");
        }

        // Validate race date falls within tournament date range
        if (tournament.getStartDate() != null && request.getRaceDate().isBefore(tournament.getStartDate())) {
            throw new RuntimeException("Race date cannot be before tournament start date");
        }
        if (tournament.getEndDate() != null && request.getRaceDate().isAfter(tournament.getEndDate())) {
            throw new RuntimeException("Race date cannot be after tournament end date");
        }

        RaceTrack raceTrack = raceTrackRepository.findById(request.getRaceTrackId())
                .orElseThrow(() -> new RuntimeException("Race track not found"));

        // Check for timing overlaps on the same track on the same date
        List<Race> existingRaces = raceRepository.findByRaceTrackIdAndRaceDate(request.getRaceTrackId(), request.getRaceDate());
        for (Race existing : existingRaces) {
            // Check if time intervals [startTime, endTime] overlap:
            // new.startTime < existing.endTime && new.endTime > existing.startTime
            if (request.getStartTime().isBefore(existing.getEndTime()) && request.getEndTime().isAfter(existing.getStartTime())) {
                throw new RuntimeException("Race timing overlaps with another race on the same track");
            }
        }

        Race race = Race.builder()
                .raceName(request.getRaceName())
                .tournament(tournament)
                .raceTrack(raceTrack)
                .raceDate(request.getRaceDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .raceRound(request.getRaceRound())
                .maxHorses(request.getMaxHorses())
                .distance(request.getDistance())
                .surfaceType(request.getSurfaceType())
                .weather(request.getWeather())
                .status("OPEN_FOR_REGISTER") // Set to open automatically
                .build();

        race = raceRepository.save(race);
        return RaceResponse.fromEntity(race);
    }

    @Transactional(readOnly = true)
    public List<RaceResponse> getRacesByTournamentId(Integer tournamentId) {
        return raceRepository.findByTournamentId(tournamentId).stream()
                .map(RaceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RaceResponse getRaceById(Integer id) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Race not found"));
        return RaceResponse.fromEntity(race);
    }
}
