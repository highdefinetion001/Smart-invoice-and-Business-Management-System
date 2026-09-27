package com.invoice.management.controller;

import com.invoice.management.model.BusinessSettings;
import com.invoice.management.repository.BusinessSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final BusinessSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<BusinessSettings> getSettings() {
        BusinessSettings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> settingsRepository.save(BusinessSettings.builder().build()));
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<BusinessSettings> updateSettings(@RequestBody BusinessSettings settings) {
        BusinessSettings existing = settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> new BusinessSettings());

        existing.setBusinessName(settings.getBusinessName());
        existing.setLogo(settings.getLogo());
        existing.setAddress(settings.getAddress());
        existing.setPhone(settings.getPhone());
        existing.setEmail(settings.getEmail());
        existing.setGstNumber(settings.getGstNumber());
        existing.setInvoicePrefix(settings.getInvoicePrefix());
        existing.setDefaultTaxRate(settings.getDefaultTaxRate());
        existing.setInvoiceFooter(settings.getInvoiceFooter());
        existing.setBankDetails(settings.getBankDetails());
        existing.setUpiDetails(settings.getUpiDetails());

        return ResponseEntity.ok(settingsRepository.save(existing));
    }
}
