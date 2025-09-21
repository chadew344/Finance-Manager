const BASE_URL_TRANSACTION = "http://localhost:8080/api/v1/transaction";

let transactions = [];
let categories = [];
let accounts = [];
let tags = [];
let currencyType = "LKR";

let filteredTransactions = [];
let currentPage = 1;
let itemsPerPage = 10;
let editingId = null;
let selectedTags = [];
let userAccountId;

$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();
  userAccountId = DataManager.get("userAccountId");

  initializeApp();
});

async function initializeApp() {
  try {
    showLoadingState();

    await Promise.all([
      fetchInitialFiltersData(),
      fetchTransactions(),
      // fetchCategories(),
      // fetchAccounts(),
      // fetchTags(),
    ]);

    initializeUI();
    hideLoadingState();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    NotificationManager.add("Failed to load application data", "danger");
    hideLoadingState();
  }
}

async function fetchInitialFiltersData() {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/init-filter/${userAccountId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    console.log("Filter data successfully loaded:", apiResponse.data);

    const filterData = apiResponse.data;
    initializeFilters(filterData);
  } catch (error) {
    console.error("Initialize filters error:", error);
    throw error;
  }
}

async function fetchTransactions() {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/get-all/${userAccountId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    transactions = apiResponse.data || [];
    filteredTransactions = [...transactions];
    console.log("Transactions loaded:", transactions.length);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    throw error;
  }
}

async function fetchCategories() {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/categories/${userAccountId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    categories = apiResponse.data || [];
    console.log("Categories loaded:", categories.length);
  } catch (error) {
    console.error("Fetch categories error:", error);
    throw error;
  }
}

async function fetchAccounts() {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/accounts/${userAccountId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    accounts = apiResponse.data || [];
    console.log("Accounts loaded:", accounts.length);
  } catch (error) {
    console.error("Fetch accounts error:", error);
    throw error;
  }
}

async function fetchTags() {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/tags/${userAccountId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    tags = apiResponse.data || [];
    console.log("Tags loaded:", tags.length);
  } catch (error) {
    console.error("Fetch tags error:", error);
    throw error;
  }
}

async function createTransaction(transactionData) {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/${userAccountId}`,
      {
        method: "POST",
        body: JSON.stringify(transactionData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error("Create transaction error:", error);
    throw error;
  }
}

async function updateTransaction(id, transactionData) {
  try {
    const response = await window.apiCall(
      `${BASE_URL_TRANSACTION}/update/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(transactionData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error("Update transaction error:", error);
    throw error;
  }
}

