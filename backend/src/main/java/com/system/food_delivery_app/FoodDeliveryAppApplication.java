package com.system.food_delivery_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoodDeliveryAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodDeliveryAppApplication.class, args);
	}

}

// This is the main class for the Food Delivery Application. It uses Spring Boot to run the application. The @SpringBootApplication annotation indicates that this is a Spring Boot application, and the main method starts the application by calling SpringApplication.run().