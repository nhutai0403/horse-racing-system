package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private RaceParticipant participant;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal odds;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING"; // PENDING, WON, LOST, REFUNDED

    @Builder.Default
    @Column(name = "bet_type", length = 20)
    private String betType = "WIN"; // WIN, PLACE, SHOW

    @Builder.Default
    @Column(name = "payout_amount", precision = 18, scale = 2)
    private BigDecimal payoutAmount = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