async function deleteTransactionAPI(id) {
  try {
    const response = await window.apiCall(`${BASE_URL_TRANSACTION}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    return apiResponse;
  } catch (error) {
    console.error("Delete transaction error:", error);
    throw error;
  }
}

function initializeUI() {
  updateSummaryCards();
  renderTransactions();
  setDefaultDate();
  setupEventListeners();
}

function initializeFilters(filterData) {
  const categoryFilter = $("#categoryFilter");
  const accountFilter = $("#accountFilter");
  const sourceAccountSelect = $("#transactionSourceAccount");
  const destinationAccountSelect = $("#transactionDestinationAccount");
  const categorySelector = $("#transactionCategory");
  const tagSelector = $("#tagSelector");

  categories = filterData.categories;
  tags = filterData.tags;
  accounts = filterData.financialAccounts;

  categoryFilter.empty().append('<option value="">All Categories</option>');
  if (categories) {
    $.each(categories, function (i, category) {
      categoryFilter.append(
        `<option value="${category.id}">${category.name}</option>`
      );
    });
  }

  accountFilter.empty().append('<option value="">All Accounts</option>');
  if (filterData.financialAccounts) {
    $.each(filterData.financialAccounts, function (i, account) {
      accountFilter.append(
        `<option value="${account.id}">${account.name}</option>`
      );
    });
  }

  sourceAccountSelect
    .empty()
    .append('<option value="">Select source account</option>');
  $.each(filterData.financialAccounts, function (i, account) {
    sourceAccountSelect.append(
      `<option value="${account.id}">${account.name}</option>`
    );
  });

  destinationAccountSelect
    .empty()
    .append('<option value="">Select destination account</option>');
  if (filterData.financialAccounts) {
    $.each(filterData.financialAccounts, function (i, account) {
      destinationAccountSelect.append(
        `<option value="${account.id}">${account.name}</option>`
      );
    });
  }

  tagSelector.empty().append('<option value="">Add tags...</option>');
  if (filterData.tags) {
    $.each(filterData.tags, function (i, tag) {
      tagSelector.append(`<option value="${tag.id}">${tag.name}</option>`);
    });
  }

  updateCategoryOptions();
}

function setupEventListeners() {
  $("#transactionType").on("change", updateCategoryOptions);
  $("#tagSelector").on("change", handleTagSelection);
  $("#transactionForm").on("submit", handleFormSubmission);

  $(document).on("click", ".remove-tag", function () {
    const tagId = $(this).data("id");
    removeTag(tagId);
  });
  $(document).on("click", ".btn-edit", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    editTransaction(id);
  });
  $(document).on("click", ".btn-delete", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    deleteTransaction(id);
  });
  $(document).on("click", ".transaction-item", function () {
    const id = $(this).data("id");
    viewTransaction(id);
  });
  $(document).on("click", "#transactionModal", function (e) {
    if (e.target === this) {
      closeTransactionModal();
    }
  });

  $(
    "#searchInput, #typeFilter, #categoryFilter, #accountFilter, #startDate, #endDate"
  ).on("input change", applyFilters);
  $("#clearFiltersBtn").on("click", clearFilters);
  $("#transactionModalClose").on("click", closeTransactionModal);
  $("#addTransactionBtn").on("click", function () {
    openTransactionModal();
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeTransactionModal();
    }
  });
}

function showLoadingState() {
  const loadingHtml = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading transactions...</div>
    </div>
  `;
  $("#transactionsList").html(loadingHtml);

  $("#addTransactionBtn").prop("disabled", true);
}

function hideLoadingState() {
  $("#addTransactionBtn").prop("disabled", false);
}

function updateSummaryCards() {
  const totalIncome = filteredTransactions
    .filter((t) => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    filteredTransactions
      .filter((t) => t.transactionType === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const totalTransfers = filteredTransactions
    .filter((t) => t.transactionType === "TRANSFER")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  // $("#totalIncome").text(`LKR ${totalIncome.toLocaleString()}`);
  // $("#totalExpenses").text(`LKR ${totalExpenses.toLocaleString()}`);
  // $("#totalTransfers").text(`LKR ${totalTransfers.toLocaleString()}`);
  // $("#netBalance").text(`LKR ${netBalance.toLocaleString()}`);

  $("#totalIncome").text(
    window.Utils.formatCurrency(totalIncome, currencyType)
  );
  $("#totalExpenses").text(
    window.Utils.formatCurrency(totalExpenses, currencyType)
  );
  $("#totalTransfers").text(
    window.Utils.formatCurrency(totalTransfers, currencyType)
  );
  $("#netBalance").text(window.Utils.formatCurrency(netBalance, currencyType));

  $("#netBalance")
    .removeClass("positive negative")
    .addClass(netBalance >= 0 ? "positive" : "negative");
  $("#transactionCount").text(filteredTransactions.length);
}

function renderTransactions() {
  const container = $("#transactionsList");

  if (filteredTransactions.length === 0) {
    const emptyStateHtml = `
      <div class="empty-state">
          <div class="empty-icon">
              <i class="fas fa-receipt"></i>
          </div>
          <div class="empty-title">No Transactions Found</div>
          <div class="empty-description">
              ${
                transactions.length === 0
                  ? "Start by adding your first transaction"
                  : "Try adjusting your search or filter criteria"
              }
          </div>
           ${
             transactions.length === 0
               ? '<button class="btn-add" onclick="openTransactionModal()"><i class="fas fa-plus me-2"></i>Add Your First Transaction</button>'
               : ""
           }
        
      </div>
    `;
    container.html(emptyStateHtml);
    updatePagination();
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

  const transactionHtml = pageTransactions
    .map((transaction) => {
      const tagsHtml =
        transaction.tags && transaction.tags.length > 0
          ? `<div class="transaction-tags">${transaction.tags
              .map((tag) => `<span class="transaction-tag">${tag.name}</span>`)
              .join("")}</div>`
          : "";

      let transferInfoHtml = "";
      let accountDisplayName = "";

      if (transaction.type === "TRANSFER") {
        if (transaction.isInternal) {
          transferInfoHtml = `<div class="transaction-transfer-info">
            <i class="fas fa-arrow-right"></i>
            ${transaction.sourceAccountName} → ${transaction.destinationAccountName}
          </div>`;
          accountDisplayName = `${transaction.sourceAccountName} → ${transaction.destinationAccountName}`;
        } else {
          transferInfoHtml = `<div class="transaction-transfer-info">
            <i class="fas fa-external-link-alt"></i>
            ${transaction.sourceAccountName} → ${transaction.externalAccountName}
          </div>`;
          accountDisplayName = `${transaction.sourceAccountName} → ${transaction.externalAccountName}`;
        }
      } else {
        accountDisplayName = transaction.accountName;
      }

      return `
      <div class="transaction-item" data-id="${transaction.id}">
          <div class="transaction-icon ${transaction.transactionType}">
              <i class="fas ${getTransactionIcon(
                transaction.transactionType
              )}"></i>
          </div>
          <div class="transaction-details">
              <div class="transaction-description">${
                transaction.description
              }</div>
              <div class="transaction-meta">
                  <div class="transaction-category">
                      <i class="fas fa-folder"></i>
                      ${transaction.categoryName}
                  </div>
                  ${transferInfoHtml}
                  ${tagsHtml}
                  <div class="transaction-date">${formatDate(
                    transaction.transactionDate
                  )}</div>
                  <div class="transaction-account">${
                    transaction.financialAccountName
                  }</div>
              </div>
          </div>
          <div class="transaction-amount ${getAmountClass(transaction)}">
              ${formatAmount(transaction)}
          </div>
          <div class="transaction-actions">
              <button class="btn-action btn-edit" data-id="${
                transaction.id
              }" title="Edit">
                  <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action btn-delete" data-id="${
                transaction.id
              }" title="Delete">
                  <i class="fas fa-trash"></i>
              </button>
          </div>
      </div>
    `;
    })
    .join("");

  container.html(transactionHtml);
  updatePagination();
}

function getTransactionIcon(type) {
  const icons = {
    INCOME: "fa-arrow-up",
    EXPENSE: "fa-arrow-down",
    TRANSFER: "fa-exchange-alt",
  };
  return icons[type] || "fa-circle";
}

function getAmountClass(transaction) {
  if (transaction.transactionType === "INCOME") return "positive";
  if (transaction.transactionType === "EXPENSE") return "negative";
  if (transaction.transactionType === "TRANSFER") return "neutral";
  return "";
}

function formatAmount(transaction) {
  const amount = Math.abs(transaction.amount);
  if (transaction.transactionType === "INCOME")
    return `+${Utils.formatCurrency(amount)}`;
  if (transaction.transactionType === "EXPENSE")
    return `-${Utils.formatCurrency(amount)}`;
  if (transaction.transactionType === "TRANSFER")
    return `${Utils.formatCurrency(amount)}`;
  return `${Utils.formatCurrency(amount)}`;
}

function renderSelectedTags() {
  const container = $("#selectedTags");
  const tagsHtml = selectedTags
    .map(
      (tag) => `
      <div class="selected-tag">
          ${tag.name}
          <button type="button" class="remove-tag" data-id="${tag.id}">×</button>
      </div>
    `
    )
    .join("");
  container.html(tagsHtml);
}

function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(
    startIndex + itemsPerPage - 1,
    filteredTransactions.length
  );

  $("#paginationInfo").text(
    `Showing ${
      filteredTransactions.length > 0 ? startIndex : 0
    }-${endIndex} of ${filteredTransactions.length} transactions`
  );

  const controls = $("#paginationControls");
  controls.empty();

  if (totalPages > 1) {
    const prevBtn = $(
      '<button class="pagination-btn"><i class="fas fa-chevron-left"></i></button>'
    )
      .prop("disabled", currentPage === 1)
      .on("click", () => changePage(currentPage - 1));
    controls.append(prevBtn);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = $(`<button class="pagination-btn">${i}</button>`)
        .toggleClass("active", i === currentPage)
        .on("click", () => changePage(i));
      controls.append(pageBtn);
    }

    const nextBtn = $(
      '<button class="pagination-btn"><i class="fas fa-chevron-right"></i></button>'
    )
      .prop("disabled", currentPage === totalPages)
      .on("click", () => changePage(currentPage + 1));
    controls.append(nextBtn);
  }
}

function applyFilters() {
  const searchTerm = $("#searchInput").val().toLowerCase();
  const typeFilter = $("#typeFilter").val();
  const categoryFilter = $("#categoryFilter").val();
  const accountFilter = $("#accountFilter").val();
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();

  filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm) ||
      transaction.categoryName.toLowerCase().includes(searchTerm) ||
      (transaction.financialAccountName &&
        transaction.financialAccountName.toLowerCase().includes(searchTerm)) ||
      (transaction.sourceAccountName &&
        transaction.sourceAccountName.toLowerCase().includes(searchTerm)) ||
      (transaction.destinationAccountName &&
        transaction.destinationAccountName
          .toLowerCase()
          .includes(searchTerm)) ||
      (transaction.externalAccountName &&
        transaction.externalAccountName.toLowerCase().includes(searchTerm)) ||
      (transaction.tags &&
        transaction.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchTerm)
        ));

    const matchesType =
      !typeFilter || transaction.transactionType === typeFilter;

    const matchesCategory =
      !categoryFilter || transaction.categoryId.toString() === categoryFilter;

    const matchesAccount =
      !accountFilter ||
      (transaction.financialAccountId &&
        transaction.financialAccountId.toString() === accountFilter) ||
      (transaction.sourceAccountId &&
        transaction.sourceAccountId.toString() === accountFilter) ||
      (transaction.destinationAccountId &&
        transaction.destinationAccountId.toString() === accountFilter);

    const transactionDate = new Date(transaction.transactionDate)
      .toISOString()
      .split("T")[0];
    const matchesStartDate = !startDate || transactionDate >= startDate;
    const matchesEndDate = !endDate || transactionDate <= endDate;

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesAccount &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  currentPage = 1;
  updateSummaryCards();
  renderTransactions();
}

