package com.system.food_delivery_app.service;

import org.springframework.stereotype.Service;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class TrackingService {

    private static final String LOG_FILE_PATH = "system_activity_logs.txt"; 

    public void logEvent(String action, String details) {
        try {
            File file = new File(LOG_FILE_PATH);
            if (!file.exists()) {
                file.createNewFile();
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String logEntry = String.format("[%s] %-15s | %s%n", timestamp, action, details);

            try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
                writer.write(logEntry);
            }
            System.out.println("AOP Log: " + action + " - " + details);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}