package com.horseracing.services;

import com.horseracing.dto.request.CreateRaceRequest;
import com.horseracing.dto.request.RegisterRaceRequest;
import com.horseracing.dto.response.RaceRegistrationResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RaceServiceTest {

    @Mock
    private RaceRepository raceRepository;
    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private RaceTrackRepository raceTrackRepository;
    @Mock
    private HorseOwnerProfileRepository horseOwnerProfileRepository;
    @Mock
    private HorseRepository horseRepository;
    @Mock
    private JockeyProfileRepository jockeyProfileRepository;
    @Mock
    private RaceRegistrationRepository raceRegistrationRepository;
    @Mock
    private RaceParticipantRepository raceParticipantRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private RaceService raceService;

    @InjectMocks
    private RaceRegistrationService raceRegistrationService;

    private Tournament tournament;
    private RaceTrack track;

    @BeforeEach
    public void setUp() {
        tournament = Tournament.builder().id(1).tournamentName("Test Tournament").build();
        track = RaceTrack.builder().id(1).name("Test Track").build();
        assertNotNull(userRepository);
        assertNotNull(horseRepository);
        assertNotNull(jockeyProfileRepository);
        assertNotNull(horseOwnerProfileRepository);
        assertNotNull(notificationService);
    }

    @Test
    void testCreateRace_MaxHorsesInvalid() {
        CreateRaceRequest request = CreateRaceRequest.builder().raceName("Race 1").tournamentId(1)
                .raceTrackId(1).raceDate(LocalDate.now()).startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0)).raceRound(1).maxHorses(5) // Invalid, must be 7, 8, 12
                .distance(1200.0).build();

        Exception exception =
                assertThrows(RuntimeException.class, () -> raceService.createRace(request));
        assertEquals("Maximum participating horses must be either 7, 8, or 12",
                exception.getMessage());
    }

    @Test
    void testCreateRace_TimeOverlaps() {
        CreateRaceRequest request = CreateRaceRequest.builder().raceName("Race 1").tournamentId(1)
                .raceTrackId(1).raceDate(LocalDate.now()).startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0)).raceRound(1).maxHorses(8).distance(1200.0).build();

        // Existing race on same track/day: 08:30 - 09:30 (overlaps with 9:00 - 10:00)
        Race existingRace = Race.builder().id(99).raceName("Existing Race")
                .startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 30)).build();

        when(tournamentRepository.findById(1)).thenReturn(Optional.of(tournament));
        when(raceTrackRepository.findById(1)).thenReturn(Optional.of(track));
        when(raceRepository.findByRaceTrackIdAndRaceDate(eq(1), any(LocalDate.class)))
                .thenReturn(List.of(existingRace));

        Exception exception =
                assertThrows(RuntimeException.class, () -> raceService.createRace(request));
        assertEquals("Race timing overlaps with another race on the same track",
                exception.getMessage());
    }

    @Test
    void testSubmitRegistration_SharePercentInvalid() {
        RegisterRaceRequest request = RegisterRaceRequest.builder().raceId(1).horseId(2).jockeyId(3)
                .ownerSharePercent(70.0).jockeySharePercent(20.0) // 70 + 20 = 90% (invalid)
                .build();

        Exception exception = assertThrows(RuntimeException.class,
                () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertEquals("Total profit sharing percentage must equal 100%", exception.getMessage());
    }

    @Test
    void testApproveRegistration_GateAssignment() {
        Race race = Race.builder().id(1).maxHorses(8).build();

        User ownerUser = User.builder().fullName("Owner Name").email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();

        User jockeyUser = User.builder().fullName("Jockey Name").email("jockey@test.com").build();
        JockeyProfile jockey = JockeyProfile.builder().id(1).user(jockeyUser).build();

        Horse horse = Horse.builder().id(1).name("White Horse").owner(owner).build();

        RaceRegistration registration =
                RaceRegistration.builder().id(1).race(race).owner(owner).horse(horse).jockey(jockey)
                        .ownerSharePercent(70.0).jockeySharePercent(30.0).status("PENDING").build();

        when(raceRegistrationRepository.findById(1)).thenReturn(Optional.of(registration));
        when(raceParticipantRepository.countByRaceId(1)).thenReturn(2L); // 2 existing participants
        when(raceRegistrationRepository.save(any(RaceRegistration.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RaceRegistrationResponse response = raceRegistrationService.approveRegistration(1);

        assertEquals("APPROVED", response.getStatus());
        verify(raceParticipantRepository, times(1)).save(argThat(p -> p.getGateNumber() == 3)); // gate
                                                                                                // number
                                                                                                // should
                                                                                                // be
                                                                                                // count
                                                                                                // +
                                                                                                // 1
                                                                                                // =
                                                                                                // 3
    }
}
