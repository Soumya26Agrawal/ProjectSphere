package com.cts.mfrp.project_sphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ProjectSphereApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectSphereApplication.class, args);
	}

}
