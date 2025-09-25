package com.financemanager.backend.service;

import com.financemanager.backend.dto.report.SummaryReportDto;

import java.io.IOException;

public interface ReportService {
    SummaryReportDto generateMonthlySummary(Long userId, int year, int month);

    byte[] generatePdfReport(Long userId, int year, int month)throws IOException;

    byte[] generateCsvReport(Long userId)throws IOException;
}
