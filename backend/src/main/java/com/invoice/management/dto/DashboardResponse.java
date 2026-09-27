package com.invoice.management.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private BigDecimal totalSales;
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private BigDecimal totalExpenses;
    private long totalInvoices;
    private BigDecimal currentMonthSales;
    private List<Map<String, Object>> monthlySales;
    private List<Map<String, Object>> expensesByCategory;
}
