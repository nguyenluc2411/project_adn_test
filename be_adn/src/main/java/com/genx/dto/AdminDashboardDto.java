package com.genx.dto;


import lombok.*;

import java.math.BigDecimal;


@NoArgsConstructor
@Setter
@Getter
@Data
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalUsers;
    private long totalStaff;
    private long totalCustomers;
    private long totalServices;
    private long totalBlogs;
    private long totalPayments;
    private long totalRevenue;

}
