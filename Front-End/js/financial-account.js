const BASE_URL = "http://localhost:8080/api/v1/financial-account";

const accessToken = localStorage.getItem("accessToken");

let editingAccountId = null;
let isCreditCard = false;
let accountId;

const accountTypeConfig = {
  BANK: { icon: "fas fa-university", label: "Bank Account" },
  CREDIT_CARD: { icon: "fas fa-credit-card", label: "Credit Card" },
  CHECKING: { icon: "fas fa-money-check-alt", label: "Debit Card" },
  SAVING: { icon: "fas fa-piggy-bank", label: "Savings Account" },
  INVESTMENT: { icon: "fas fa-chart-line", label: "Investment Account" },
};

$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();
  accountId = DataManager.get("userAccountId");

  renderAccounts();

  $("#accountForm").on("submit", handleFormSubmit);

  $("#accountType").on("change", function () {
    if ($(this).val() === "CREDIT_CARD") {
      isCreditCard = true;
      $("#creditCardFields").show();
    } else {
      isCreditCard = false;
      $("#creditCardFields").hide();
      $("#creditCardFields input").val("");
    }
  });

  $("#accountModal").on("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });
});

// async function checkSocket() {
//   try {
//     const response = await window.apiCall(
//       "http://localhost:8080/api/v1/notification/new-transaction",
//       {
//         method: "GET",
//       }
//     );

//     const apiResponse = await response.json();
//     console.log("Notification data received:", apiResponse);
//   } catch (error) {
//     console.error("Error loading Notification:", error);
//     throw error;
//   }
// }

async function renderAccounts() {
  try {
    const response = await window.apiCall(`${BASE_URL}/user/${accountId}`, {
      method: "GET",
    });

    console.log(response);

    if (!response.ok) {
      zeroAccounts();
      return;
    }

    const accountResponse = await response.json();
    appendAccounts(accountResponse.data);
    console.log(accountResponse);
    console.log(accountResponse.data);
  } catch (error) {
    console.log(error);
    zeroAccounts();
  }
}

function appendAccounts(accounts) {
  console.log(accounts.length);
  console.log(accounts);

  if (accounts.length === 0) {
    zeroAccounts();
    return;
  }

  const $grid = $("#accountsGrid").empty();

  accounts.forEach((account) => {
    console.log(account);
    const $card = createAccountCard(account);
    $grid.append($card);
  });
}

function zeroAccounts() {
  const $grid = $("#accountsGrid").empty();

  $grid.html(`
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <h3>No Accounts Added Yet</h3>
        <p>Add your first account to get started managing your finances.</p>
      </div>
    `);
}

