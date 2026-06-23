package com.horseracing.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceBetRequest {

    @NotNull(message = "Race ID is required")
    private Integer raceId;

    @NotNull(message = "Participant ID is required")
    private Integer participantId;

    @NotNull(message = "Bet amount is required")
    @DecimalMin(value = "0.01", message = "Bet amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Bet type is required")
    @Pattern(regexp = "WIN|PLACE|SHOW", message = "Bet type must be WIN, PLACE, or SHOW")
    private String betType;
}
