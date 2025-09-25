const BASE_URL_DASHBOARD = "http://localhost:8080/api/v1/dashboard";

let userAccountId;
let planType = "PERSONAL_FREE";

$(document).ready(function () {
  TokenManager.checkAuthentication();

  initializeDashboard();
});

async function initializeDashboard() {
  console.log("Initializing dashboard...");

  try {
    await loadDashboard();
    SubcriptionManager.initialize();

    await Promise.allSettled([
      loadOverviewData(),
      loadAccountsData(),
      loadRecentTransactions(),
      loadChartData(),
      loadFinancialGoals(),
    ]);

    console.log("Dashboard initialization complete");
    NotificationManager.add("Dashboard loaded successfully", "success");
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    NotificationManager.add("Failed to load dashboard data", "danger");
  }
}

async function loadDashboard() {
  console.log("Starting dashboard load...");

  try {
    const response = await window.apiCall(`${BASE_URL_DASHBOARD}`, {
      method: "GET",
    });

    const data = await response.json();
    console.log("Dashboard data received:", data);

    const userInfo = data.data || data;

    const profileInfo = {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      plan: userInfo.plan,
    };

    DataManager.set("userAccountId", userInfo.userAccountId);
    DataManager.set("firstName", userInfo.firstName);
    DataManager.set("lastName", userInfo.lastName);
    DataManager.set("email", userInfo.email);
    DataManager.set("userPlan", userInfo.plan);

    userAccountId = DataManager.get("userAccountId");
    planType = DataManager.get("userPlan");

    setProfileAvatar(profileInfo);

    console.log("Dashboard loaded successfully");
  } catch (error) {
    console.error("Error loading dashboard:", error);
    throw error;
  }
}

async function setProfileAvatar(profileInfo) {
  let firstName = profileInfo.firstName;
  let lastName = profileInfo.lastName;

  let initials = firstName[0] + lastName[0];

  if (firstName && lastName) {
    $(".user-avatar").text(initials);
    $(".user-name").text(firstName + " " + lastName);
  }

  if (profileInfo.email) {
    $(".user-email").text(profileInfo.email);
  }

  if (lastName) {
    // $(".page-title").text("Welcome " + lastName);
    updatePageTitle(lastName);
  }
}

function updatePageTitle(lastName) {
  const pageTitle = $(".page-title");

  if (lastName) {
    const titleText = "Welcome " + lastName;
    pageTitle.text(titleText);

    if (planType !== "PERSONAL_FREE") {
      const crown = $('<i class="fas fa-crown premium-crown"></i>');
      pageTitle.append(crown);
    }
  }
}

async function loadOverviewData() {
  console.log("Loading overview data...");

  try {
    const overviewData = await getOverviewData();

    updateOverviewCards(overviewData);
  } catch (error) {
    console.error("Error loading overview data:", error);
    updateOverviewCards({
      totalBalance: 0,
      balanceChange: 0,
      monthlyIncome: 0,
      incomeChange: 0,
      monthlyExpenses: 0,
      expensesChange: 0,
      savingsRate: 0,
      savingsChange: 0,
    });
  }
}

function updateOverviewCards(data) {
  $("#totalBalance").text(formatCurrency(data.totalBalance));
  updateChangeIndicator("#balanceChange", data.balanceChange);

  $("#monthlyIncome").text(formatCurrency(data.monthlyIncome));
  updateChangeIndicator("#incomeChange", data.incomeChange);

  $("#monthlyExpenses").text(formatCurrency(data.monthlyExpenses));
  updateChangeIndicator("#expensesChange", data.expensesChange);

  $("#savingsRate").text(data.savingsRate.toFixed(1) + "%");
  updateChangeIndicator("#savingsChange", data.savingsChange);
}

function updateChangeIndicator(selector, changeValue) {
  const $element = $(selector);
  const $icon = $element.find("i");
  const $span = $element.find("span");

  const absValue = Math.abs(changeValue);
  const sign = changeValue >= 0 ? "+" : "";

  $span.text(`${sign}${absValue.toFixed(2)}%`);

  if (changeValue > 0) {
    $element.removeClass("negative neutral").addClass("positive");
    $icon.removeClass("fa-arrow-down fa-minus").addClass("fa-arrow-up");
  } else if (changeValue < 0) {
    $element.removeClass("positive neutral").addClass("negative");
    $icon.removeClass("fa-arrow-up fa-minus").addClass("fa-arrow-down");
  } else {
    $element.removeClass("positive negative").addClass("neutral");
    $icon.removeClass("fa-arrow-up fa-arrow-down").addClass("fa-minus");
  }
}

