  package com.horseracing.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.horseracing.dto.request.PlaceBetRequest;
import com.horseracing.dto.response.BetResponse;
import com.horseracing.entities.Bet;
import com.horseracing.entities.BettingTransaction;
import com.horseracing.entities.Race;
import com.horseracing.entities.RaceParticipant;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.entities.enums.Role;
import com.horseracing.exceptions.BusinessException;
import com.horseracing.repositories.BetRepository;
import com.horseracing.repositories.BettingTransactionRepository;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.RaceSimulationRepository;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BetService {

    private final BetRepository betRepository;
    private final RaceRepository raceRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BettingTransactionRepository bettingTransactionRepository;
    private final RaceSimulationRepository raceSimulationRepository;

    @Transactional
    public BetResponse placeBet(User user, PlaceBetRequest request) {
        // 1. Check user role (SPECTATOR, HORSE_OWNER, and JOCKEY are allowed to bet)
        Role role = user.getRole();
        if (role != Role.SPECTATOR && role != Role.HORSE_OWNER && role != Role.JOCKEY) {
            throw new BusinessException("Chỉ người xem (SPECTATOR), chủ ngựa (HORSE_OWNER) và nài ngựa (JOCKEY) mới được phép đặt cược.", HttpStatus.FORBIDDEN);
        }

        // 2. Retrieve and validate Race
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy cuộc đua.", HttpStatus.NOT_FOUND));

        // Validation for JOCKEY and HORSE_OWNER: cannot bet on tournaments they participate in
        if (role == Role.JOCKEY) {
            boolean isParticipating = raceParticipantRepository.existsByJockeyUserIdAndTournamentId(user.getId(), race.getTournament().getId());
            if (isParticipating) {
                throw new BusinessException("Nài ngựa (JOCKEY) không được phép đặt cược trong giải đấu mà mình tham gia.", HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.HORSE_OWNER) {
            boolean isParticipating = raceParticipantRepository.existsByHorseOwnerUserIdAndTournamentId(user.getId(), race.getTournament().getId());
            if (isParticipating) {
                throw new BusinessException("Chủ ngựa (HORSE_OWNER) không được phép đặt cược trong giải đấu mà mình tham gia.", HttpStatus.FORBIDDEN);
            }
        }

        // Betting is only allowed when race status is LOCKED_LIST
        String status = race.getStatus();
        if (!"LOCKED_LIST".equalsIgnoreCase(status)) {
            throw new BusinessException("Cổng đặt cược đã đóng. Đặt cược chỉ khả dụng khi danh sách đã được chốt và công bố.", HttpStatus.BAD_REQUEST);
        }

        // Block placing bets if the simulation has already finished
        boolean isSimFinished = raceSimulationRepository.findByRaceId(race.getId()).stream()
                .anyMatch(sim -> "FINISHED".equalsIgnoreCase(sim.getStatus()));
        if (isSimFinished) {
            throw new BusinessException("Cuộc đua đã chạy xong, cổng đặt cược đã đóng.", HttpStatus.BAD_REQUEST);
        }

        // 3. Retrieve and validate RaceParticipant
        RaceParticipant participant = raceParticipantRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy chú ngựa tham gia cuộc đua.", HttpStatus.NOT_FOUND));

        if (!participant.getRace().getId().equals(race.getId())) {
            throw new BusinessException("Chú ngựa được chọn không tham gia cuộc đua này.", HttpStatus.BAD_REQUEST);
        }

        if ("DISQUALIFIED".equalsIgnoreCase(participant.getStatus())) {
            throw new BusinessException("Chú ngựa này đã bị truất quyền thi đấu trước trận.", HttpStatus.BAD_REQUEST);
        }

        // 4. Validate Min Bet Amount
        BigDecimal minBet = race.getTournament().getMinBetAmount();
        if (minBet != null && request.getAmount().compareTo(minBet) < 0) {
            throw new BusinessException("Số tiền đặt cược phải tối thiểu là " + minBet + " VNĐ.", HttpStatus.BAD_REQUEST);
        }

        // 5. Retrieve Wallet and check balance
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví của người dùng. Vui lòng liên hệ Admin.", HttpStatus.BAD_REQUEST));

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Số dư ví không đủ để thực hiện đặt cược.", HttpStatus.BAD_REQUEST);
        }

        // 6. Deduct balance from Wallet
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        // 7. Create Bet (Odds is initially 1.0 in Pari-Mutuel and will be calculated upon completion)
        Bet bet = Bet.builder()
                .user(user)
                .race(race)
                .participant(participant)
                .amount(request.getAmount())
                .odds(BigDecimal.ONE)
                .status("PENDING")
                .betType(request.getBetType().toUpperCase())
                .build();
        bet = betRepository.save(bet);

        // 8. Create WalletTransaction
        WalletTransaction walletTx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("BET")
                .amount(request.getAmount())
                .status("SUCCESS")
                .referenceType("BET")
                .referenceId(bet.getId())
                .build();
        walletTx = walletTransactionRepository.save(walletTx);

        // 9. Create BettingTransaction
        BettingTransaction bettingTx = BettingTransaction.builder()
                .bet(bet)
                .walletTransaction(walletTx)
                .build();
        bettingTransactionRepository.save(bettingTx);

        return BetResponse.fromEntity(bet);
    }

    @Transactional(readOnly = true)
    public List<BetResponse> getUserBets(User user) {
        List<Bet> bets = betRepository.findByUserId(user.getId());
        return bets.stream()
                .map(BetResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
