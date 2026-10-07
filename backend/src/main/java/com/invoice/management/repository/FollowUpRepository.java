package com.invoice.management.repository;

import com.invoice.management.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByFollowUpDateBetween(LocalDate start, LocalDate end);
    List<FollowUp> findByCustomerId(Long customerId);
    List<FollowUp> findByStatus(String status);
    List<FollowUp> findAllByOrderByFollowUpDateDesc();
}
