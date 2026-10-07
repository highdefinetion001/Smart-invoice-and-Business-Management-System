package com.invoice.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "follow_ups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotNull
    @Column(name = "follow_up_date", nullable = false)
    private LocalDate followUpDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, COMPLETED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }
}
