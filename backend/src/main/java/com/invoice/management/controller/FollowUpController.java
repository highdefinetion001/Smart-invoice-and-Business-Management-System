package com.invoice.management.controller;

import com.invoice.management.dto.FollowUpRequest;
import com.invoice.management.model.FollowUp;
import com.invoice.management.service.FollowUpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService followUpService;

    @GetMapping
    public ResponseEntity<List<FollowUp>> getAllFollowUps(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start != null && end != null) {
            return ResponseEntity.ok(followUpService.getFollowUpsBetween(start, end));
        }
        return ResponseEntity.ok(followUpService.getAllFollowUps());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUp> getFollowUpById(@PathVariable Long id) {
        return ResponseEntity.ok(followUpService.getFollowUpById(id));
    }

    @PostMapping
    public ResponseEntity<FollowUp> createFollowUp(@Valid @RequestBody FollowUpRequest request) {
        return ResponseEntity.ok(followUpService.createFollowUp(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUp> updateFollowUp(@PathVariable Long id, @Valid @RequestBody FollowUpRequest request) {
        return ResponseEntity.ok(followUpService.updateFollowUp(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<FollowUp> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(followUpService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollowUp(@PathVariable Long id) {
        followUpService.deleteFollowUp(id);
        return ResponseEntity.noContent().build();
    }
}
