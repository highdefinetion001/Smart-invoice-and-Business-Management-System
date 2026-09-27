package com.invoice.management.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "business_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name")
    private String businessName;

    private String logo;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String phone;

    private String email;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "invoice_prefix")
    @Builder.Default
    private String invoicePrefix = "INV";

    @Column(name = "default_tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultTaxRate = new BigDecimal("18.00");

    @Column(name = "invoice_footer", columnDefinition = "TEXT")
    private String invoiceFooter;

    @Column(name = "bank_details", columnDefinition = "TEXT")
    private String bankDetails;

    @Column(name = "upi_details")
    private String upiDetails;
}
