package com.financemanager.backend.enumeration;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum TransactionCat {
    // INCOME
    SALARY(TransactionType.INCOME, "Salary"),
    BUSINESS_INCOME(TransactionType.INCOME, "Business Income"),
    INTEREST_INCOME(TransactionType.INCOME, "Interest Income"),
    DIVIDEND(TransactionType.INCOME, "Dividend"),
    RENTAL_INCOME(TransactionType.INCOME, "Rental Income"),
    CAPITAL_GAIN(TransactionType.INCOME, "Capital Gain"),
    REFUND(TransactionType.INCOME, "Refund"),
    GIFT_INCOME(TransactionType.INCOME, "Gift Income"),

    // EXPENSE
    RENT(TransactionType.EXPENSE, "Rent"),
    UTILITIES(TransactionType.EXPENSE, "Utilities"),
    SALARIES(TransactionType.EXPENSE, "Salaries"),
    PURCHASE(TransactionType.EXPENSE, "Purchase"),
    SUBSCRIPTION(TransactionType.EXPENSE, "Subscription"),
    FOOD(TransactionType.EXPENSE, "Food"),
    TRANSPORT(TransactionType.EXPENSE, "Transport"),
    TRAVEL(TransactionType.EXPENSE, "Travel"),
    LOAN_PAYMENT(TransactionType.EXPENSE, "Loan Payment"),
    TAX(TransactionType.EXPENSE, "Tax"),
    FEES(TransactionType.EXPENSE, "Fees"),
    ENTERTAINMENT(TransactionType.EXPENSE, "Entertainment"),
    DONATION(TransactionType.EXPENSE, "Donation"),
    INSURANCE(TransactionType.EXPENSE, "Insurance"),

    // TRANSFER
    TRANSFER(TransactionType.TRANSFER, "Transfer"),
    INVESTMENT(TransactionType.TRANSFER, "Investment"),
    WITHDRAWAL(TransactionType.TRANSFER, "Withdrawal"),
    DEPOSIT(TransactionType.TRANSFER, "Deposit"),
    LOAN_TAKEN(TransactionType.TRANSFER, "Loan Taken"),
    LOAN_GIVEN(TransactionType.TRANSFER, "Loan Given");

    private final TransactionType category;
    private final String displayName;

}

