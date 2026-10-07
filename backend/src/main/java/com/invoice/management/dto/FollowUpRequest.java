package com.invoice.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FollowUpRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Follow-up date is required")
    private LocalDate followUpDate;

    private String note;

    private String status; // Optional, defaults to PENDING
}