function clearFilters() {
  $(
    "#searchInput, #typeFilter, #categoryFilter, #accountFilter, #startDate, #endDate"
  ).val("");
  filteredTransactions = [...transactions];
  currentPage = 1;
  updateSummaryCards();
  renderTransactions();
}

async function handleFormSubmission(e) {
  e.preventDefault();

  AlertManager.toast("handleFormSubmission loading", "info");

  const form = $("#transactionForm");
  const description = $("#transactionDescription").val().trim();
  const amount = parseFloat($("#transactionAmount").val());
  const type = $("#transactionType").val().toUpperCase();
  const date = $("#transactionDate").val();
  const sourceAccountId = parseInt($("#transactionSourceAccount").val());
  const categoryId = parseInt($("#transactionCategory").val());

  if (!description || isNaN(amount) || !date) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  let transactionData = {
    description: description,
    amount: amount,
    transactionType: type,
    transactionDate: date,
    financialAccountId: sourceAccountId,
    categoryId: categoryId,
    tagIds: selectedTags.map((t) => t.id),
  };

  if (type === "transfer") {
    const destinationType = $("#destinationType").val();
    const transferNotes = $("#transferNotes").val().trim();

    if (isNaN(sourceAccountId) || isNaN(categoryId)) {
      showNotification("Please select source account and category", "error");
      return;
    }

    const sourceAccount = accounts.find((a) => a.id === sourceAccountId);
    const category = categories.find((c) => c.id === categoryId);

    transactionData = {
      ...transactionData,
      sourceAccountName: sourceAccount.name,

      transferNotes: transferNotes || "",
    };

    if (destinationType === "internal") {
      const destinationAccountId = parseInt(
        $("#transactionDestinationAccount").val()
      );
      if (isNaN(destinationAccountId)) {
        showNotification("Please select destination account", "error");
        return;
      }
      if (sourceAccountId === destinationAccountId) {
        showNotification(
          "Source and destination accounts cannot be the same",
          "error"
        );
        return;
      }

      const destinationAccount = accounts.find(
        (a) => a.id === destinationAccountId
      );
      transactionData = {
        ...transactionData,
        destinationAccountId: destinationAccountId,
        destinationAccountName: destinationAccount.name,
        isInternal: true,
      };
    } else {
      const externalAccountName = $("#externalAccountName").val().trim();
      const externalAccountNumber = $("#externalAccountNumber").val().trim();

      if (!externalAccountName) {
        showNotification("Please enter external account name", "error");
        return;
      }

      transactionData = {
        ...transactionData,
        externalAccountName: externalAccountName,
        externalAccountNumber: externalAccountNumber || "",
        isInternal: false,
      };
    }
  }
  // } else {
  //   if (isNaN(transactionAccountId) || isNaN(categoryId)) {
  //     showNotification("Please select account and category", "error");
  //     return;
  //   }

  //   const account = accounts.find((a) => a.id === transactionAccountId);
  //   const category = categories.find((c) => c.id === categoryId);

  //   // transactionData = {
  //   //   ...transactionData,
  //   //   amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
  //   //   transactionAccountId: transactionAccountId,
  //   //   accountName: account.name,
  //   //   categoryId: categoryId,
  //   //   categoryName: category.name,
  //   // };
  // }

  try {
    const submitBtn = $("#transactionForm button[type='submit']");
    const originalText = submitBtn.text();
    submitBtn.prop("disabled", true).text("Saving...");

    if (editingId) {
      await updateTransaction(editingId, transactionData);
      showNotification("Transaction updated successfully", "success");
    } else {
      console.log("Transaction Data: " + transactionData);
      await createTransaction(transactionData);
      showNotification("Transaction added successfully", "success");
    }

    await fetchTransactions();
    applyFilters();
    closeTransactionModal();
  } catch (error) {
    console.error("Save transaction error:", error);
    showNotification("Failed to save transaction", "error");
  }
}

