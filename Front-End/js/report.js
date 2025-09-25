// Report Management JavaScript
$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();

  initializeReportManagement();
});

let reportData = {
  recentReports: [],
  scheduledReports: [],
  analytics: {},
  accounts: [],
  categories: [],
};

let currentReportGeneration = null;

async function initializeReportManagement() {
  console.log("Initializing report management...");

  try {
    await Promise.allSettled([
      loadRecentReports(),
      loadScheduledReports(),
      loadReportAnalytics(),
      loadAccountsAndCategories(),
    ]);

    initializeReportEventHandlers();

    console.log("Report management initialization complete");
    NotificationManager.add("Reports module loaded successfully", "success");
  } catch (error) {
    console.error("Report initialization failed:", error);
    NotificationManager.add("Failed to load reports data", "danger");
  }
}

function initializeReportEventHandlers() {
  $(".btn-generate").on("click", handleQuickReportGeneration);

  $("#customReport").on("click", () => openReportModal());

  $("#scheduleReport, #addScheduledReport").on("click", () =>
    openScheduleModal()
  );

  $(".view-btn").on("click", handleViewToggle);

  $("#closeReportModal, #cancelReport").on("click", closeReportModal);
  $("#closeScheduleModal, #cancelSchedule").on("click", closeScheduleModal);

  $("#reportForm").on("submit", handleReportGeneration);
  $("#scheduleForm").on("submit", handleScheduleCreation);

  $("#reportPeriod").on("change", handlePeriodChange);
  $("#reportType, #reportFormat, #reportPeriod").on(
    "change",
    updateReportPreview
  );

  $(document).on("click", ".btn-download", handleReportDownload);
  $(document).on("click", ".btn-regenerate", handleReportRegeneration);
  $(document).on("click", ".btn-share", handleReportSharing);
  $(document).on("click", ".btn-delete", handleReportDeletion);

  $(document).on("click", ".btn-toggle-schedule", handleScheduleToggle);
  $(document).on("click", ".btn-edit-schedule", handleScheduleEdit);
  $(document).on("click", ".btn-delete-schedule", handleScheduleDeletion);

  $(".modal").on("click", function (e) {
    if (e.target === this) {
      closeReportModal();
      closeScheduleModal();
    }
  });

  console.log("Report event handlers initialized");
}

async function loadRecentReports() {
  console.log("Loading recent reports...");

  const $container = $("#recentReportsContainer");

  try {
    const reports = await getRecentReportsData();
    reportData.recentReports = reports;

    if (reports.length === 0) {
      $container.html(`
        <div class="empty-reports-state">
          <i class="fas fa-file-alt"></i>
          <h3>No Reports Generated</h3>
          <p>Generate your first report to see it here</p>
        </div>
      `);
      return;
    }

    renderRecentReports(reports);
    console.log("Recent reports loaded successfully");
  } catch (error) {
    console.error("Error loading recent reports:", error);
    $container.html(`
      <div class="empty-reports-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Reports</h3>
        <p>Unable to load recent reports</p>
      </div>
    `);
  }
}

function renderRecentReports(reports) {
  const $container = $("#recentReportsContainer");
  const isListView = $container.hasClass("list-view");

  const reportsHtml = reports
    .map((report) => createRecentReportCard(report, isListView))
    .join("");
  $container.html(reportsHtml);
}

function createRecentReportCard(report, isListView = false) {
  const statusClass = report.status.toLowerCase();
  const createdDate = formatReportDate(report.createdAt);
  const fileSize = formatFileSize(report.fileSize);

  return `
    <div class="recent-report-card" data-id="${report.id}">
      <div class="report-card-header">
        <div class="report-card-info">
          <h4>${report.name}</h4>
          <div class="report-metadata">
            <div><i class="fas fa-calendar"></i> ${createdDate}</div>
            <div><i class="fas fa-file"></i> ${report.format.toUpperCase()} • ${fileSize}</div>
            <div><i class="fas fa-clock"></i> ${report.period}</div>
          </div>
        </div>
        <div class="report-status ${statusClass}">
          ${report.status}
        </div>
      </div>
      
      <div class="report-card-actions">
        ${
          report.status === "Completed"
            ? `
          <button class="btn-action btn-download" data-id="${report.id}">
            <i class="fas fa-download"></i>
            Download
          </button>
          <button class="btn-action btn-share" data-id="${report.id}">
            <i class="fas fa-share"></i>
            Share
          </button>
        `
            : ""
        }
        
        ${
          report.status === "Failed"
            ? `
          <button class="btn-action btn-regenerate" data-id="${report.id}">
            <i class="fas fa-redo"></i>
            Retry
          </button>
        `
            : ""
        }
        
        <button class="btn-action btn-delete" data-id="${report.id}">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
  `;
}

