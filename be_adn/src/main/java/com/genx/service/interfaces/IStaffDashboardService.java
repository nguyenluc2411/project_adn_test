package com.genx.service.interfaces;

import com.genx.dto.response.BookingSummaryResponse;

import java.util.List;

public interface IStaffDashboardService {

    Long getTotalRevenue();

    Long getTotalBookings();

    Long getTotalCustomers();

    List<BookingSummaryResponse> getLatestBookings();
}