function openTransactionModal(id = null) {
  editingId = id;
  const modal = $("#transactionModal");
  const title = $("#transactionModalTitle");
  const submitText = $("#transactionSubmitText");
  const form = $("#transactionForm");

  if (id) {
    const transaction = transactions.find((t) => t.id === id);
    title.text("Edit Transaction");
    submitText.text("Update Transaction");

    selectTransactionType(transaction.transactionType);
    $("#transactionDescription").val(transaction.description);
    $("#transactionAmount").val(Math.abs(transaction.amount));
    $("#transactionDate").val(transaction.transactionDate.slice(0, 16));
    $("#transactionCategory").val(transaction.categoryId);

    if (transaction.transactionType === "TRANSFER") {
      $("#transactionSourceAccount").val(transaction.sourceAccountId);
      $("#transferNotes").val(transaction.transferNotes || "");

      if (transaction.isInternal) {
        selectDestinationType("internal");
        $("#transactionDestinationAccount").val(
          transaction.destinationAccountId
        );
      } else {
        destinationAccountId;
        selectDestinationType("external");
        $("#externalAccountName").val(transaction.externalAccountName);
        $("#externalAccountNumber").val(
          transaction.externalAccountNumber || ""
        );
      }
    } else {
      $("#transactionSourceAccount").val(
        transaction.financialAccountId || transaction.transactionAccountId
      );
    }

    selectedTags = [...(transaction.tags || [])];
    renderSelectedTags();
  } else {
    title.text("Add New Transaction");
    submitText.text("Add Transaction");
    form[0].reset();
    selectTransactionType("expense");
    selectDestinationType("internal");
    setDefaultDate();
    selectedTags = [];
    renderSelectedTags();
  }

  modal.addClass("show");
}

