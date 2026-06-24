package com.horseracing.services;

import com.horseracing.dto.request.PlaceBetRequest;
import com.horseracing.dto.response.BetResponse;
import com.horseracing.entities.*;
import com.horseracing.entities.enums.Role;
import com.horseracing.exceptions.BusinessException;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BetService {

    private final BetRepository betRepository;
    private final RaceRepository raceRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BettingTransactionRepository bettingTransactionRepository;

    @Transactional
    public BetResponse placeBet(User user, PlaceBetRequest request) {
        // 1. Check user role (must be SPECTATOR)
        if (user.getRole() != Role.SPECTATOR) {
            throw new BusinessException("Chỉ người xem (SPECTATOR) mới được phép đặt cược.", HttpStatus.FORBIDDEN);
        }

        // 2. Retrieve and validate Race
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy cuộc đua.", HttpStatus.NOT_FOUND));

        // Betting is only allowed when race status is OPEN_FOR_REGISTER or CLOSED_FOR_REGISTER
        String status = race.getStatus();
        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(status) && !"CLOSED_FOR_REGISTER".equalsIgnoreCase(status)) {
            throw new BusinessException("Cuộc đua đã bắt đầu hoặc kết thúc, cổng đặt cược đã đóng.", HttpStatus.BAD_REQUEST);
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
