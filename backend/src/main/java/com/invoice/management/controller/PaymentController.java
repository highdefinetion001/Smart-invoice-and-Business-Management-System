package com.invoice.management.controller;

import com.invoice.management.dto.PaymentRequest;
import com.invoice.management.model.Payment;
import com.invoice.management.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices/{invoiceId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getPayments(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId));
    }

    @PostMapping
    public ResponseEntity<Payment> recordPayment(@PathVariable Long invoiceId, @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.recordPayment(invoiceId, request));
    }
}
