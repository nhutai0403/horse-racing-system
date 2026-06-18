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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String dbName = jdbcTemplate.queryForObject("SELECT DB_NAME()", String.class);
        log.info("=== BACKEND IS CONNECTED TO DATABASE: {} ===", dbName);
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

        // Create an initial referee user if not exists
        if (!userRepository.existsByEmail("referee@gmail.com")) {
            User referee = User.builder()
                    .username("referee")
                    .email("referee@gmail.com")
                    .password(passwordEncoder.encode("Referee@12345"))
                    .fullName("Default Referee")
                    .role(Role.RACE_REFEREE)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();
            userRepository.save(referee);
            log.info("Created default referee account: referee@gmail.com / Referee@12345");
        }

        // Initialize Race Tracks
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Sân Phú Thọ").location("Thành phố Hồ Chí Minh").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Sân Đại Nam").location("Bình Dương").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Sân Happy Land").location("Long An").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Sân đua Hà Nội").location("Hà Nội").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Sân đua Đà Nẵng").location("Đà Nẵng").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Sân đua Nha Trang").location("Khánh Hòa").surfaceCondition("EXCELLENT").build(),
                    RaceTrack.builder().name("Sân đua Vũng Tàu").location("Bà Rịa - Vũng Tàu").surfaceCondition("FAIR").build(),
                    RaceTrack.builder().name("Sân đua Cần Thơ").location("Cần Thơ").surfaceCondition("FAIR").build(),
                    RaceTrack.builder().name("Sân đua Hải Phòng").location("Hải Phòng").surfaceCondition("GOOD").build(),
                    RaceTrack.builder().name("Sân đua Đà Lạt").location("Lâm Đồng").surfaceCondition("EXCELLENT").build()
            );
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized 10 default race tracks.");
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