async function loadScheduledReports() {
  console.log("Loading scheduled reports...");

  const $container = $("#scheduledReportsList");

  try {
    const schedules = await getScheduledReportsData();
    reportData.scheduledReports = schedules;

    if (schedules.length === 0) {
      $container.html(`
        <div class="empty-reports-state">
          <i class="fas fa-calendar-times"></i>
          <h3>No Scheduled Reports</h3>
          <p>Create automated report schedules to save time</p>
        </div>
      `);
      return;
    }

    const schedulesHtml = schedules
      .map((schedule) => createScheduledReportItem(schedule))
      .join("");
    $container.html(schedulesHtml);

    console.log("Scheduled reports loaded successfully");
  } catch (error) {
    console.error("Error loading scheduled reports:", error);
    $container.html(`
      <div class="empty-reports-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Schedules</h3>
        <p>Unable to load scheduled reports</p>
      </div>
    `);
  }
}

function createScheduledReportItem(schedule) {
  const isActive = schedule.status === "active";
  const nextRun = formatReportDate(schedule.nextRun);

  return `
    <div class="scheduled-report-item" data-id="${schedule.id}">
      <div class="scheduled-report-info">
        <div class="schedule-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="schedule-details">
          <h4>${schedule.name}</h4>
          <div class="schedule-meta">
            ${schedule.reportType} • ${
    schedule.frequency
  } • ${schedule.format.toUpperCase()}
            ${nextRun ? ` • Next: ${nextRun}` : ""}
          </div>
        </div>
      </div>
      
      <div class="schedule-status">
        <div class="status-indicator ${isActive ? "" : "inactive"}"></div>
        <span>${isActive ? "Active" : "Inactive"}</span>
      </div>
      
      <div class="schedule-actions">
        <button class="btn-action btn-toggle-schedule" data-id="${schedule.id}">
          <i class="fas ${isActive ? "fa-pause" : "fa-play"}"></i>
          ${isActive ? "Pause" : "Resume"}
        </button>
        <button class="btn-action btn-edit-schedule" data-id="${schedule.id}">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button class="btn-action btn-delete-schedule" data-id="${schedule.id}">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
  `;
}

async function loadReportAnalytics() {
  console.log("Loading report analytics...");

  try {
    const analytics = await getReportAnalyticsData();
    reportData.analytics = analytics;

    // Update analytics display
    $("#totalReports").text(analytics.totalReports);
    $("#scheduledCount").text(analytics.scheduledCount);
    $("#popularFormat").text(analytics.popularFormat);
    $("#popularReport").text(analytics.popularReport);

    console.log("Report analytics loaded successfully");
  } catch (error) {
    console.error("Error loading report analytics:", error);
    $("#totalReports").text("0");
    $("#scheduledCount").text("0");
    $("#popularFormat").text("PDF");
    $("#popularReport").text("Financial Summary");
  }
}

async function loadAccountsAndCategories() {
  console.log("Loading accounts and categories...");

  try {
    const [accounts, categories] = await Promise.all([
      getAccountsData(),
      getCategoriesData(),
    ]);

    reportData.accounts = accounts;
    reportData.categories = categories;

    populateAccountOptions(accounts);
    populateCategoryOptions(categories);

    console.log("Accounts and categories loaded successfully");
  } catch (error) {
    console.error("Error loading accounts and categories:", error);
  }
}

function populateAccountOptions(accounts) {
  const $select = $("#reportAccounts");
  $select.empty();

  accounts.forEach((account) => {
    $select.append(`<option value="${account.id}">${account.name}</option>`);
  });
}

function populateCategoryOptions(categories) {
  const $select = $("#reportCategories");
  $select.empty();

  categories.forEach((category) => {
    $select.append(`<option value="${category.id}">${category.name}</option>`);
  });
}

function handleQuickReportGeneration() {
  const reportType = $(this).data("report");

  if (this.id === "downloadButton") return;

  openReportModal(reportType);
}

function handleViewToggle() {
  $(".view-btn").removeClass("active");
  $(this).addClass("active");

  const view = $(this).data("view");
  const $container = $("#recentReportsContainer");

  if (view === "list") {
    $container.addClass("list-view");
  } else {
    $container.removeClass("list-view");
  }

  if (reportData.recentReports.length > 0) {
    renderRecentReports(reportData.recentReports);
  }
}

