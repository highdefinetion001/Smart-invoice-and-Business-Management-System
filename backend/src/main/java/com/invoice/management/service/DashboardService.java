package com.invoice.management.service;

import com.invoice.management.dto.DashboardResponse;
import com.invoice.management.repository.ExpenseRepository;
import com.invoice.management.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardResponse getDashboardData() {
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now.withDayOfMonth(now.lengthOfMonth());

        // Monthly sales for last 6 months
        List<Map<String, Object>> monthlySales = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate start = now.minusMonths(i).withDayOfMonth(1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            BigDecimal sales = invoiceRepository.getSalesBetween(start, end);
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", start.getMonth().toString().substring(0, 3));
            entry.put("year", start.getYear());
            entry.put("sales", sales);
            monthlySales.add(entry);
        }

        // Expenses by category
        List<Map<String, Object>> expensesByCategory = new ArrayList<>();
        for (Object[] row : expenseRepository.getExpensesByCategory()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", row[0]);
            entry.put("amount", row[1]);
            expensesByCategory.add(entry);
        }

        return DashboardResponse.builder()
                .totalSales(invoiceRepository.getTotalSales())
                .totalPaid(invoiceRepository.getTotalPaid())
                .totalPending(invoiceRepository.getTotalPending())
                .totalExpenses(expenseRepository.getTotalExpenses())
                .totalInvoices(invoiceRepository.getActiveInvoiceCount())
                .currentMonthSales(invoiceRepository.getSalesBetween(monthStart, monthEnd))
                .monthlySales(monthlySales)
                .expensesByCategory(expensesByCategory)
                .build();
    }
}
