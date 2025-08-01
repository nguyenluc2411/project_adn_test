package com.genx.controller;

import com.genx.dto.AdminDashboardDto;
import com.genx.enums.EPaymentStatus;
import com.genx.repository.IBookingRepository;
import com.genx.service.interfaces.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final IAdminDashboardService dashboardService;


    @GetMapping
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }


    @GetMapping("/revenue")
    public ResponseEntity<Long> getRevenueByExacDate(@RequestParam(required = false) Integer day,
                                           @RequestParam(required = false) Integer month,
                                           @RequestParam(required = false) Integer year) {
        Long revenue = dashboardService.getRevenueByExacDate(day, month, year);
        return ResponseEntity.ok(revenue);
    }
}