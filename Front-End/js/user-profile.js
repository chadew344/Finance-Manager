$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();
  initializeProfile();
});

function initializeProfile() {
  setupAvatarUpload();

  setupPersonalInfoForm();
  setupPasswordForm();
  setupPreferencesForm();

  setupModalHandlers();

  setupProfileEventListeners();

  console.log("User profile initialized");
}

function setupAvatarUpload() {
  $("#avatarInput").on("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        showAlert("Avatar updated successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
  });
}

function setupPersonalInfoForm() {
  $("#personalInfoForm").on("submit", function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      showAlert("Personal information updated successfully!", "success");

      const firstName = $("#firstName").val();
      const lastName = $("#lastName").val();
      $(".profile-info h2").text(`${firstName} ${lastName}`);
    }, 1500);
  });
}

function setupPasswordForm() {
  const newPasswordInput = $("#newPassword");
  const passwordStrengthDiv = $("#passwordStrength");
  const confirmPasswordInput = $("#confirmPassword");

  newPasswordInput.on("input", function () {
    const password = $(this).val();
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength);
  });

  $("#passwordForm").on("submit", function (e) {
    e.preventDefault();

    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();

    if (newPassword !== confirmPassword) {
      showAlert("New passwords do not match!", "error");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("Password must be at least 8 characters long!", "error");
      return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      showAlert("Password changed successfully!", "success");

      this.reset();
      passwordStrengthDiv.text("");
    }, 2000);
  });
}

function calculatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.match(/[a-z]/)) score += 1;
  if (password.match(/[A-Z]/)) score += 1;
  if (password.match(/[0-9]/)) score += 1;
  if (password.match(/[^a-zA-Z0-9]/)) score += 1;

  if (score < 3) return "weak";
  if (score < 5) return "medium";
  return "strong";
}

function updatePasswordStrength(strength) {
  const passwordStrengthDiv = $("#passwordStrength");
  passwordStrengthDiv
    .removeClass()
    .addClass(`password-strength strength-${strength}`);

  const messages = {
    weak: "Weak - Use a longer password with mixed case, numbers, and symbols",
    medium: "Medium - Good, but consider adding more complexity",
    strong: "Strong - Great password!",
  };

  passwordStrengthDiv.text(messages[strength] || "");
}

function setupPreferencesForm() {
  $("#preferencesForm").on("submit", function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      showAlert("Preferences saved successfully!", "success");
    }, 1000);
  });
}

function setupModalHandlers() {
  $("#deleteConfirmation").on("input", function () {
    const confirmBtn = $("#confirmDeleteBtn");
    confirmBtn.prop("disabled", $(this).val() !== "DELETE");
  });

  $(document).on("click", function (e) {
    if ($(e.target).hasClass("modal")) {
      $(e.target).removeClass("show");
    }
  });
}

function showModal(modalId) {
  $(`#${modalId}`).addClass("show");
}

function closeModal(modalId) {
  $(`#${modalId}`).removeClass("show");
}

function setup2FA() {
  showModal("twoFAModal");
}

function verify2FA() {
  const code = $("#verificationCode").val();

  if (code.length !== 6) {
    showAlert("Please enter a valid 6-digit code.", "error");
    return;
  }

  setTimeout(() => {
    closeModal("twoFAModal");
    showAlert("Two-factor authentication enabled successfully!", "success");
    $("#verificationCode").val("");
  }, 1000);
}

function confirmDeleteAccount() {
  showModal("deleteModal");
}

function deleteAccount() {
  setTimeout(() => {
    alert("Account deletion would happen here. Redirecting to login...");
    closeModal("deleteModal");
  }, 1000);
}

function exportData() {
  const btn = event.target;
  const originalText = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    showAlert("Data export completed! Check your downloads.", "success");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8,Account data export would be here..."
    );
    element.setAttribute("download", "financeflow_data_export.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, 2000);
}

function showAlert(message, type) {
  const alertContainer = $("#alertContainer");
  const alertDiv = $(`
    <div class="alert ${type}">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        ${message}
      </div>
    </div>
  `);

  alertContainer.append(alertDiv);
  alertDiv.show();

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);

  alertContainer[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setupProfileEventListeners() {
  $(".profile-avatar").on("click", function () {
    $("#avatarInput").click();
  });

  const profileLinks = $(".nav-link");
  profileLinks.each(function () {
    const link = $(this);
    if (link.attr("href") && link.attr("href").includes("user-profile")) {
      link.addClass("active");
    } else {
      link.removeClass("active");
    }
  });
}

window.showModal = showModal;
window.closeModal = closeModal;
window.setup2FA = setup2FA;
window.verify2FA = verify2FA;
window.confirmDeleteAccount = confirmDeleteAccount;
window.deleteAccount = deleteAccount;
window.exportData = exportData;
