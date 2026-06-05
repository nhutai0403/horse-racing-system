package com.horseracing.dto.response;

import com.horseracing.entities.Horse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseResponse {
    private Integer id;
    private String name;
    private Integer breedId;
    private String breedName;
    private Integer age;
    private String gender;
    private String trainingStatus;
    private String healthStatus;
    private String status;
    private String imageUrl;

    // Dynamic stats calculated from race history
    private Integer totalRaces;
    private Double top1Rate;
    private Double top2Rate;
    private Double top3Rate;
    private Boolean isNewbie;

    public static HorseResponse fromEntity(Horse h) {
        if (h == null) return null;
        return HorseResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .breedId(h.getBreed().getId())
                .breedName(h.getBreed().getBreedName())
                .age(h.getAge())
                .gender(h.getGender())
                .trainingStatus(h.getTrainingStatus())
                .healthStatus(h.getHealthStatus())
                .status(h.getStatus())
                .imageUrl(h.getImageUrl())
                .build();
    }
}
