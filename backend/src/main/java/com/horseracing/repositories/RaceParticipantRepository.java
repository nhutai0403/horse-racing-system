package com.horseracing.repositories;

import com.horseracing.entities.RaceParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceParticipantRepository extends JpaRepository<RaceParticipant, Integer> {
    List<RaceParticipant> findByRaceId(Integer raceId);
    List<RaceParticipant> findByHorseId(Integer horseId);
    long countByRaceId(Integer raceId);

    List<RaceParticipant> findByJockeyUserEmailAndStatusNot(String email, String status);
    List<RaceParticipant> findByJockeyUserEmailAndStatus(String email, String status);
    List<RaceParticipant> findByJockeyUserEmailAndRaceStatus(String email, String raceStatus);
    java.util.Optional<RaceParticipant> findByRaceIdAndHorseId(Integer raceId, Integer horseId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(rp) > 0 FROM RaceParticipant rp WHERE rp.jockey.user.id = :userId AND rp.race.tournament.id = :tournamentId")
    boolean existsByJockeyUserIdAndTournamentId(@org.springframework.data.repository.query.Param("userId") Integer userId, @org.springframework.data.repository.query.Param("tournamentId") Integer tournamentId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(rp) > 0 FROM RaceParticipant rp WHERE rp.horse.owner.user.id = :userId AND rp.race.tournament.id = :tournamentId")
    boolean existsByHorseOwnerUserIdAndTournamentId(@org.springframework.data.repository.query.Param("userId") Integer userId, @org.springframework.data.repository.query.Param("tournamentId") Integer tournamentId);
}

