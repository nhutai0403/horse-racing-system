package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long usersCount;
    private long tournamentsCount;
    private long racesCount;
    private long pendingUpgradesCount;
    private long pendingWithdrawalsCount;

    private List<RevenueDataPoint> revenueData;
    private Map<String, Long> roleDistribution;
    private List<BetVolumeDataPoint> betVolumeData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueDataPoint {
        private String month;
        private BigDecimal val;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BetVolumeDataPoint {
        private String tournament;
        private long bets;
    }
}
