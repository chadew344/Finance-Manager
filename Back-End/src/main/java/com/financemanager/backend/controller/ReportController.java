package com.financemanager.backend.controller;

import com.financemanager.backend.dto.report.SummaryReportDto;
import com.financemanager.backend.service.ReportService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/report")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<APIResponse<SummaryReportDto>> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month
           ) {
        SummaryReportDto reportData = reportService.generateMonthlySummary(1L, year, month);

        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Monthly summary generated successfully.",
                        reportData
                )
        );
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getMonthlySummaryPdf(
            @RequestParam int year,
            @RequestParam int month
          ) throws IOException {

        byte[] pdfBytes = reportService.generatePdfReport(1L, year, month);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "financial_report_" + month + "_" + year + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping(value = "/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportTransactionsToCsv() throws IOException {
        byte[] csvBytes = reportService.generateCsvReport(1L);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv"));
        headers.setContentDispositionFormData("attachment", "transactions.csv");

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
}
