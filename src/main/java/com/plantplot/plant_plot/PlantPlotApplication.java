package com.plantplot.plant_plot;

import com.github.alperkurtul.firebaserealtimedatabase.annotation.FirebaseDocumentId;
import com.github.alperkurtul.firebaserealtimedatabase.annotation.FirebaseDocumentPath;
import com.github.alperkurtul.firebaserealtimedatabase.annotation.FirebaseRealtimeDbRepoServiceImpl;
import com.github.alperkurtul.firebaserealtimedatabase.annotation.FirebaseUserAuthKey;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@SpringBootApplication
public class PlantPlotApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlantPlotApplication.class, args);
	}

	@FirebaseDocumentPath("/plants") // Replace with your desired Firebase path
	static class Plant {

		@FirebaseUserAuthKey
		private String authKey;

		@FirebaseDocumentId
		private String firebaseId;

		private String id;
		private String name;
		private BigDecimal price;

		// Getter and setter methods for your properties
	}

}
