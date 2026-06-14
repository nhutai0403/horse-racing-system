package com.horseracing.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHorseRequest {

    private String name;

    private String breedName;

    @Positive(message = "Age must be positive")
    private Integer age;

    private String gender;
    private String imageUrl;
}