function handlePeriodChange() {
  const period = $(this).val();
  const $customDateGroup = $("#customDateGroup");

  if (period === "custom") {
    $customDateGroup.show();
    $("#startDate, #endDate").prop("required", true);
  } else {
    $customDateGroup.hide();
    $("#startDate, #endDate").prop("required", false);
  }

  updateReportPreview();
}

function updateReportPreview() {
  const reportType = $("#reportType").val();
  const reportFormat = $("#reportFormat").val();
  const reportPeriod = $("#reportPeriod").val();

  const $preview = $("#reportPreview");

  if (reportType && reportFormat && reportPeriod) {
    $("#previewType").text(getReportTypeDisplay(reportType));
    $("#previewFormat").text(reportFormat.toUpperCase());
    $("#previewPeriod").text(getPeriodDisplay(reportPeriod));

    const estimatedSize = estimateReportSize(
      reportType,
      reportFormat,
      reportPeriod
    );
    $("#previewSize").text(estimatedSize);

    $preview.show();
  } else {
    $preview.hide();
  }
}

async function handleReportGeneration(e) {
  e.preventDefault();

  const formData = {
    reportType: $("#reportType").val(),
    format: $("#reportFormat").val(),
    period: $("#reportPeriod").val(),
    startDate: $("#startDate").val() || null,
    endDate: $("#endDate").val() || null,
    accounts: $("#reportAccounts").val() || [],
    categories: $("#reportCategories").val() || [],
    includeCharts: $("#includeCharts").is(":checked"),
    emailReport: $("#emailReport").is(":checked"),
  };

  try {
    $("#generateReport")
      .prop("disabled", true)
      .html('<i class="fas fa-spinner fa-spin"></i> Generating...');

    await generateReport(formData);

    showGenerationResult(true, "Report generated successfully!");

    await loadRecentReports();

    setTimeout(() => {
      closeReportModal();
    }, 2000);
  } catch (error) {
    console.error("Error generating report:", error);
    showGenerationResult(false, "Failed to generate report. Please try again.");
  } finally {
    $("#generateReport")
      .prop("disabled", false)
      .html('<i class="fas fa-download"></i> Generate & Download');
  }
}

async function handleScheduleCreation(e) {
  e.preventDefault();

  const formData = {
    name: $("#scheduleName").val(),
    reportType: $("#scheduleReportType").val(),
    frequency: $("#scheduleFrequency").val(),
    format: $("#scheduleFormat").val(),
    email: $("#scheduleEmail").val() || null,
    active: $("#scheduleActive").is(":checked"),
  };

  try {
    $("#saveSchedule").prop("disabled", true);

    await createReportSchedule(formData);

    NotificationManager.add("Report schedule created successfully", "success");

    await loadScheduledReports();
    await loadReportAnalytics();

    closeScheduleModal();
  } catch (error) {
    console.error("Error creating schedule:", error);
    NotificationManager.add("Failed to create report schedule", "danger");
  } finally {
    $("#saveSchedule").prop("disabled", false);
  }
}

async function handleReportDownload() {
  const reportId = $(this).data("id");
  const $btn = $(this);

  try {
    $btn.addClass("downloading").prop("disabled", true);
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Downloading...');

    await downloadReport(reportId);

    NotificationManager.add("Report downloaded successfully", "success");
  } catch (error) {
    console.error("Error downloading report:", error);
    NotificationManager.add("Failed to download report", "danger");
  } finally {
    $btn.removeClass("downloading").prop("disabled", false);
    $btn.html('<i class="fas fa-download"></i> Download');
  }
}

async function handleReportRegeneration() {
  const reportId = $(this).data("id");

  try {
    await regenerateReport(reportId);
    NotificationManager.add("Report regeneration started", "info");

    await loadRecentReports();
  } catch (error) {
    console.error("Error regenerating report:", error);
    NotificationManager.add("Failed to regenerate report", "danger");
  }
}

async function handleReportSharing() {
  const reportId = $(this).data("id");

  NotificationManager.add("Sharing feature coming soon", "info");
}

async function handleReportDeletion() {
  const reportId = $(this).data("id");

  if (
    !confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteReport(reportId);
    NotificationManager.add("Report deleted successfully", "success");

    await loadRecentReports();
  } catch (error) {
    console.error("Error deleting report:", error);
    NotificationManager.add("Failed to delete report", "danger");
  }
}

async function handleScheduleToggle() {
  const scheduleId = $(this).data("id");

  try {
    await toggleReportSchedule(scheduleId);
    NotificationManager.add("Schedule updated successfully", "success");

    await loadScheduledReports();
  } catch (error) {
    console.error("Error toggling schedule:", error);
    NotificationManager.add("Failed to update schedule", "danger");
  }
}

