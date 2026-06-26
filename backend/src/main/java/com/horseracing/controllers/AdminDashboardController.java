package com.horseracing.controllers;

import com.horseracing.dto.response.AdminDashboardStatsResponse;
import com.horseracing.entities.Bet;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final RaceRepository raceRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BetRepository betRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        // 1. Core Metrics
        long usersCount = userRepository.count();
        long tournamentsCount = tournamentRepository.count();
        long racesCount = raceRepository.count();
        long pendingUpgradesCount = upgradeRequestRepository.countByStatus(RequestStatus.PENDING);
        long pendingWithdrawalsCount = walletTransactionRepository.countByTransactionTypeAndStatus("WITHDRAW", "PENDING");

        // 2. User Role Distribution
        Map<String, Long> roleDistribution = new LinkedHashMap<>();
        roleDistribution.put("Spectators", userRepository.countByRole(Role.SPECTATOR));
        roleDistribution.put("Owners", userRepository.countByRole(Role.HORSE_OWNER));
        roleDistribution.put("Jockeys", userRepository.countByRole(Role.JOCKEY));
        roleDistribution.put("Referees", userRepository.countByRole(Role.RACE_REFEREE));
        roleDistribution.put("Admins", userRepository.countByRole(Role.ADMIN));

        // 3. Platform Revenue (10% commission on bets placed, aggregated by Month)
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Map<String, BigDecimal> monthlyRevenueMap = new LinkedHashMap<>();
        for (String m : months) {
            monthlyRevenueMap.put(m, BigDecimal.ZERO);
        }

        List<Bet> allBets = betRepository.findAll();
        for (Bet bet : allBets) {
            if (bet.getCreatedAt() != null && bet.getAmount() != null) {
                String mName = bet.getCreatedAt().getMonth().name();
                String mLabel = mName.substring(0, 1).toUpperCase() + mName.substring(1, 3).toLowerCase();
                if (monthlyRevenueMap.containsKey(mLabel)) {
                    // Platform revenue is 10% commission on bet amounts
                    BigDecimal commission = bet.getAmount().multiply(new BigDecimal("0.1"));
                    monthlyRevenueMap.put(mLabel, monthlyRevenueMap.get(mLabel).add(commission));
                }
            }
        }

        List<AdminDashboardStatsResponse.RevenueDataPoint> revenueDataList = new ArrayList<>();
        for (String m : months) {
            revenueDataList.add(new AdminDashboardStatsResponse.RevenueDataPoint(m, monthlyRevenueMap.get(m)));
        }

        // 4. Bet Volume per Tournament
        Map<String, Long> tournamentBetCountMap = new HashMap<>();
        for (Bet bet : allBets) {
            if (bet.getRace() != null && bet.getRace().getTournament() != null) {
                String tName = bet.getRace().getTournament().getTournamentName();
                tournamentBetCountMap.put(tName, tournamentBetCountMap.getOrDefault(tName, 0L) + 1);
            }
        }

        List<AdminDashboardStatsResponse.BetVolumeDataPoint> betVolumeList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : tournamentBetCountMap.entrySet()) {
            betVolumeList.add(new AdminDashboardStatsResponse.BetVolumeDataPoint(entry.getKey(), entry.getValue()));
        }
        
        // If there are no bets yet, create some empty slots for the chart to render neatly
        if (betVolumeList.isEmpty()) {
            betVolumeList.add(new AdminDashboardStatsResponse.BetVolumeDataPoint("No Data Available", 0L));
        }

        // Build Response
        AdminDashboardStatsResponse response = AdminDashboardStatsResponse.builder()
                .usersCount(usersCount)
                .tournamentsCount(tournamentsCount)
                .racesCount(racesCount)
                .pendingUpgradesCount(pendingUpgradesCount)
                .pendingWithdrawalsCount(pendingWithdrawalsCount)
                .roleDistribution(roleDistribution)
                .revenueData(revenueDataList)
                .betVolumeData(betVolumeList)
                .build();

        return ResponseEntity.ok(response);
    }
}
