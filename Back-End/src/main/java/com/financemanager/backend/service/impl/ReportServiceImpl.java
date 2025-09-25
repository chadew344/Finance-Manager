package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.report.SummaryReportDto;
import com.financemanager.backend.entity.Transaction;
import com.financemanager.backend.enumeration.TransactionType;
import com.financemanager.backend.repository.TransactionRepository;
import com.financemanager.backend.service.ChartService;
import com.financemanager.backend.service.ReportService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {
    private final TransactionRepository transactionRepository;
    private final SpringTemplateEngine templateEngine;
    private final ChartService chartService;

    @Override
    public SummaryReportDto generateMonthlySummary(Long userAccountId, int year, int month) {
        try {
            log.info("Generating monthly summary for userAccountId: {}, year: {}, month: {}", userAccountId, year, month);

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            List<Transaction> transactions = transactionRepository.findByFinancialAccount_UserAccount_IdAndTransactionDateBetween(
                    userAccountId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59)
            );

            log.info("Found {} transactions for the period", transactions.size());

            SummaryReportDto report = new SummaryReportDto();

            Map<String, BigDecimal> expensesByCategory = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                    .collect(Collectors.groupingBy(
                            t -> t.getCategory() != null ? t.getCategory().getName() : "Uncategorized",
                            Collectors.reducing(BigDecimal.ZERO, t -> t.getAmount().abs(), BigDecimal::add)
                    ));

            Map<String, BigDecimal> incomeByCategory = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                    .collect(Collectors.groupingBy(
                            t -> t.getCategory() != null ? t.getCategory().getName() : "Uncategorized",
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                    ));

            BigDecimal totalExpenses = expensesByCategory.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalIncome = incomeByCategory.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            report.setTotalExpenses(totalExpenses);
            report.setTotalIncome(totalIncome);
            report.setNetBalance(totalIncome.subtract(totalExpenses));
            report.setExpensesByCategory(expensesByCategory);
            report.setIncomeByCategory(incomeByCategory);

            log.info("Monthly summary generated successfully. Total Income: {}, Total Expenses: {}", totalIncome, totalExpenses);
            return report;
        } catch (Exception e) {
            log.error("Error generating monthly summary for userAccountId: {}", userAccountId, e);
            throw new RuntimeException("Failed to generate monthly summary", e);
        }
    }

    @Override
    public byte[] generatePdfReport(Long userAccountId, int year, int month) throws IOException {
        try {
            log.info("Starting PDF report generation for userAccountId: {}, year: {}, month: {}", userAccountId, year, month);

            SummaryReportDto reportData = generateMonthlySummary(userAccountId, year, month);

            if (reportData == null) {
                throw new IOException("Failed to generate report data");
            }

            String chartImageBase64 = null;
            try {
                if (reportData.getExpensesByCategory() != null && !reportData.getExpensesByCategory().isEmpty()) {
                    chartImageBase64 = chartService.generateExpensesChart(reportData.getExpensesByCategory());
                }
            } catch (Exception e) {
                log.warn("Failed to generate chart, continuing without chart", e);
            }

            Context context = new Context();
            context.setVariable("reportData", reportData);
            context.setVariable("chartImageBase64", chartImageBase64);
            context.setVariable("reportTitle", "Financial Summary for " + month + "/" + year);
            context.setVariable("year", year);
            context.setVariable("month", month);

            String htmlContent;
            try {
                htmlContent = templateEngine.process("report", context);
                if (htmlContent == null || htmlContent.trim().isEmpty()) {
                    throw new IOException("Template processing resulted in empty content");
                }
            } catch (Exception e) {
                log.error("Error processing template", e);
                throw new IOException("Failed to process report template", e);
            }

            ByteArrayOutputStream os = new ByteArrayOutputStream();
            try {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.withHtmlContent(htmlContent, null);
                builder.toStream(os);
                builder.run();

                byte[] pdfBytes = os.toByteArray();
                if (pdfBytes.length == 0) {
                    throw new IOException("PDF generation resulted in empty file");
                }

                log.info("PDF report generated successfully. Size: {} bytes", pdfBytes.length);
                return pdfBytes;
            } catch (Exception e) {
                log.error("Error generating PDF", e);
                throw new IOException("Failed to generate PDF", e);
            } finally {
                os.close();
            }
        } catch (IOException e) {
            log.error("IOException in generatePdfReport", e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in generatePdfReport", e);
            throw new IOException("Unexpected error during PDF generation", e);
        }
    }

    @Override
    public byte[] generateCsvReport(Long userAccountId) throws IOException {
        try {
            log.info("Generating CSV report for userAccountId: {}", userAccountId);

            List<Transaction> transactions = transactionRepository.findByFinancialAccount_UserAccount_Id(userAccountId);

            if (transactions == null) {
                throw new IOException("Failed to retrieve transactions");
            }

            log.info("Found {} transactions for CSV export", transactions.size());

            StringWriter writer = new StringWriter();
            CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                    .withHeader("Date", "Description", "Amount", "Category", "Account", "Type"));

            for (Transaction t : transactions) {
                csvPrinter.printRecord(
                        t.getTransactionDate() != null ? t.getTransactionDate().toLocalDate() : "",
                        t.getDescription() != null ? t.getDescription() : "",
                        t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO,
                        t.getCategory() != null ? t.getCategory().getName() : "Uncategorized",
                        t.getFinancialAccount() != null ? t.getFinancialAccount().getAccountName() : "",
                        t.getTransactionType() != null ? t.getTransactionType() : ""
                );
            }
            csvPrinter.flush();
            csvPrinter.close();

            byte[] csvBytes = writer.toString().getBytes(StandardCharsets.UTF_8);
            log.info("CSV report generated successfully. Size: {} bytes", csvBytes.length);
            return csvBytes;
        } catch (Exception e) {
            log.error("Error generating CSV report for userAccountId: {}", userAccountId, e);
            throw new IOException("Failed to generate CSV report", e);
        }
    }
}