$(document).ready(function () {
  TokenManager.checkAuthentication();
  DataManager.setProfileInfo();

  SubcriptionManager.initialize();
  initializeBudgetManagement();
});

let budgetData = {
  categories: [],
  goals: [],
  summary: {},
  transactions: [],
};

async function initializeBudgetManagement() {
  console.log("Initializing budget management...");

  try {
    await Promise.allSettled([
      loadBudgetSummary(),
      loadBudgetCategories(),
      loadBudgetGoals(),
      loadBudgetInsights(),
    ]);

    initializeBudgetEventHandlers();

    console.log("Budget management initialization complete");
    NotificationManager.add("Budget data loaded successfully", "success");
  } catch (error) {
    console.error("Budget initialization failed:", error);
    NotificationManager.add("Failed to load budget data", "danger");
  }
}

function initializeBudgetEventHandlers() {
  $("#budgetPeriod").on("change", handlePeriodChange);

  $(".view-btn").on("click", handleViewToggle);

  $("#addBudgetCategory").on("click", () => openCategoryModal());

  $("#addFinancialGoal").on("click", () => openGoalModal());

  $("#exportBudget").on("click", handleExportBudget);

  $("#closeCategoryModal, #cancelCategory").on("click", closeCategoryModal);
  $("#closeGoalModal, #cancelGoal").on("click", closeGoalModal);

  $("#categoryForm").on("submit", handleCategorySubmit);
  $("#goalForm").on("submit", handleGoalSubmit);

  $(".color-option").on("click", handleColorSelection);

  $(".modal").on("click", function (e) {
    if (e.target === this) {
      closeCategoryModal();
      closeGoalModal();
    }
  });

  console.log("Budget event handlers initialized");
}

async function loadBudgetSummary() {
  console.log("Loading budget summary...");

  try {
    const summaryData = await getBudgetSummaryData();

    updateBudgetSummary(summaryData);
    budgetData.summary = summaryData;
  } catch (error) {
    console.error("Error loading budget summary:", error);
    // Set fallback data
    updateBudgetSummary({
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      budgetHealth: "Unknown",
    });
  }
}

// Update budget summary cards
function updateBudgetSummary(data) {
  $("#totalBudget").text(formatCurrency(data.totalBudget));
  $("#totalSpent").text(formatCurrency(data.totalSpent));
  $("#remainingBudget").text(formatCurrency(data.remainingBudget));
  $("#budgetHealth").text(data.budgetHealth);

  // Update health indicator color
  const healthCard = $(".budget-health");
  healthCard.removeClass("good warning danger");

  if (data.budgetHealth === "Good") {
    healthCard.addClass("good");
  } else if (data.budgetHealth === "Warning") {
    healthCard.addClass("warning");
  } else if (data.budgetHealth === "Over Budget") {
    healthCard.addClass("danger");
  }
}

// Load budget categories
async function loadBudgetCategories() {
  console.log("Loading budget categories...");

  const $container = $("#budgetCategoriesContainer");

  try {
    const categories = await getBudgetCategoriesData();
    budgetData.categories = categories;

    if (categories.length === 0) {
      $container.html(`
        <div class="empty-budget-state">
          <i class="fas fa-chart-pie"></i>
          <h3>No Budget Categories</h3>
          <p>Create your first budget category to start tracking expenses</p>
        </div>
      `);
      return;
    }

    renderBudgetCategories(categories);
    console.log("Budget categories loaded successfully");
  } catch (error) {
    console.error("Error loading budget categories:", error);
    $container.html(`
      <div class="empty-budget-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Categories</h3>
        <p>Unable to load budget categories</p>
      </div>
    `);
  }
}

// Render budget categories
function renderBudgetCategories(categories) {
  const $container = $("#budgetCategoriesContainer");
  const isListView = $container.hasClass("list-view");

  const categoriesHtml = categories
    .map((category) => createCategoryCard(category, isListView))
    .join("");
  $container.html(categoriesHtml);

  // Add event listeners to category cards
  $(".category-card").on("click", ".btn-edit", function (e) {
    e.stopPropagation();
    const categoryId = $(this).closest(".category-card").data("id");
    editCategory(categoryId);
  });

  $(".category-card").on("click", ".btn-delete", function (e) {
    e.stopPropagation();
    const categoryId = $(this).closest(".category-card").data("id");
    deleteCategory(categoryId);
  });
}

