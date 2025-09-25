package com.financemanager.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

public interface ChartService {
    String generateExpensesChart(Map<String, BigDecimal> expensesByCategory) throws IOException;
}
