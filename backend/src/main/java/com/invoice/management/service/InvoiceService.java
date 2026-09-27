package com.invoice.management.service;

import com.invoice.management.dto.InvoiceItemRequest;
import com.invoice.management.dto.InvoiceRequest;
import com.invoice.management.model.*;
import com.invoice.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final BusinessSettingsRepository settingsRepository;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    public List<Invoice> getInvoicesByStatus(String status) {
        return invoiceRepository.findByStatus(status);
    }

    public List<Invoice> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId);
    }

    public List<Invoice> searchInvoices(String query) {
        return invoiceRepository.searchInvoices(query);
    }

    @Transactional
    public Invoice createInvoice(InvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Generate invoice number
        String prefix = settingsRepository.findAll().stream()
                .findFirst()
                .map(BusinessSettings::getInvoicePrefix)
                .orElse("INV");

        int nextNum = invoiceRepository.findMaxInvoiceNumber(prefix) + 1;
        String invoiceNumber = String.format("%s-%04d", prefix, nextNum);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .invoiceDate(LocalDate.parse(request.getInvoiceDate()))
                .dueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null)
                .paymentTerms(request.getPaymentTerms())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .customerNotes(request.getCustomerNotes())
                .internalNotes(request.getInternalNotes())
                .status(request.getStatus() != null ? request.getStatus() : "UNPAID")
                .items(new ArrayList<>())
                .build();

        // Calculate line items
        BigDecimal subtotal = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItem item = buildInvoiceItem(itemReq, invoice);
                invoice.getItems().add(item);
                subtotal = subtotal.add(item.getLineTotal());
            }
        }

        // Apply discount
        invoice.setSubtotal(subtotal);
        BigDecimal discountAmount = calculateDiscount(subtotal, request.getDiscountType(), request.getDiscountValue());
        invoice.setDiscountAmount(discountAmount);

        // Apply tax
        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal taxRate = BigDecimal.ZERO;
        if (request.getTaxEnabled() != null && request.getTaxEnabled()) {
            taxRate = request.getTaxRate() != null ? request.getTaxRate() :
                    settingsRepository.findAll().stream()
                            .findFirst()
                            .map(BusinessSettings::getDefaultTaxRate)
                            .orElse(new BigDecimal("18.00"));
        }
        invoice.setTaxRate(taxRate);
        BigDecimal taxAmount = taxableAmount.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        invoice.setTaxAmount(taxAmount);

        // Calculate total
        BigDecimal totalAmount = taxableAmount.add(taxAmount);
        invoice.setTotalAmount(totalAmount);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateInvoice(Long id, InvoiceRequest request) {
        Invoice invoice = getInvoiceById(id);
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        invoice.setCustomer(customer);
        invoice.setInvoiceDate(LocalDate.parse(request.getInvoiceDate()));
        invoice.setDueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null);
        invoice.setPaymentTerms(request.getPaymentTerms());
        invoice.setDiscountType(request.getDiscountType());
        invoice.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);
        invoice.setCustomerNotes(request.getCustomerNotes());
        invoice.setInternalNotes(request.getInternalNotes());

        // Clear and rebuild items
        invoice.getItems().clear();
        BigDecimal subtotal = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItem item = buildInvoiceItem(itemReq, invoice);
                invoice.getItems().add(item);
                subtotal = subtotal.add(item.getLineTotal());
            }
        }

        invoice.setSubtotal(subtotal);
        BigDecimal discountAmount = calculateDiscount(subtotal, request.getDiscountType(), request.getDiscountValue());
        invoice.setDiscountAmount(discountAmount);

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal taxRate = BigDecimal.ZERO;
        if (request.getTaxEnabled() != null && request.getTaxEnabled()) {
            taxRate = request.getTaxRate() != null ? request.getTaxRate() :
                    settingsRepository.findAll().stream()
                            .findFirst()
                            .map(BusinessSettings::getDefaultTaxRate)
                            .orElse(new BigDecimal("18.00"));
        }
        invoice.setTaxRate(taxRate);
        BigDecimal taxAmount = taxableAmount.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(taxableAmount.add(taxAmount));

        return invoiceRepository.save(invoice);
    }

    public void deleteInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus("CANCELLED");
        invoiceRepository.save(invoice);
    }

    private InvoiceItem buildInvoiceItem(InvoiceItemRequest itemReq, Invoice invoice) {
        BigDecimal calculatedArea = null;
        BigDecimal quantity = itemReq.getQuantity();
        BigDecimal lineTotal;

        // Dimension-based calculation: width × length = area, area × rate = total
        if (itemReq.getWidth() != null && itemReq.getLength() != null) {
            calculatedArea = itemReq.getWidth().multiply(itemReq.getLength()).setScale(2, RoundingMode.HALF_UP);
            lineTotal = calculatedArea.multiply(itemReq.getRate()).setScale(2, RoundingMode.HALF_UP);
            quantity = calculatedArea;
        } else {
            // Quantity-based: quantity × rate
            if (quantity == null) quantity = BigDecimal.ONE;
            lineTotal = quantity.multiply(itemReq.getRate()).setScale(2, RoundingMode.HALF_UP);
        }

        return InvoiceItem.builder()
                .invoice(invoice)
                .materialId(itemReq.getMaterialId())
                .materialName(itemReq.getMaterialName())
                .rate(itemReq.getRate())
                .unit(itemReq.getUnit())
                .width(itemReq.getWidth())
                .length(itemReq.getLength())
                .quantity(quantity)
                .calculatedArea(calculatedArea)
                .lineTotal(lineTotal)
                .specifications(itemReq.getSpecifications())
                .build();
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, String type, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if ("PERCENTAGE".equalsIgnoreCase(type)) {
            return subtotal.multiply(value).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }
        return value; // Fixed discount
    }
}