// Create category card HTML
function createCategoryCard(category, isListView = false) {
  const spent = category.spent || 0;
  const budget = category.budget || 1;
  const percentage = Math.round((spent / budget) * 100);
  const remaining = budget - spent;

  let progressClass = "healthy";
  if (percentage >= 100) {
    progressClass = "over-budget";
  } else if (percentage >= 80) {
    progressClass = "warning";
  }

  const progressWidth = Math.min(percentage, 100);

  return `
    <div class="category-card" data-id="${category.id}">
      <div class="category-header">
        <div class="category-info">
          <div class="category-icon" style="background: ${category.color}">
            <i class="${category.icon}"></i>
          </div>
          <div class="category-details">
            <h3>${category.name}</h3>
            <div class="category-budget-info">
              Budget: ${formatCurrency(budget)} / month
            </div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-action btn-edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="category-progress">
        <div class="progress-header">
          <span class="progress-label">Spent this month</span>
          <span class="progress-amount">${formatCurrency(
            spent
          )} / ${formatCurrency(budget)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressWidth}%; background: ${
    category.color
  }"></div>
        </div>
        <div class="progress-percentage ${progressClass}">
          ${percentage}% used • ${formatCurrency(remaining)} remaining
        </div>
      </div>
      
      <div class="category-stats">
        <div class="stat-item">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${category.transactionCount || 0}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Avg. Transaction</div>
          <div class="stat-value">${formatCurrency(
            category.avgTransaction || 0
          )}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Updated</div>
          <div class="stat-value">${
            formatDate(category.lastTransaction) || "N/A"
          }</div>
        </div>
      </div>
    </div>
  `;
}

// Load budget goals
async function loadBudgetGoals() {
  console.log("Loading budget goals...");

  const $grid = $("#budgetGoalsGrid");

  try {
    const goals = await getBudgetGoalsData();
    budgetData.goals = goals;

    if (goals.length === 0) {
      $grid.html(`
        <div class="empty-budget-state">
          <i class="fas fa-target"></i>
          <h3>No Financial Goals</h3>
          <p>Set financial goals to track your savings progress</p>
        </div>
      `);
      return;
    }

    renderBudgetGoals(goals);
    console.log("Budget goals loaded successfully");
  } catch (error) {
    console.error("Error loading budget goals:", error);
    $grid.html(`
      <div class="empty-budget-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Goals</h3>
        <p>Unable to load financial goals</p>
      </div>
    `);
  }
}

// Render budget goals
function renderBudgetGoals(goals) {
  const $grid = $("#budgetGoalsGrid");
  const goalsHtml = goals.map((goal) => createGoalCard(goal)).join("");
  $grid.html(goalsHtml);

  // Add event listeners
  $(".goal-card").on("click", ".btn-edit", function (e) {
    e.stopPropagation();
    const goalId = $(this).closest(".goal-card").data("id");
    editGoal(goalId);
  });

  $(".goal-card").on("click", ".btn-delete", function (e) {
    e.stopPropagation();
    const goalId = $(this).closest(".goal-card").data("id");
    deleteGoal(goalId);
  });
}

// Create goal card HTML
function createGoalCard(goal) {
  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100
  );
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return `
    <div class="goal-card" data-id="${goal.id}">
      <div class="goal-header">
        <div class="goal-info">
          <div class="goal-icon">
            <i class="fas ${getGoalIcon(goal.category)}"></i>
          </div>
          <div class="goal-details">
            <h4>${goal.name}</h4>
            <p class="goal-target">Target: ${formatCurrency(
              goal.targetAmount
            )}</p>
            ${
              daysLeft !== null
                ? `<p class="goal-deadline">${
                    daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"
                  }</p>`
                : ""
            }
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn-action btn-edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="goal-progress">
        <div class="progress-header">
          <span class="progress-label">Progress</span>
          <span class="progress-amount">${formatCurrency(
            goal.currentAmount
          )} / ${formatCurrency(goal.targetAmount)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">
          <span class="current">${formatCurrency(remaining)} remaining</span>
          <span class="percentage">${Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  `;
}