async function loadAccountsData() {
  console.log("Loading accounts data...");

  const $grid = $("#dashboardAccountsGrid");

  try {
    const response = await window.apiCall(
      `${BASE_URL_DASHBOARD}/financial-accounts/${userAccountId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    const accounts = data.data || [];

    if (accounts.length === 0) {
      $grid.html(`
        <div class="empty-dashboard-state">
          <i class="fas fa-wallet"></i>
          <h3>No Accounts Found</h3>
          <p>Add your first financial account to get started</p>
        </div>
      `);
      return;
    }

    const displayAccounts = accounts.slice(0, 4);
    const accountsHtml = displayAccounts
      .map((account) => createAccountCard(account))
      .join("");

    $grid.html(accountsHtml);

    console.log("Accounts data loaded successfully");
  } catch (error) {
    console.error("Error loading accounts:", error);
    $grid.html(`
      <div class="empty-dashboard-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Accounts</h3>
        <p>Unable to load account information</p>
      </div>
    `);
  }
}

function createAccountCard(account) {
  const accountTypeClass = account.accountType || "BANK";
  const balance = account.balance || 0;
  const accountNumber = account.accountNumber
    ? `****${account.accountNumber.slice(-4)}`
    : "****0000";

  return `
    <div class="account-card ${accountTypeClass}">
      <div class="account-header">
        <div class="account-type">
          <div class="account-icon ${accountTypeClass}">
            <i class="fas ${getAccountIcon(accountTypeClass)}"></i>
          </div>
          <div class="account-info">
            <h3>${account.accountName || "Account"}</h3>
            <div class="account-number">${accountNumber}</div>
          </div>
        </div>
      </div>
      
      <div class="account-balance">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount">${formatCurrency(balance)}</div>
      </div>
      
      <div class="account-details">
        <div class="detail-item">
          <div class="detail-label">Type</div>
          <div class="detail-value">${formatAccountType(accountTypeClass)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Bank</div>
          <div class="detail-value">${account.institutionName || "N/A"}</div>
        </div>
      </div>
    </div>
  `;
}

function getAccountIcon(accountType) {
  const icons = {
    BANK: "fa-university",
    CREDIT_CARD: "fa-credit-card",
    CHECKING: "fa-check-circle",
    SAVINGS: "fa-piggy-bank",
    INVESTMENT: "fa-chart-line",
  };
  return icons[accountType] || "fa-wallet";
}

function formatAccountType(accountType) {
  const types = {
    BANK: "Bank Account",
    CREDIT_CARD: "Credit Card",
    CHECKING: "Checking",
    SAVINGS: "Savings",
    INVESTMENT: "Investment",
  };
  return types[accountType] || "Account";
}

async function loadRecentTransactions() {
  console.log("Loading recent transactions...");

  const $container = $("#recentTransactionsList");

  try {
    const response = await window.apiCall(
      `${BASE_URL_DASHBOARD}/latest-transactions/${userAccountId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    const transactions = data.data || [];

    if (transactions.length === 0) {
      $container.html(`
        <div class="empty-dashboard-state">
          <i class="fas fa-receipt"></i>
          <h3>No Transactions Found</h3>
          <p>Your recent transactions will appear here</p>
        </div>
      `);
      return;
    }

    const transactionsHtml = transactions
      .map((transaction) => createTransactionItem(transaction))
      .join("");
    $container.html(transactionsHtml);

    console.log("Recent transactions loaded successfully");
  } catch (error) {
    console.error("Error loading recent transactions:", error);
    $container.html(`
      <div class="empty-dashboard-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Transactions</h3>
        <p>Unable to load recent transactions</p>
      </div>
    `);
  }
}

// Create transaction item HTML
function createTransactionItem(transaction) {
  const amount = parseFloat(transaction.amount || 0);
  const isPositive = amount > 0;
  const transactionType = isPositive ? "income" : "expense";
  const icon = getTransactionIcon(transaction.category || transactionType);
  const formattedDate = formatDate(transaction.transactionDate);

  return `
    <div class="transaction-item">
      <div class="transaction-icon ${transactionType}">
        <i class="fas ${icon}"></i>
      </div>
      <div class="transaction-details">
        <div class="transaction-description">${
          transaction.description || "Transaction"
        }</div>
        <div class="transaction-category">${
          transaction.category || "General"
        }</div>
      </div>
      <div class="transaction-amount">
        <div class="transaction-value ${isPositive ? "positive" : "negative"}">
          ${formatCurrency(Math.abs(amount))}
        </div>
        <div class="transaction-date">${formattedDate}</div>
      </div>
    </div>
  `;
}

function getTransactionIcon(category) {
  const icons = {
    food: "fa-utensils",
    transport: "fa-car",
    shopping: "fa-shopping-cart",
    entertainment: "fa-film",
    health: "fa-heartbeat",
    education: "fa-graduation-cap",
    salary: "fa-money-check",
    investment: "fa-chart-line",
    transfer: "fa-exchange-alt",
    income: "fa-arrow-down",
    expense: "fa-arrow-up",
  };
  return icons[category.toLowerCase()] || "fa-dollar-sign";
}

// Load chart data
async function loadChartData() {
  console.log("Loading chart data...");

  try {
    await Promise.all([loadSpendingChart(), loadCategoryChart()]);

    console.log("Charts loaded successfully");
  } catch (error) {
    console.error("Error loading charts:", error);
  }
}

// Load spending chart
async function loadSpendingChart() {
  const ctx = document.getElementById("spendingChart");
  if (!ctx) return;

  try {
    // This would typically call your analytics API
    const chartData = await getSpendingChartData();

    new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Expenses",
            data: chartData.expenses,
            borderColor: "rgb(239, 68, 68)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Income",
            data: chartData.income,
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-primary-color"),
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary-color"),
            },
            grid: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--border-color-value"),
            },
          },
          y: {
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary-color"),
              callback: function (value) {
                return formatCurrency(value);
              },
            },
            grid: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--border-color-value"),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading spending chart:", error);
  }
}

