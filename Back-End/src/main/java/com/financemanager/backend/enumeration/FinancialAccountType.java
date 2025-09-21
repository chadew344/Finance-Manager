package com.financemanager.backend.enumeration;

import lombok.Getter;

@Getter
public enum FinancialAccountType {
    CHECKING("Checking Account", "For day-to-day transactions and payments."),
    SAVINGS("Savings Account", "For holding funds and earning interest."),
    CREDIT_CARD("Credit Card", "For tracking credit spending and managing debt."),
    LOAN("Loan", "To represent money borrowed, such as a mortgage or car loan."),
    INVESTMENT("Investment Account", "For tracking assets like stocks and bonds."),
    CASH("Cash", "For managing physical money on hand."),
    OTHER("Other", "A catch-all for any other account type.");

    private final String displayName;
    private final String description;

    FinancialAccountType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