// Load budget insights
async function loadBudgetInsights() {
  console.log("Loading budget insights...");

  try {
    await Promise.all([
      loadSpendingTrendsChart(),
      loadBudgetDistributionChart(),
      loadBudgetAlerts(),
      loadBudgetRecommendations(),
    ]);

    console.log("Budget insights loaded successfully");
  } catch (error) {
    console.error("Error loading budget insights:", error);
  }
}

// Load spending trends chart
async function loadSpendingTrendsChart() {
  const ctx = document.getElementById("spendingTrendsChart");
  if (!ctx) return;

  try {
    const chartData = await getSpendingTrendsData();

    new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Budget",
            data: chartData.budget,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "Actual Spending",
            data: chartData.spending,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
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
    console.error("Error loading spending trends chart:", error);
  }
}

// Load budget distribution chart
async function loadBudgetDistributionChart() {
  const ctx = document.getElementById("budgetDistributionChart");
  if (!ctx) return;

  try {
    const chartData = await getBudgetDistributionData();

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.values,
            backgroundColor: chartData.colors,
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
              padding: 15,
              usePointStyle: true,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading budget distribution chart:", error);
  }
}

// Load budget alerts
async function loadBudgetAlerts() {
  const $container = $("#budgetAlerts");

  try {
    const alerts = await getBudgetAlertsData();

    if (alerts.length === 0) {
      $container.html(`
        <div style="text-align: center; padding: 2rem; color: var(--text-muted-color);">
          <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>No alerts - you're on track!</p>
        </div>
      `);
      return;
    }

    const alertsHtml = alerts
      .map(
        (alert) => `
      <div class="alert-item ${alert.type}">
        <div class="alert-icon">
          <i class="fas ${getAlertIcon(alert.type)}"></i>
        </div>
        <div class="alert-content">
          <div class="alert-title">${alert.title}</div>
          <div class="alert-message">${alert.message}</div>
        </div>
      </div>
    `
      )
      .join("");

    $container.html(alertsHtml);
  } catch (error) {
    console.error("Error loading budget alerts:", error);
  }
}

// Load budget recommendations
async function loadBudgetRecommendations() {
  const $container = $("#budgetRecommendations");

  try {
    const recommendations = await getBudgetRecommendationsData();

    if (recommendations.length === 0) {
      $container.html(`
        <div style="text-align: center; padding: 2rem; color: var(--text-muted-color);">
          <i class="fas fa-thumbs-up" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>No recommendations - keep it up!</p>
        </div>
      `);
      return;
    }

    const recommendationsHtml = recommendations
      .map(
        (rec) => `
      <div class="recommendation-item">
        <div class="recommendation-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="recommendation-content">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-message">${rec.message}</div>
        </div>
      </div>
    `
      )
      .join("");

    $container.html(recommendationsHtml);
  } catch (error) {
    console.error("Error loading budget recommendations:", error);
  }
}

// Event handlers
function handlePeriodChange() {
  const period = $(this).val();
  console.log("Budget period changed to:", period);
  // Reload data for selected period
  loadBudgetSummary();
  loadBudgetCategories();
}

function handleViewToggle() {
  $(".view-btn").removeClass("active");
  $(this).addClass("active");

  const view = $(this).data("view");
  const $container = $("#budgetCategoriesContainer");

  if (view === "list") {
    $container.addClass("list-view");
  } else {
    $container.removeClass("list-view");
  }

  // Re-render categories with new view
  if (budgetData.categories.length > 0) {
    renderBudgetCategories(budgetData.categories);
  }
}

function handleExportBudget() {
  // Implement budget export functionality
  NotificationManager.add("Exporting budget data...", "info");

  // This would typically generate and download a CSV/PDF report
  setTimeout(() => {
    NotificationManager.add("Budget exported successfully", "success");
  }, 2000);
}

