package com.genx;

import     org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EntityScan(basePackages = "com.genx.entity")
public class SwpDnaGenxApplication {

    public static void main(String[] args) {
        SpringApplication.run(SwpDnaGenxApplication.class, args);
    }

}
