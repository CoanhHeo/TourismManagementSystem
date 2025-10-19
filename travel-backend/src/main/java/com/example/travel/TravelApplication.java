package com.example.travel;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class TravelApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelApplication.class, args);
    }

    @Bean
    CommandLineRunner pingDb(DataSource ds) {
        return args -> {
            try (Connection c = ds.getConnection()) {
                System.out.println(">>> Connected to: " + c.getMetaData().getURL());
                System.out.println(">>> Driver: " + c.getMetaData().getDriverName());
            }
        };
    }
}
