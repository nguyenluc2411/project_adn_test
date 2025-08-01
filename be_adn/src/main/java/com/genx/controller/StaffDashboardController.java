package com.genx.controller;

import com.genx.dto.response.BookingSummaryResponse;
import com.genx.service.interfaces.IStaffDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/dashboard")
@RequiredArgsConstructor
public class StaffDashboardController {

    private final IStaffDashboardService dashboardService;

    @GetMapping
    public Map<String, Object> getDashboardData() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", dashboardService.getTotalRevenue());
        response.put("totalBookings", dashboardService.getTotalBookings());
        response.put("totalCustomers", dashboardService.getTotalCustomers());
        response.put("latestBookings", dashboardService.getLatestBookings());
        return response;
    }
}
