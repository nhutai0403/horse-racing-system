package com.horseracing.configs;

import com.horseracing.entities.HorseBreed;
import com.horseracing.entities.RaceTrack;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.HorseBreedRepository;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RaceTrackRepository raceTrackRepository;
    private final HorseBreedRepository horseBreedRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create an initial admin user if not exists
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default administrator account: admin@gmail.com / Admin@12345");
        }

        // Initialize Race Tracks (Updated to 10 world-famous racecourses)
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Churchill Downs").location("Kentucky, USA").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Ascot Racecourse").location("Berkshire, UK").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Meydan Racecourse").location("Dubai, UAE").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Tokyo Racecourse").location("Tokyo, Japan").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Longchamp Racecourse").location("Paris, France").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Flemington Racecourse").location("Melbourne, Australia").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Saratoga Race Course").location("New York, USA").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Sha Tin Racecourse").location("Hong Kong").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Epsom Downs").location("Surrey, UK").surfaceCondition("FAIR").build(),
                    RaceTrack.builder().name("Chantilly Racecourse").location("Chantilly, France").surfaceCondition("GOOD").build()
            );
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized 10 world-famous race tracks.");
        }

        // Initialize Horse Breeds
        if (horseBreedRepository.count() == 0) {
            List<HorseBreed> breeds = List.of(
                    HorseBreed.builder().breedName("Thoroughbred").build(),
                    HorseBreed.builder().breedName("Arabian").build(),
                    HorseBreed.builder().breedName("Quarter Horse").build()
            );
            horseBreedRepository.saveAll(breeds);
            log.info("Initialized 3 default horse breeds.");
        }
    }
}
