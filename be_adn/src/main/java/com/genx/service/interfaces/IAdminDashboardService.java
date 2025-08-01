package com.genx.service.interfaces;

import com.genx.dto.AdminDashboardDto;

public interface IAdminDashboardService {
    AdminDashboardDto getDashboardData();

    Long getRevenueByExacDate(Integer day, Integer month, Integer year);
}
