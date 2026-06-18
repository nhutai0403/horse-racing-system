package com.horseracing.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;

import com.horseracing.dto.request.UpdateConditionsRequest;
import com.horseracing.dto.response.RefereeRaceResponse;
import com.horseracing.entities.Bet;
import com.horseracing.entities.Horse;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.PrizeDistribution;
import com.horseracing.entities.Race;
import com.horseracing.entities.RaceParticipant;
import com.horseracing.entities.RaceRegistration;
import com.horseracing.entities.RaceTrack;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.repositories.BanHistoryRepository;
import com.horseracing.repositories.BetRepository;
import com.horseracing.repositories.BlacklistRepository;
import com.horseracing.repositories.HorseRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.PrizeDistributionRepository;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.repositories.RaceRegistrationRepository;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.RaceSimulationRepository;
import com.horseracing.repositories.RefereeFlagRepository;
import com.horseracing.repositories.SimulationHorseStateRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;

@ExtendWith(MockitoExtension.class)
public class RefereeServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RaceRepository raceRepository;
    @Mock private RaceParticipantRepository raceParticipantRepository;
    @Mock private RaceRegistrationRepository raceRegistrationRepository;
    @Mock private JockeyProfileRepository jockeyProfileRepository;
    @Mock private HorseRepository horseRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private BetRepository betRepository;
    @Mock private RaceSimulationRepository raceSimulationRepository;
    @Mock private SimulationHorseStateRepository simulationHorseStateRepository;
    @Mock private RefereeFlagRepository refereeFlagRepository;
    @Mock private BlacklistRepository blacklistRepository;
    @Mock private BanHistoryRepository banHistoryRepository;
    @Mock private PrizeDistributionRepository prizeDistributionRepository;
    @Mock private PlatformTransactionManager transactionManager;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private RefereeService refereeService;

    private User refereeUser;
    private RaceTrack track;
    private Tournament tournament;
    private Race race;

    @BeforeEach
    public void setUp() {
        assertNotNull(jockeyProfileRepository);
        assertNotNull(horseRepository);
        assertNotNull(raceSimulationRepository);
        assertNotNull(simulationHorseStateRepository);
        assertNotNull(refereeFlagRepository);
        assertNotNull(blacklistRepository);
        assertNotNull(banHistoryRepository);
        assertNotNull(transactionManager);
        assertNotNull(notificationService);

        refereeUser = User.builder().id(3).fullName("Test Referee").email("referee@test.com").build();
        track = RaceTrack.builder().id(1).name("Grand National Track").surfaceCondition("Good").build();
        tournament = Tournament.builder()
                .id(1)
                .tournamentName("Spring Championship 2026")
                .prizeFirst(BigDecimal.valueOf(1000.0))
                .prizeSecond(BigDecimal.valueOf(500.0))
                .prizeThird(BigDecimal.valueOf(250.0))
                .build();
        race = Race.builder()
                .id(5)
                .raceName("Vòng loại 1")
                .tournament(tournament)
                .raceTrack(track)
                .referee(refereeUser)
                .status("Upcoming")
                .weather("Sunny")
                .build();
    }

    @Test
    void testGetAssignedRaces() {
        when(userRepository.findByEmail("referee@test.com")).thenReturn(Optional.of(refereeUser));
        when(raceRepository.findByRefereeId(3)).thenReturn(List.of(race));

        List<RefereeRaceResponse> assigned = refereeService.getAssignedRaces("referee@test.com", "upcoming");
        assertEquals(1, assigned.size());
        assertEquals("Vòng loại 1", assigned.get(0).getRaceName());
    }

    @Test
    void testUpdateConditions() {
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(raceRepository.save(any(Race.class))).thenAnswer(i -> i.getArgument(0));

        UpdateConditionsRequest req = UpdateConditionsRequest.builder()
                .weather("Rainy")
                .trackCondition("Muddy")
                .build();

        RefereeRaceResponse res = refereeService.updateConditions(5, req);
        assertEquals("Rainy", res.getWeather());
        assertEquals("Muddy", res.getSurfaceType());
    }

    @Test
    void testDisqualifyParticipantAndRefund() {
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).build();
        JockeyProfile jockey = JockeyProfile.builder().id(2).user(User.builder().id(11).email("jockey@test.com").build()).build();
        RaceParticipant participant = RaceParticipant.builder().id(12).race(race).horse(horse).jockey(jockey).status("READY").build();

        User bettorUser = User.builder().id(20).email("bettor@test.com").build();
        Wallet bettorWallet = Wallet.builder().id(100).user(bettorUser).balance(BigDecimal.valueOf(100.0)).build();
        Bet bet = Bet.builder().id(50).user(bettorUser).amount(BigDecimal.valueOf(50.0)).status("PENDING").build();

        RaceRegistration reg = RaceRegistration.builder()
                .owner(owner)
                .jockey(jockey)
                .build();

        when(raceParticipantRepository.findById(12)).thenReturn(Optional.of(participant));
        when(raceRegistrationRepository.findFirstByRaceIdAndHorseId(5, 4)).thenReturn(Optional.of(reg));
        when(betRepository.findByParticipantIdAndStatus(12, "PENDING")).thenReturn(List.of(bet));
        when(walletRepository.findByUserId(20)).thenReturn(Optional.of(bettorWallet));

        refereeService.disqualifyParticipant(5, 12, "Overweight");

        assertEquals("DISQUALIFIED", participant.getStatus());
        assertEquals("REFUNDED", bet.getStatus());
        assertEquals(BigDecimal.valueOf(150.0), bettorWallet.getBalance());
        verify(walletRepository, times(1)).save(bettorWallet);
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void testConfirmResultsAndPrizeAndBetPayout() {
        race.setStatus("RUNNING");
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).build();
        
        User jockeyUser = User.builder().id(11).email("jockey@test.com").build();
        JockeyProfile jockey = JockeyProfile.builder().id(2).user(jockeyUser).build();

        RaceParticipant p1 = RaceParticipant.builder().id(12).race(race).horse(horse).jockey(jockey).finalRank(1).status("FINISHED").build();

        User bettorUser = User.builder().id(20).email("bettor@test.com").build();
        Wallet bettorWallet = Wallet.builder().id(100).user(bettorUser).balance(BigDecimal.valueOf(100.0)).build();
        Bet bet = Bet.builder().id(50).user(bettorUser).participant(p1).amount(BigDecimal.valueOf(50.0)).odds(BigDecimal.valueOf(2.5)).status("PENDING").build();

        Wallet ownerWallet = Wallet.builder().id(101).user(ownerUser).balance(BigDecimal.valueOf(0.0)).build();
        Wallet jockeyWallet = Wallet.builder().id(102).user(jockeyUser).balance(BigDecimal.valueOf(0.0)).build();

        RaceRegistration reg = RaceRegistration.builder()
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .owner(owner)
                .jockey(jockey)
                .build();

        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findByRaceId(5)).thenReturn(List.of(p1));
        when(raceRegistrationRepository.findFirstByRaceIdAndHorseId(5, 4)).thenReturn(Optional.of(reg));
        when(walletRepository.findByUserId(10)).thenReturn(Optional.of(ownerWallet));
        when(walletRepository.findByUserId(11)).thenReturn(Optional.of(jockeyWallet));
        when(betRepository.findByRaceId(5)).thenReturn(List.of(bet));
        when(walletRepository.findByUserId(20)).thenReturn(Optional.of(bettorWallet));

        refereeService.confirmResults(5);

        assertEquals("FINISHED", race.getStatus());
        assertEquals("WON", bet.getStatus());
        assertEquals(0, BigDecimal.valueOf(125.0).compareTo(bet.getPayoutAmount())); // 50 * 2.5 = 125
        assertEquals(0, BigDecimal.valueOf(225.0).compareTo(bettorWallet.getBalance())); // 100 + 125 = 225

        // Prize: First place gets 1000.0 -> 70% to owner (700) and 30% to jockey (300)
        assertEquals(0, BigDecimal.valueOf(700.0).compareTo(ownerWallet.getBalance()));
        assertEquals(0, BigDecimal.valueOf(300.0).compareTo(jockeyWallet.getBalance()));

        verify(prizeDistributionRepository, times(1)).save(any(PrizeDistribution.class));
        verify(walletTransactionRepository, atLeastOnce()).save(any(WalletTransaction.class));
    }
}