function closeTransactionModal() {
  $("#transactionModal").removeClass("show");
  editingId = null;
  selectedTags = [];

  const submitBtn = $("#transactionForm button[type='submit']");
  submitBtn.prop("disabled", false);
}

function editTransaction(id) {
  openTransactionModal(id);
}

function viewTransaction(id) {
  console.log("View transaction:", id);
  // Could implement a detailed view modal here
}

async function deleteTransaction(id) {
  const title = "Transaction Deletion";
  const message = "Are you sure you want to delete this transaction";
  const type = "question";

  AlertManager.confirm(title, message, type).then(async function (result) {
    if (!result.isConfirmed) {
      AlertManager.toast("Action cancelled", "info");
      return;
    }

    try {
      await deleteTransactionAPI(id);
      await fetchTransactions();
      applyFilters();

      AlertManager.toast("Transaction deleted successfully", "success");
    } catch (error) {
      console.error("Delete transaction error:", error);
      showNotification("Failed to delete transaction", "error");
    }
  });
}

function selectTransactionType(type) {
  $(".type-option").removeClass("active");
  $(`[data-type="${type}"]`).addClass("active");
  $("#transactionType").val(type);

  // Show/hide relevant form sections
  const sourceGroup = $("#sourceAccountGroup");
  const destGroup = $("#destinationAccountGroup");
  const transferNotesGroup = $("#transferNotesGroup");
  const sourceLabel = $("#sourceAccountLabel");

  if (type === "transfer") {
    sourceLabel.text("From Account");
    destGroup.show();
    transferNotesGroup.show();
    $("#transactionSourceAccount").attr("required", true);
  } else {
    sourceLabel.text(type === "income" ? "To Account" : "From Account");
    destGroup.hide();
    transferNotesGroup.hide();
    $("#transactionSourceAccount").attr("required", true);
    $("#transactionDestinationAccount").removeAttr("required");
  }

  updateCategoryOptions();
}

