package com.horseracing.services;

import com.horseracing.dto.request.PlaceBetRequest;
import com.horseracing.dto.response.BetResponse;
import com.horseracing.entities.*;
import com.horseracing.entities.enums.Role;
import com.horseracing.exceptions.BusinessException;
import com.horseracing.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BetServiceTest {

    @Mock private BetRepository betRepository;
    @Mock private RaceRepository raceRepository;
    @Mock private RaceParticipantRepository raceParticipantRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private BettingTransactionRepository bettingTransactionRepository;

    @InjectMocks
    private BetService betService;

    private User spectatorUser;
    private User ownerUser;
    private Race race;
    private RaceParticipant participant;
    private Wallet wallet;

    @BeforeEach
    public void setUp() {
        spectatorUser = User.builder()
                .id(1)
                .fullName("Spectator Test")
                .email("spectator@test.com")
                .role(Role.SPECTATOR)
                .build();

        ownerUser = User.builder()
                .id(2)
                .fullName("Owner Test")
                .email("owner@test.com")
                .role(Role.HORSE_OWNER)
                .build();

        Tournament tournament = Tournament.builder()
                .id(1)
                .minBetAmount(BigDecimal.valueOf(10.0))
                .build();

        race = Race.builder()
                .id(10)
                .status("OPEN_FOR_REGISTER")
                .tournament(tournament)
                .build();

        participant = RaceParticipant.builder()
                .id(100)
                .race(race)
                .status("READY")
                .build();

        wallet = Wallet.builder()
                .id(50)
                .user(spectatorUser)
                .balance(BigDecimal.valueOf(100.0))
                .build();
    }

    @Test
    void testPlaceBet_Success() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));
        when(walletRepository.findByUserId(1)).thenReturn(Optional.of(wallet));

        when(betRepository.save(any(Bet.class))).thenAnswer(invocation -> {
            Bet b = invocation.getArgument(0);
            b.setId(123);
            return b;
        });

        when(walletTransactionRepository.save(any(WalletTransaction.class))).thenAnswer(invocation -> {
            WalletTransaction wt = invocation.getArgument(0);
            wt.setId(999);
            return wt;
        });

        BetResponse response = betService.placeBet(spectatorUser, request);

        assertNotNull(response);
        assertEquals(123, response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals("WIN", response.getBetType());
        assertEquals(0, BigDecimal.valueOf(50.0).compareTo(response.getAmount()));
        assertEquals(0, BigDecimal.valueOf(50.0).compareTo(wallet.getBalance())); // 100 - 50 = 50

        verify(walletRepository, times(1)).save(wallet);
        verify(betRepository, times(1)).save(any(Bet.class));
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
        verify(bettingTransactionRepository, times(1)).save(any(BettingTransaction.class));
    }

    @Test
    void testPlaceBet_NotSpectator() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(ownerUser, request));
        assertEquals("Chỉ người xem (SPECTATOR) mới được phép đặt cược.", exception.getMessage());
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void testPlaceBet_RaceNotFound() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(999)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        when(raceRepository.findById(999)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Không tìm thấy cuộc đua.", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void testPlaceBet_RaceNotOpenForBetting() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        race.setStatus("RUNNING");
        when(raceRepository.findById(10)).thenReturn(Optional.of(race));

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Cuộc đua đã bắt đầu hoặc kết thúc, cổng đặt cược đã đóng.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testPlaceBet_ParticipantNotFound() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(999)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(999)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Không tìm thấy chú ngựa tham gia cuộc đua.", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void testPlaceBet_ParticipantNotMatchRace() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        Race otherRace = Race.builder().id(99).build();
        participant.setRace(otherRace);

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Chú ngựa được chọn không tham gia cuộc đua này.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testPlaceBet_ParticipantDisqualified() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        participant.setStatus("DISQUALIFIED");

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Chú ngựa này đã bị truất quyền thi đấu trước trận.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testPlaceBet_LessThanMinBet() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(5.0)) // min bet is 10.0
                .betType("WIN")
                .build();

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Số tiền đặt cược phải tối thiểu là 10.0 VNĐ.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testPlaceBet_WalletNotFound() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(50.0))
                .betType("WIN")
                .build();

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));
        when(walletRepository.findByUserId(1)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Không tìm thấy ví của người dùng. Vui lòng liên hệ Admin.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testPlaceBet_InsufficientBalance() {
        PlaceBetRequest request = PlaceBetRequest.builder()
                .raceId(10)
                .participantId(100)
                .amount(BigDecimal.valueOf(150.0)) // wallet balance is 100.0
                .betType("WIN")
                .build();

        when(raceRepository.findById(10)).thenReturn(Optional.of(race));
        when(raceParticipantRepository.findById(100)).thenReturn(Optional.of(participant));
        when(walletRepository.findByUserId(1)).thenReturn(Optional.of(wallet));

        BusinessException exception = assertThrows(BusinessException.class, () -> betService.placeBet(spectatorUser, request));
        assertEquals("Số dư ví không đủ để thực hiện đặt cược.", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testGetUserBets() {
        // Set up horse and associate with participant
        Horse horse = Horse.builder().id(4).name("Lightning").build();
        participant.setHorse(horse);

        Bet bet1 = Bet.builder()
                .id(1)
                .user(spectatorUser)
                .race(race)
                .participant(participant)
                .amount(BigDecimal.valueOf(10.0))
                .odds(BigDecimal.ONE)
                .betType("WIN")
                .status("PENDING")
                .build();
        Bet bet2 = Bet.builder()
                .id(2)
                .user(spectatorUser)
                .race(race)
                .participant(participant)
                .amount(BigDecimal.valueOf(20.0))
                .odds(BigDecimal.ONE)
                .betType("WIN")
                .status("PENDING")
                .build();

        when(betRepository.findByUserId(1)).thenReturn(List.of(bet1, bet2));

        List<BetResponse> response = betService.getUserBets(spectatorUser);

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals(1, response.get(0).getId());
        assertEquals(2, response.get(1).getId());
    }
}
