package com.invoice.management.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {
    private Long customerId;
    private String invoiceDate;
    private String dueDate;
    private String paymentTerms;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal taxRate;
    private Boolean taxEnabled;
    private String customerNotes;
    private String internalNotes;
    private String status;
    private List<InvoiceItemRequest> items;
}
