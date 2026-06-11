package com.horseracing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HorseRacingApplication {
    public static void main(String[] args) {
        SpringApplication.run(HorseRacingApplication.class, args);
    }
}