function selectDestinationType(type) {
  $(".account-type-option").removeClass("active");
  $(`[data-dest-type="${type}"]`).addClass("active");
  $("#destinationType").val(type);

  const accountSelect = $("#transactionDestinationAccount");
  const externalInputs = $("#externalAccountInputs");

  if (type === "internal") {
    accountSelect.show().attr("required", true);
    externalInputs.hide();
    $("#externalAccountName").removeAttr("required");
  } else {
    accountSelect.hide().removeAttr("required");
    externalInputs.show();
    $("#externalAccountName").attr("required", true);
  }
}

function updateCategoryOptions() {
  const transactionType = $("#transactionType").val().toUpperCase();
  const categorySelect = $("#transactionCategory");

  categorySelect.empty().append('<option value="">Select category</option>');
  const filteredCategories = categories.filter(
    (cat) => cat.transactionType === transactionType
  );

  $.each(filteredCategories, function (i, category) {
    categorySelect.append(
      `<option value="${category.id}">${category.name}</option>`
    );
  });
}

function setDefaultDate() {
  const now = new Date();
  const localDateTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
  $("#transactionDate").val(localDateTime);
}

function handleTagSelection() {
  const tagId = parseInt($(this).val());
  if (tagId && !selectedTags.some((tag) => tag.id === tagId)) {
    const tag = tags.find((t) => t.id === tagId);
    if (tag) {
      selectedTags.push(tag);
      renderSelectedTags();
    }
  }
  $(this).val("");
}

function removeTag(tagId) {
  selectedTags = selectedTags.filter((tag) => tag.id !== tagId);
  renderSelectedTags();
}

function changePage(page) {
  currentPage = page;
  renderTransactions();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function showNotification(message, type = "info") {
  if (window.NotificationManager) {
    window.NotificationManager.add(message, type);
  } else {
    const notification = $("<div></div>");
    notification.addClass(`notification ${type}`).text(message);

    if (!$("#notification-styles").length) {
      $("head").append(`
        <style id="notification-styles">
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
          }
          .notification.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
          .notification.error { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); }
          .notification.info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .notification.warning { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            min-height: 200px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .loading-text {
            margin-top: 16px;
            color: #666;
            font-size: 14px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `);
    }

    $("body").append(notification);

    setTimeout(function () {
      notification.fadeOut(300, function () {
        notification.remove();
      });
    }, 3000);
  }
}

async function refreshTransactionData() {
  try {
    showLoadingState();
    await fetchTransactions();
    applyFilters();
    hideLoadingState();
  } catch (error) {
    console.error("Failed to refresh data:", error);
    NotificationManager.add("Failed to refresh transaction data", "danger");
    hideLoadingState();
  }
}
