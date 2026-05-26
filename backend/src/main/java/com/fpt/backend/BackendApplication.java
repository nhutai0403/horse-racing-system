package com.fpt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; // Nhớ có dòng import này

@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class }) // <--- THÊM ĐOẠN EXCLUDE NÀY
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}