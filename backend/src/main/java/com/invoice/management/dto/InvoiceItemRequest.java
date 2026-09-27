package com.invoice.management.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemRequest {
    private Long materialId;
    private String materialName;
    private BigDecimal rate;
    private String unit;
    private BigDecimal width;
    private BigDecimal length;
    private BigDecimal quantity;
    private String specifications;
}