async function handleScheduleEdit() {
  const scheduleId = $(this).data("id");

  const schedule = reportData.scheduledReports.find((s) => s.id === scheduleId);
  if (schedule) {
    openScheduleModal(schedule);
  }
}

async function handleScheduleDeletion() {
  const scheduleId = $(this).data("id");

  if (
    !confirm(
      "Are you sure you want to delete this scheduled report? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteReportSchedule(scheduleId);
    NotificationManager.add("Schedule deleted successfully", "success");

    await loadScheduledReports();
    await loadReportAnalytics();
  } catch (error) {
    console.error("Error deleting schedule:", error);
    NotificationManager.add("Failed to delete schedule", "danger");
  }
}

function openReportModal(reportType = null) {
  const $modal = $("#reportModal");

  $("#reportForm")[0].reset();
  $("#reportPreview").hide();
  $("#customDateGroup").hide();

  if (reportType) {
    $("#reportType").val(reportType);
    updateReportPreview();
  }

  const today = new Date().toISOString().split("T")[0];
  $("#endDate").val(today);

  $modal.addClass("show");
}

function closeReportModal() {
  $("#reportModal").removeClass("show");
  $("#reportForm")[0].reset();
  $("#reportPreview").hide();
}

function openScheduleModal(schedule = null) {
  const $modal = $("#scheduleModal");

  if (schedule) {
    // Edit mode - populate form with existing data
    $("#scheduleName").val(schedule.name);
    $("#scheduleReportType").val(schedule.reportType);
    $("#scheduleFrequency").val(schedule.frequency);
    $("#scheduleFormat").val(schedule.format);
    $("#scheduleEmail").val(schedule.email || "");
    $("#scheduleActive").prop("checked", schedule.status === "active");
  } else {
    $("#scheduleForm")[0].reset();
    $("#scheduleActive").prop("checked", true);
  }

  $modal.addClass("show");
}

function closeScheduleModal() {
  $("#scheduleModal").removeClass("show");
  $("#scheduleForm")[0].reset();
}

function showGenerationResult(success, message) {
  const $modal = $("#reportModal .modal-body");
  const resultHtml = `
    <div class="generation-result ${success ? "success" : "error"}">
      <div class="result-icon">
        <i class="fas ${
          success ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
      </div>
      <div class="result-message">${message}</div>
    </div>
  `;

  $modal.find(".generation-result").remove();

  $modal.append(resultHtml);
}

async function getRecentReportsData() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 1,
      name: "Financial Summary - January 2024",
      type: "financial-summary",
      format: "pdf",
      period: "January 2024",
      status: "Completed",
      createdAt: "2024-01-31T10:30:00Z",
      fileSize: 2048000, // 2MB
      downloadUrl: "/reports/download/1",
    },
    {
      id: 2,
      name: "Transaction History - Q4 2023",
      type: "transaction-history",
      format: "excel",
      period: "Q4 2023",
      status: "Completed",
      createdAt: "2024-01-15T14:22:00Z",
      fileSize: 5120000, // 5MB
      downloadUrl: "/reports/download/2",
    },
    {
      id: 3,
      name: "Budget Analysis - December 2023",
      type: "budget-analysis",
      format: "pdf",
      period: "December 2023",
      status: "Processing",
      createdAt: "2024-01-30T09:15:00Z",
      fileSize: 0,
      downloadUrl: null,
    },
    {
      id: 4,
      name: "Income Statement - 2023",
      type: "income-statement",
      format: "pdf",
      period: "2023",
      status: "Failed",
      createdAt: "2024-01-28T16:45:00Z",
      fileSize: 0,
      downloadUrl: null,
    },
  ];
}

async function getScheduledReportsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: 1,
      name: "Monthly Financial Summary",
      reportType: "financial-summary",
      frequency: "monthly",
      format: "pdf",
      email: "user@example.com",
      status: "active",
      nextRun: "2024-02-01T09:00:00Z",
    },
    {
      id: 2,
      name: "Weekly Transaction Report",
      reportType: "transaction-history",
      frequency: "weekly",
      format: "csv",
      email: null,
      status: "active",
      nextRun: "2024-01-29T08:00:00Z",
    },
    {
      id: 3,
      name: "Quarterly Budget Analysis",
      reportType: "budget-analysis",
      frequency: "quarterly",
      format: "excel",
      email: "user@example.com",
      status: "inactive",
      nextRun: null,
    },
  ];
}

async function getReportAnalyticsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    totalReports: 28,
    scheduledCount: 3,
    popularFormat: "PDF",
    popularReport: "Financial Summary",
  };
}

