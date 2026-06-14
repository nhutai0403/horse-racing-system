package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHorseRequest {

    @NotBlank(message = "Horse name is required")
    private String name;

    @NotBlank(message = "Breed name is required")
    private String breedName;

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be positive")
    private Integer age;

    private String gender;
    private String imageUrl;
}
