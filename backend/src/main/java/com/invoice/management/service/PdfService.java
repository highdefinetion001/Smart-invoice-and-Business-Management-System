package com.invoice.management.service;

import com.invoice.management.model.Invoice;
import com.invoice.management.model.InvoiceItem;
import com.invoice.management.model.BusinessSettings;
import com.invoice.management.repository.BusinessSettingsRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {

    private final BusinessSettingsRepository settingsRepository;

    public PdfService(BusinessSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            List<BusinessSettings> settingsList = settingsRepository.findAll();
            BusinessSettings settings = settingsList.isEmpty() ? new BusinessSettings() : settingsList.get(0);

            String html = generateHtml(invoice, settings);

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();

            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private String generateHtml(Invoice invoice, BusinessSettings settings) {
        StringBuilder itemsHtml = new StringBuilder();
        for (InvoiceItem item : invoice.getItems()) {
            String dimensions = (item.getWidth() != null && item.getLength() != null) 
                ? item.getWidth() + " x " + item.getLength() + " = " + item.getCalculatedArea()
                : String.valueOf(item.getQuantity());

            itemsHtml.append("<tr>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getMaterialName()).append("</td>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(dimensions).append(" ").append(item.getUnit()).append("</td>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getRate()).append("</td>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getLineTotal()).append("</td>")
                    .append("</tr>");
        }

        return "<html>" +
                "<head><style>body { font-family: sans-serif; }</style></head>" +
                "<body style='padding: 40px; color: #333;'>" +
                "<div style='text-align: right; font-size: 24px; color: #6366f1; font-weight: bold;'>INVOICE</div>" +
                "<div style='display: flex; justify-content: space-between; margin-top: 20px;'>" +
                "<div>" +
                "<h3>" + (settings.getBusinessName() != null ? settings.getBusinessName() : "Your Company") + "</h3>" +
                "<p>" + (settings.getAddress() != null ? settings.getAddress() : "") + "</p>" +
                "<p>" + (settings.getPhone() != null ? settings.getPhone() : "") + "</p>" +
                "</div>" +
                "<div style='text-align: right;'>" +
                "<p><strong>Invoice #: </strong>" + invoice.getInvoiceNumber() + "</p>" +
                "<p><strong>Date: </strong>" + invoice.getInvoiceDate() + "</p>" +
                "</div>" +
                "</div>" +
                "<hr style='margin: 20px 0; border: 0; border-top: 1px solid #eee;'/>" +
                "<div>" +
                "<h4>Billed To:</h4>" +
                "<p><strong>" + invoice.getCustomer().getName() + "</strong></p>" +
                "<p>" + (invoice.getCustomer().getAddress() != null ? invoice.getCustomer().getAddress() : "") + "</p>" +
                "</div>" +
                "<table style='width: 100%; border-collapse: collapse; margin-top: 30px;'>" +
                "<thead>" +
                "<tr style='background-color: #f4f4f5; text-align: left;'>" +
                "<th style='padding: 10px; border-bottom: 2px solid #ddd;'>Item</th>" +
                "<th style='padding: 10px; border-bottom: 2px solid #ddd;'>Qty / Dimensions</th>" +
                "<th style='padding: 10px; border-bottom: 2px solid #ddd;'>Rate</th>" +
                "<th style='padding: 10px; border-bottom: 2px solid #ddd;'>Amount</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody>" +
                itemsHtml.toString() +
                "</tbody>" +
                "</table>" +
                "<div style='text-align: right; margin-top: 20px; font-size: 16px;'>" +
                "<p>Subtotal: " + invoice.getSubtotal() + "</p>" +
                "<p>Discount: -" + invoice.getDiscountAmount() + "</p>" +
                "<p>Tax: +" + invoice.getTaxAmount() + "</p>" +
                "<h3 style='color: #6366f1;'>Total: " + invoice.getTotalAmount() + "</h3>" +
                "</div>" +
                "<div style='margin-top: 50px; font-size: 12px; color: #666;'>" +
                "<p>" + (settings.getInvoiceFooter() != null ? settings.getInvoiceFooter() : "Thank you for your business.") + "</p>" +
                "</div>" +
                "</body></html>";
    }
}
