package com.invoice.management.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    private BigDecimal amount;
    private String paymentDate;
    private String paymentMethod;
    private String reference;
    private String notes;
}
