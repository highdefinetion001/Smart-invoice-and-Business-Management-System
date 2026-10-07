package com.invoice.management.service;

import com.invoice.management.dto.FollowUpRequest;
import com.invoice.management.model.Customer;
import com.invoice.management.model.FollowUp;
import com.invoice.management.repository.CustomerRepository;
import com.invoice.management.repository.FollowUpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final CustomerRepository customerRepository;

    public List<FollowUp> getAllFollowUps() {
        return followUpRepository.findAllByOrderByFollowUpDateDesc();
    }

    public FollowUp getFollowUpById(Long id) {
        return followUpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Follow-up not found with id: " + id));
    }

    public List<FollowUp> getFollowUpsBetween(LocalDate start, LocalDate end) {
        return followUpRepository.findByFollowUpDateBetween(start, end);
    }

    public FollowUp createFollowUp(FollowUpRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        FollowUp followUp = FollowUp.builder()
                .customer(customer)
                .title(request.getTitle())
                .followUpDate(request.getFollowUpDate())
                .note(request.getNote())
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "PENDING")
                .build();

        return followUpRepository.save(followUp);
    }

    public FollowUp updateFollowUp(Long id, FollowUpRequest request) {
        FollowUp followUp = getFollowUpById(id);

        if (request.getCustomerId() != null && !request.getCustomerId().equals(followUp.getCustomer().getId())) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));
            followUp.setCustomer(customer);
        }

        followUp.setTitle(request.getTitle());
        followUp.setFollowUpDate(request.getFollowUpDate());
        followUp.setNote(request.getNote());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            followUp.setStatus(request.getStatus());
        }

        return followUpRepository.save(followUp);
    }

    public FollowUp toggleStatus(Long id) {
        FollowUp followUp = getFollowUpById(id);
        if ("COMPLETED".equalsIgnoreCase(followUp.getStatus())) {
            followUp.setStatus("PENDING");
        } else {
            followUp.setStatus("COMPLETED");
        }
        return followUpRepository.save(followUp);
    }

    public void deleteFollowUp(Long id) {
        followUpRepository.deleteById(id);
    }
}