function handleColorSelection() {
  $(".color-option").removeClass("active");
  $(this).addClass("active");

  const color = $(this).data("color");
  $("#categoryColor").val(color);
}

// Modal functions
function openCategoryModal(categoryId = null) {
  const $modal = $("#categoryModal");
  const $title = $("#categoryModalTitle");

  if (categoryId) {
    // Edit mode
    const category = budgetData.categories.find((c) => c.id === categoryId);
    if (category) {
      $title.text("Edit Budget Category");
      $("#categoryName").val(category.name);
      $("#categoryBudget").val(category.budget);
      $("#categoryIcon").val(category.icon);
      $("#categoryColor").val(category.color);

      // Update color picker
      $(".color-option").removeClass("active");
      $(`.color-option[data-color="${category.color}"]`).addClass("active");
    }
  } else {
    // Add mode
    $title.text("Add Budget Category");
    $("#categoryForm")[0].reset();
    $("#categoryColor").val("#667eea");
    $(".color-option").removeClass("active");
    $(".color-option").first().addClass("active");
  }

  $modal.addClass("show");
}

function closeCategoryModal() {
  $("#categoryModal").removeClass("show");
  $("#categoryForm")[0].reset();
}

function openGoalModal(goalId = null) {
  const $modal = $("#goalModal");
  const $title = $("#goalModalTitle");

  if (goalId) {
    // Edit mode
    const goal = budgetData.goals.find((g) => g.id === goalId);
    if (goal) {
      $title.text("Edit Financial Goal");
      $("#goalName").val(goal.name);
      $("#goalTarget").val(goal.targetAmount);
      $("#goalCurrent").val(goal.currentAmount);
      $("#goalDeadline").val(goal.deadline ? goal.deadline.split("T")[0] : "");
      $("#goalCategory").val(goal.category);
    }
  } else {
    // Add mode
    $title.text("Add Financial Goal");
    $("#goalForm")[0].reset();
  }

  $modal.addClass("show");
}

function closeGoalModal() {
  $("#goalModal").removeClass("show");
  $("#goalForm")[0].reset();
}

// Form handlers
async function handleCategorySubmit(e) {
  e.preventDefault();

  const formData = {
    name: $("#categoryName").val(),
    budget: parseFloat($("#categoryBudget").val()),
    icon: $("#categoryIcon").val(),
    color: $("#categoryColor").val(),
  };

  try {
    // This would typically call your API to save the category
    console.log("Saving category:", formData);

    NotificationManager.add("Category saved successfully", "success");
    closeCategoryModal();

    // Reload categories
    await loadBudgetCategories();
  } catch (error) {
    console.error("Error saving category:", error);
    NotificationManager.add("Error saving category", "danger");
  }
}

async function handleGoalSubmit(e) {
  e.preventDefault();

  const formData = {
    name: $("#goalName").val(),
    targetAmount: parseFloat($("#goalTarget").val()),
    currentAmount: parseFloat($("#goalCurrent").val()) || 0,
    deadline: $("#goalDeadline").val() || null,
    category: $("#goalCategory").val(),
  };

  try {
    // This would typically call your API to save the goal
    console.log("Saving goal:", formData);

    NotificationManager.add("Goal saved successfully", "success");
    closeGoalModal();

    // Reload goals
    await loadBudgetGoals();
  } catch (error) {
    console.error("Error saving goal:", error);
    NotificationManager.add("Error saving goal", "danger");
  }
}

