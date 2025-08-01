package com.genx.config;

import com.genx.entity.KitStock;
import com.genx.entity.Service;
import com.genx.enums.ECaseType;
import com.genx.repository.IKitStockRepository;
import com.genx.repository.IServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@Component
public class ServiceDataInitializer implements CommandLineRunner {

    @Autowired
    private IServiceRepository serviceRepository;

    @Autowired
    private IKitStockRepository kitStockRepository;

    @Override
    public void run(String... args) {
        if (serviceRepository.count() == 0) {
            List<Service> services = List.of(
                    Service.builder()
                            .name("Xét nghiệm huyết thống cha - con")
                            .price(2000000D)
                            .enabled(true)
                            .caseType(ECaseType.CIVIL)
                            .build(),
                    Service.builder()
                            .name("Xét nghiệm huyết thống mẹ - con")
                            .price(2000000D)
                            .enabled(true)
                            .caseType(ECaseType.CIVIL)
                            .build(),
                    Service.builder()
                            .name("Xét nghiệm quan hệ anh/chị/em")
                            .price(2500000D)
                            .enabled(true)
                            .caseType(ECaseType.CIVIL)
                            .build(),
                    Service.builder()
                            .name("Xét nghiệm hành chính cấp giấy khai sinh")
                            .price(3000000D)
                            .enabled(true)
                            .caseType(ECaseType.ADMINISTRATIVE)
                            .build(),
                    Service.builder()
                            .name("Xét nghiệm phục vụ di trú")
                            .price(5000000D)
                            .enabled(true)
                            .caseType(ECaseType.ADMINISTRATIVE)
                            .build()
            );

            serviceRepository.saveAll(services);
            System.out.println("Sample services inserted.");
        } else {
            System.out.println("Services already exist.");
        }


        if (!kitStockRepository.existsById(1L)) {
            KitStock stock = KitStock.builder()
                    .id(1L)
                    .totalQuantity(100)
                    .remainingQuantity(100)
                    .lastUpdated(LocalDateTime.now())
                    .build();
            kitStockRepository.save(stock);
            System.out.println("Kit stock initialized.");
        } else {
            System.out.println("Kit stock already exists.");
        }
    }

    }

