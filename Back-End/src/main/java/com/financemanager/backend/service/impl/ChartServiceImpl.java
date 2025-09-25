package com.financemanager.backend.service.impl;

import com.financemanager.backend.service.ChartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChartServiceImpl implements ChartService {

    @Override
    public String generateExpensesChart(Map<String, BigDecimal> expensesByCategory) throws IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        expensesByCategory.forEach((category, amount) ->
                dataset.addValue(amount.doubleValue(), "Expenses", category)
        );

        JFreeChart barChart = ChartFactory.createBarChart(
                "Expenses by Category",
                "Category",
                "Amount ($)",
                dataset,
                PlotOrientation.VERTICAL,
                true, true, false
        );

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(baos, barChart, 500, 300);

        return Base64.getEncoder().encodeToString(baos.toByteArray());

    }
}