// Delete functions
async function deleteCategory(categoryId) {
  if (
    !confirm(
      "Are you sure you want to delete this category? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    // This would typically call your API to delete the category
    console.log("Deleting category:", categoryId);

    NotificationManager.add("Category deleted successfully", "success");

    // Reload categories
    await loadBudgetCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
    NotificationManager.add("Error deleting category", "danger");
  }
}

async function deleteGoal(goalId) {
  if (
    !confirm(
      "Are you sure you want to delete this goal? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    // This would typically call your API to delete the goal
    console.log("Deleting goal:", goalId);

    NotificationManager.add("Goal deleted successfully", "success");

    // Reload goals
    await loadBudgetGoals();
  } catch (error) {
    console.error("Error deleting goal:", error);
    NotificationManager.add("Error deleting goal", "danger");
  }
}

// Edit functions
function editCategory(categoryId) {
  openCategoryModal(categoryId);
}

function editGoal(goalId) {
  openGoalModal(goalId);
}

// API simulation functions (replace with actual API calls)
async function getBudgetSummaryData() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    totalBudget: 4500.0,
    totalSpent: 3250.75,
    remainingBudget: 1249.25,
    budgetHealth: "Good",
  };
}

async function getBudgetCategoriesData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: 1,
      name: "Food & Dining",
      budget: 800,
      spent: 650,
      icon: "fas fa-utensils",
      color: "#667eea",
      transactionCount: 23,
      avgTransaction: 28.26,
      lastTransaction: "2024-01-15",
    },
    {
      id: 2,
      name: "Transportation",
      budget: 500,
      spent: 420,
      icon: "fas fa-car",
      color: "#f093fb",
      transactionCount: 8,
      avgTransaction: 52.5,
      lastTransaction: "2024-01-14",
    },
    {
      id: 3,
      name: "Shopping",
      budget: 600,
      spent: 720,
      icon: "fas fa-shopping-cart",
      color: "#4facfe",
      transactionCount: 15,
      avgTransaction: 48.0,
      lastTransaction: "2024-01-16",
    },
    {
      id: 4,
      name: "Entertainment",
      budget: 300,
      spent: 180,
      icon: "fas fa-film",
      color: "#11998e",
      transactionCount: 6,
      avgTransaction: 30.0,
      lastTransaction: "2024-01-10",
    },
  ];
}

async function getBudgetGoalsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: 1,
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 6500,
      deadline: "2024-12-31",
      category: "emergency",
    },
    {
      id: 2,
      name: "Vacation Fund",
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: "2024-06-30",
      category: "vacation",
    },
    {
      id: 3,
      name: "New Car",
      targetAmount: 25000,
      currentAmount: 8000,
      deadline: null,
      category: "car",
    },
  ];
}

async function getSpendingTrendsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    budget: [4500, 4500, 4500, 4500, 4500, 4500],
    spending: [3200, 3850, 4100, 3900, 4200, 3250],
  };
}

async function getBudgetDistributionData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    labels: [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Entertainment",
      "Other",
    ],
    values: [650, 420, 720, 180, 280],
    colors: ["#667eea", "#f093fb", "#4facfe", "#11998e", "#ff9a9e"],
  };
}

async function getBudgetAlertsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      type: "danger",
      title: "Budget Exceeded",
      message: "Shopping category is 120% over budget this month",
    },
    {
      type: "warning",
      title: "Budget Warning",
      message: "Transportation spending is at 84% of monthly budget",
    },
    {
      type: "info",
      title: "Goal Update",
      message: "Emergency Fund goal is 65% complete",
    },
  ];
}

async function getBudgetRecommendationsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      title: "Reduce Shopping Expenses",
      message: "Consider setting a weekly spending limit to stay within budget",
    },
    {
      title: "Increase Emergency Fund",
      message: "Add $200 more monthly to reach your goal by year-end",
    },
    {
      title: "Review Transportation Costs",
      message: "Look for carpooling or public transport alternatives",
    },
  ];
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return null;

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

function getGoalIcon(category) {
  const icons = {
    emergency: "fa-shield-alt",
    vacation: "fa-plane",
    car: "fa-car",
    home: "fa-home",
    education: "fa-graduation-cap",
    investment: "fa-chart-line",
    other: "fa-target",
  };
  return icons[category] || "fa-target";
}

function getAlertIcon(type) {
  const icons = {
    danger: "fa-exclamation-triangle",
    warning: "fa-exclamation-circle",
    info: "fa-info-circle",
    success: "fa-check-circle",
  };
  return icons[type] || "fa-info-circle";
}
