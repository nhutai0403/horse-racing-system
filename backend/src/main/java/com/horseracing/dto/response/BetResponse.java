package com.horseracing.dto.response;

import com.horseracing.entities.Bet;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetResponse {
    private Integer id;
    private Integer userId;
    private Integer raceId;
    private Integer participantId;
    private String horseName;
    private BigDecimal amount;
    private BigDecimal odds;
    private String status;
    private String betType;
    private BigDecimal payoutAmount;
    private LocalDateTime createdAt;

    public static BetResponse fromEntity(Bet bet) {
        if (bet == null) return null;
        return BetResponse.builder()
                .id(bet.getId())
                .userId(bet.getUser().getId())
                .raceId(bet.getRace().getId())
                .participantId(bet.getParticipant().getId())
                .horseName(bet.getParticipant().getHorse() != null ? bet.getParticipant().getHorse().getName() : null)
                .amount(bet.getAmount())
                .odds(bet.getOdds())
                .status(bet.getStatus())
                .betType(bet.getBetType())
                .payoutAmount(bet.getPayoutAmount())
                .createdAt(bet.getCreatedAt())
                .build();
    }
}
