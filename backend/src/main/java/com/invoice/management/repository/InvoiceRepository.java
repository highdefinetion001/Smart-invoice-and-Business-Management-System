package com.invoice.management.repository;

import com.invoice.management.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByStatus(String status);

    List<Invoice> findByCustomerId(Long customerId);

    List<Invoice> findByInvoiceDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoiceNumber, LENGTH(:prefix) + 2) AS int)), 0) FROM Invoice i WHERE i.invoiceNumber LIKE CONCAT(:prefix, '-%')")
    int findMaxInvoiceNumber(@Param("prefix") String prefix);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status != 'CANCELLED'")
    BigDecimal getTotalSales();

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.status != 'CANCELLED'")
    BigDecimal getTotalPaid();

    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i WHERE i.status IN ('UNPAID', 'PARTIAL')")
    BigDecimal getTotalPending();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status != 'CANCELLED'")
    long getActiveInvoiceCount();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :start AND :end AND i.status != 'CANCELLED'")
    BigDecimal getSalesBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT i FROM Invoice i WHERE i.invoiceNumber LIKE %:query% OR i.customer.name LIKE %:query% OR i.customer.phone LIKE %:query%")
    List<Invoice> searchInvoices(@Param("query") String query);
}