async function getAccountsData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { id: 1, name: "Checking Account - *1234" },
    { id: 2, name: "Savings Account - *5678" },
    { id: 3, name: "Credit Card - *9012" },
    { id: 4, name: "Investment Account - *3456" },
  ];
}

async function getCategoriesData() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { id: 1, name: "Food & Dining" },
    { id: 2, name: "Transportation" },
    { id: 3, name: "Shopping" },
    { id: 4, name: "Entertainment" },
    { id: 5, name: "Bills & Utilities" },
    { id: 6, name: "Healthcare" },
    { id: 7, name: "Education" },
    { id: 8, name: "Travel" },
  ];
}

async function generateReport(reportData) {
  console.log("Generating report with data:", reportData);

  const response = await fetch("/api/reports/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TokenManager.getAccessToken()}`,
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  const result = await response.json();

  // If report is generated immediately, start download
  if (result.downloadUrl) {
    window.open(result.downloadUrl, "_blank");
  }

  return result;
}

async function downloadReport(reportId) {
  console.log("Downloading report:", reportId);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const downloadUrl = `/api/reports/download/${reportId}`;
  window.open(downloadUrl, "_blank");
}

async function regenerateReport(reportId) {
  console.log("Regenerating report:", reportId);

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function deleteReport(reportId) {
  console.log("Deleting report:", reportId);

  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function createReportSchedule(scheduleData) {
  console.log("Creating report schedule:", scheduleData);

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function toggleReportSchedule(scheduleId) {
  console.log("Toggling schedule:", scheduleId);

  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function deleteReportSchedule(scheduleId) {
  console.log("Deleting schedule:", scheduleId);

  await new Promise((resolve) => setTimeout(resolve, 500));
}

function formatReportDate(dateString) {
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
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getReportTypeDisplay(reportType) {
  const types = {
    "financial-summary": "Financial Summary",
    "transaction-history": "Transaction History",
    "budget-analysis": "Budget Analysis",
    "income-statement": "Income Statement",
    "cash-flow": "Cash Flow Report",
    "tax-summary": "Tax Summary",
  };
  return types[reportType] || reportType;
}

function getPeriodDisplay(period) {
  const periods = {
    "current-month": "Current Month",
    "last-month": "Last Month",
    "current-quarter": "Current Quarter",
    "last-quarter": "Last Quarter",
    "current-year": "Current Year",
    "last-year": "Last Year",
    custom: "Custom Range",
  };
  return periods[period] || period;
}

function estimateReportSize(reportType, format, period) {
  const baseSizes = {
    "financial-summary": { pdf: 1.5, excel: 2.0, csv: 0.5 },
    "transaction-history": { pdf: 3.0, excel: 4.0, csv: 1.0 },
    "budget-analysis": { pdf: 2.0, excel: 2.5, csv: 0.7 },
    "income-statement": { pdf: 1.8, excel: 2.2, csv: 0.6 },
    "cash-flow": { pdf: 2.2, excel: 2.8, csv: 0.8 },
    "tax-summary": { pdf: 2.5, excel: 3.0, csv: 1.2 },
  };

  const periodMultipliers = {
    "current-month": 1,
    "last-month": 1,
    "current-quarter": 2.5,
    "last-quarter": 2.5,
    "current-year": 8,
    "last-year": 8,
    custom: 1.5,
  };

  const baseSize = baseSizes[reportType]?.[format] || 1.5;
  const multiplier = periodMultipliers[period] || 1;
  const estimatedSize = baseSize * multiplier;

  return `~${estimatedSize.toFixed(1)} MB`;
}

function downloadPdfReport(year, month) {
  const statusDiv = document.getElementById("status-message");
  statusDiv.textContent = "Generating report...";

  const pdfEndpoint = "http://localhost:8080/api/v1/report/pdf";

  const url = new URL(pdfEndpoint);
  url.search = new URLSearchParams({
    year: year,
    month: month,
  }).toString();

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(`Server Error: ${err.message || "Unknown error"}`);
        });
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `report_${year}_${month}.pdf`;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          contentDisposition
        );
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      return response.blob().then((blob) => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      statusDiv.textContent = "Report downloaded successfully!";
    })
    .catch((error) => {
      console.error("Download failed:", error);
      statusDiv.textContent = `Error: ${error.message}`;
      alert(`An error occurred while downloading the report: ${error.message}`);
    });
}

document.getElementById("downloadButton").addEventListener("click", () => {
  const reportYear = 2025;
  const reportMonth = 9;
  downloadPdfReport(reportYear, reportMonth);
});
