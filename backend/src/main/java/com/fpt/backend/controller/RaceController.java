package com.fpt.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép React truy cập
public class RaceController {
    @GetMapping("/races")
    public List<Map<String, String>> getRaces() {
        return Arrays.asList(
                Map.of("id", "1", "name", "Giai Dua Ngua Sa Dec", "status", "Upcoming"),
                Map.of("id", "2", "name", "Dai Hoi Ngua Dai Nam", "status", "Live"));
    }
}