function createAccountCard(account) {
  const config = accountTypeConfig[account.accountType];
  const formattedBalance = formatCurrency(account.balance, account.currency);
  const balanceClass = account.balance >= 0 ? "" : "text-danger";

  return `
                <div class="account-card ${account.accountType}">
                    <div class="account-header">
                        <div class="account-type">
                            <div class="account-icon ${account.accountType}">
                                <i class="${config.icon}"></i>
                            </div>
                            <div class="account-info">
                                <h3>${account.accountName}</h3>
                                <div class="account-number">${
                                  account.accountNumber
                                }</div>
                            </div>
                        </div>
                        <div class="account-actions">
                            <button class="btn-action btn-edit" onclick="editAccount(${
                              account.id
                            })" title="Edit Account">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" onclick="deleteAccount(${
                              account.id
                            })" title="Delete Account">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="account-balance">
                        <div class="balance-label">Current Balance</div>
                        <div class="balance-amount ${balanceClass}">${formattedBalance}</div>
                    </div>
                    
                    <div class="account-details">
                        <div class="detail-item">
                            <div class="detail-label">Type</div>
                            <div class="detail-value">${config.label}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Institution</div>
                            <div class="detail-value">${
                              account.institutionName
                            }</div>
                        </div>
                    </div>
                    
                    ${
                      account.description
                        ? `
                        <div class="detail-item" style="margin-top: 1rem;">
                            <div class="detail-label">Description</div>
                            <div class="detail-value">${account.description}</div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

async function openModal(mode, accountId = null) {
  const $modal = $("#accountModal");
  const $title = $("#modalTitle");
  const $submitText = $("#submitText");
  const $form = $("#accountForm");

  $form[0].reset();
  editingAccountId = null;

  if (mode === "add") {
    $title.text("Add New Account");
    $submitText.text("Add Account");
    $("#currency").val("LKR");
  } else if (mode === "edit" && accountId) {
    const account = await findAccountById(accountId);
    console.log("Edit account:" + account);
    if (account) {
      $title.text("Edit Account");
      $submitText.text("Update Account");
      editingAccountId = accountId;

      $("#accountName").val(account.accountName);
      $("#accountType").val(account.accountType);
      $("#institutionName").val(account.institutionName);
      $("#accountNumber").val(account.accountNumber);
      $("#balance").val(account.balance);
      $("#currency").val(account.currency);
      $("#description").val(account.description || "");
    }
  }

  $modal.addClass("show");
  $("body").css("overflow", "hidden");
}

async function findAccountById(accountId) {
  try {
    const response = await window.apiCall(`${BASE_URL}/${accountId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.data);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch account:", error);
    throw error;
  }
}

function closeModal() {
  $("#accountModal").removeClass("show");
  $("body").css("overflow", "");
  editingAccountId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const $submitBtn = $("#submitBtn");
  const $submitText = $("#submitText");
  const $submitLoader = $("#submitLoader");

  // Show loader state
  $submitText.hide();
  $submitLoader.show();
  $submitBtn.prop("disabled", true);

  const accountData = {
    accountName: $("#accountName").val(),
    currency: $("#currency").val(),
    balance: parseFloat($("#balance").val()) || 0,
    accountType: $("#accountType").val(),
    accountNumber: $("#accountNumber").val(),
    institutionName: $("#institutionName").val(),
    description: $("#description").val(),
  };

  if (accountData.accountType === "CREDIT_CARD") {
    accountData.creditCardDetails = {
      currency: $("#currency").val(),
      description: $("#description").val(),
      creditLimit: $("#creditLimit").val() || null,
      apr: $("#apr").val() || null,
    };
  }

  try {
    if (editingAccountId) {
      const response = await window.apiCall(`${BASE_URL}/${editingAccountId}`, {
        method: "PUT",
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        NotificationManager.add("Account updated successfully!", "success");
      } else {
        NotificationManager.add("Failed to update account.", "danger");
      }
    } else {
      const newAccountResponse = await createFinancialAccount(accountData);
      if (newAccountResponse) {
        NotificationManager.add("Account created successfully!", "success");
      } else {
        NotificationManager.add("Failed to create account.", "danger");
      }
    }

    await renderAccounts();
    closeModal();
  } catch (err) {
    console.error("Form submit error:", err);
    NotificationManager.add(
      "An unexpected error occurred. Please try again.",
      "danger"
    );
  } finally {
    $submitText.show();
    $submitLoader.hide();
    $submitBtn.prop("disabled", false);
  }
}

async function createFinancialAccount(account) {
  try {
    const response = await window.apiCall(`${BASE_URL}/${accountId}`, {
      method: "POST",
      body: JSON.stringify(account),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Account created successfully:", data);
    return data;
  } catch (error) {
    console.error("Create account error:", error);
    NotificationManager.add("Failed to create account", "danger");
  }
}

function editAccount(accountId) {
  openModal("edit", accountId);
}

async function deleteAccount(accountId) {
  if (
    confirm(
      "Are you sure you want to delete this account? This action cannot be undone."
    )
  ) {
    try {
      const response = await window.apiCall(`${BASE_URL}/${accountId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        NotificationManager.add("Account deleted successfully!", "success");
        await renderAccounts();
      } else {
        NotificationManager.add("Failed to delete account.", "danger");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      NotificationManager.add(
        "Failed to delete account due to a network error.",
        "danger"
      );
    }
  }
}