// Load category chart
async function loadCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  try {
    const chartData = await getCategoryChartData();

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.values,
            backgroundColor: [
              "#667eea",
              "#f093fb",
              "#4facfe",
              "#11998e",
              "#ff9a9e",
              "#ff6b6b",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-primary-color"),
              padding: 20,
              usePointStyle: true,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading category chart:", error);
  }
}

// Load financial goals
async function loadFinancialGoals() {
  console.log("Loading financial goals...");

  const $grid = $("#financialGoalsGrid");

  try {
    // This would typically call your goals/budget API
    const goals = await getFinancialGoals();

    if (goals.length === 0) {
      $grid.html(`
        <div class="empty-dashboard-state">
          <i class="fas fa-target"></i>
          <h3>No Goals Set</h3>
          <p>Set financial goals to track your progress</p>
        </div>
      `);
      return;
    }

    const goalsHtml = goals.map((goal) => createGoalCard(goal)).join("");
    $grid.html(goalsHtml);

    console.log("Financial goals loaded successfully");
  } catch (error) {
    console.error("Error loading financial goals:", error);
    // Keep sample goals on error
  }
}

// Create goal card HTML
function createGoalCard(goal) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const progressWidth = Math.min(progress, 100);

  return `
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">
          <i class="fas ${getGoalIcon(goal.category)}"></i>
        </div>
        <div class="goal-info">
          <h4>${goal.name}</h4>
          <p class="goal-target">Target: ${formatCurrency(
            goal.targetAmount
          )}</p>
        </div>
      </div>
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressWidth}%"></div>
        </div>
        <div class="progress-text">
          <span class="current">${formatCurrency(goal.currentAmount)}</span>
          <span class="percentage">${progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  `;
}

function getGoalIcon(category) {
  const icons = {
    emergency: "fa-shield-alt",
    car: "fa-car",
    home: "fa-home",
    vacation: "fa-plane",
    education: "fa-graduation-cap",
    investment: "fa-chart-line",
  };
  return icons[category] || "fa-target";
}

async function getOverviewData() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    totalBalance: 15420.5,
    balanceChange: 2.3,
    monthlyIncome: 5200.0,
    incomeChange: 1.2,
    monthlyExpenses: 3850.75,
    expensesChange: -0.8,
    savingsRate: 25.9,
    savingsChange: 3.1,
  };
}

async function getSpendingChartData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    expenses: [2800, 3200, 2900, 3500, 3100, 3850, 3200],
    income: [5000, 5200, 4800, 5500, 5100, 5200, 5400],
  };
}

async function getCategoryChartData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    labels: [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Entertainment",
      "Bills",
      "Other",
    ],
    values: [1200, 800, 600, 400, 1100, 350],
  };
}

async function getFinancialGoals() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      name: "Emergency Fund",
      category: "emergency",
      targetAmount: 10000,
      currentAmount: 6500,
    },
    {
      name: "New Car",
      category: "car",
      targetAmount: 25000,
      currentAmount: 8000,
    },
  ];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

$(document).on("change", "#spendingPeriod", function () {
  const period = $(this).val();
  console.log("Spending period changed to:", period);
  loadSpendingChart();
});
