const BASE_URL_USER_ACCOUNT = "http://localhost:8080/api/v1/user-account";
let userAccountId;

$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();
  userAccountId = DataManager.get("userAccountId");

  UserManagement.init();
});

const UserManagement = {
  users: [],
  currentPlan: {},

  init: async function () {
    this.bindEvents();
    await this.fetchInitialData();
    console.log("User Management initialized");
  },

  bindEvents: function () {
    $("#addUserBtn").on("click", () => {
      this.handleAddUser();
    });

    $("#upgradeBtn, .empty-user-slot").on("click", () => {
      this.showUpgradeModal();
    });

    $("#closeAddUserModal, #cancelAddUser").on("click", () => {
      this.closeModal("#addUserModal");
    });

    $("#closeUpgradeModal").on("click", () => {
      this.closeModal("#upgradePlanModal");
    });

    $("#closeUserExistsModal, #editInvitation").on("click", () => {
      this.closeModal("#userExistsModal");
      this.showModal("#addUserModal");
    });

    $("#sendInvitation").on("click", (e) => {
      e.preventDefault();
      this.handleSendInvitation();
    });

    $("#confirmSendInvitation").on("click", () => {
      this.handleConfirmSendInvitation();
    });

    $(".btn-upgrade-pro").on("click", () => {
      this.handleUpgrade("PRO");
    });

    $(".btn-upgrade-enterprise").on("click", () => {
      this.handleUpgrade("ENTERPRISE");
    });

    $(document).on("click", ".btn-resend", function () {
      const userId = $(this).closest(".user-card").data("user-id");
      UserManagement.handleResendInvitation(userId);
    });

    $(document).on("click", ".btn-remove", function () {
      const userId = $(this).closest(".user-card").data("user-id");
      UserManagement.handleRemoveUser(userId);
    });

    $("#markAllRead").on("click", () => {
      if (typeof NotificationManager !== "undefined") {
        NotificationManager.markAllAsRead();
      }
    });

    console.log("User Management events bound");
  },

  fetchInitialData: async function () {
    try {
      let response = await window.apiCall(
        `${BASE_URL_USER_ACCOUNT}/user-manager/${userAccountId}`
      );

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to fetch initial data.");
      }

      let apiRespone = await response.json();

      console.log(apiRespone);

      this.users = apiRespone.data.sharedUser;
      this.currentPlan = apiRespone.data.currentPlan;

      console.log(this.users);
      console.log(this.currentPlan);

      this.updatePlanDisplay();
      this.renderUsers();
    } catch (error) {
      console.error("Initialization error:", error);
      AlertManager.toast("Could not load data. Please try again.", "warning");
    }
  },

  handleSendInvitation: async function () {
    const email = $("#userEmail").val().trim();
    const role = $("#userRole").val();
    const message = $("#inviteMessage").val().trim();

    if (!email || !role) {
      AlertManager.toast("Please fill in all required fields", "warning");
      return;
    }
    if (!this.isValidEmail(email)) {
      AlertManager.toast("Please enter a valid email address", "warning");
      return;
    }

    this.setButtonLoading("#sendInvitation", true);

    if (this.checkEmailResitered(email)) {
      AlertManager.toast("Invitation Cancellation!!!");
    }

    let invitation = {
      email,
      role,
      message,
    };

    try {
      const response = await window.apiCall(
        `${BASE_URL_USER_ACCOUNT}/invite-user`,
        {
          method: "POST",
          body: JSON.stringify(invitation),
        }
      );

      this.setButtonLoading("#sendInvitation", false);

      if (!this.checkEmailResitered(email)) {
        AlertManager.toast("Invitation sending cancelled.", "info");
      }

      if (response.ok) {
        const newUser = await response.json();
        this.addUserToList(newUser);
        this.closeModal("#addUserModal");
        this.clearAddUserForm();
        AlertManager.toast("Invitation sent successfully!", "success");
      } else if (response.status === 409) {
        const errorData = await response.json();
        this.showUserExistsModal(
          errorData.email,
          errorData.role,
          errorData.message
        );
      } else {
        const errorData = await response.json();
        AlertManager.toast(
          errorData.message || "An error occurred.",
          "warning"
        );
      }
    } catch (error) {
      this.setButtonLoading("#sendInvitation", false);
      console.error("Invitation failed:", error);
      AlertManager.toast(
        "Failed to send invitation. Check network.",
        "warning"
      );
    }
  },

  checkEmailResitered: async function (email) {
    let response = await window.apiCall(
      `${BASE_URL_USER_ACCOUNT}/check-email`,
      {
        method: "POST",
        body: JSON.stringify(email),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData.message);
      AlertManager.toast("An error occurred while checking email.", "warning");
      return false;
    }

    let apiResponse = await response.json();

    if (apiResponse.data === false) {
      const result = await AlertManager.confirm(
        "Unregistered Email",
        "Do you still want to send invitation via email?",
        "question"
      );
      return result.isConfirmed;
    }

    return true;
  },

  handleConfirmSendInvitation: async function () {
    const email = $("#foundUserEmail").text();
    const role = $("#invitationRole").text().toLowerCase();
    const message = $("#invitationMessagePreview span").text();

    this.setButtonLoading("#confirmSendInvitation", true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.inviteUser}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role, message }),
        }
      );

      this.setButtonLoading("#confirmSendInvitation", false);

      if (response.ok) {
        const newUser = await response.json();
        this.addUserToList(newUser);
        this.closeModal("#userExistsModal");
        AlertManager.toast("Invitation sent successfully!", "success");
        this.clearAddUserForm();
      } else {
        const errorData = await response.json();
        AlertManager.toast(
          errorData.message || "An error occurred.",
          "warning"
        );
      }
    } catch (error) {
      this.setButtonLoading("#confirmSendInvitation", false);
      console.error("Invitation confirmation failed:", error);
      AlertManager.toast(
        "Failed to send invitation. Check network.",
        "warning"
      );
    }
  },

  handleResendInvitation: async function (userId) {
    const user = this.users.find((u) => u.id == userId);
    if (!user) return;

    const result = await AlertManager.confirm(
      "Resend Invitation",
      `Are you sure you want to resend the invitation to ${user.email}?`,
      "question"
    );

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL_USER_ACCOUNT}${API_CONFIG.ENDPOINTS.resendInvite(
            userId
          )}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to resend invitation.");
        }
        AlertManager.toast(`Invitation resent to ${user.email}`, "success");
      } catch (error) {
        console.error("Resend failed:", error);
        AlertManager.toast(
          error.message || "Failed to resend invitation. Please try again.",
          "warning"
        );
      }
    }
  },

  handleRemoveUser: async function (userId) {
    const user = this.users.find((u) => u.id == userId);
    if (!user || user.isOwner) return;

    const result = await AlertManager.confirm(
      "Remove User",
      `Are you sure you want to remove ${user.name} from your account? This action cannot be undone.`,
      "warning"
    );

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.removeUser(userId)}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove user.");
        }

        this.users = this.users.filter((u) => u.id != userId);
        this.currentPlan.currentUsers--;
        this.renderUsers();
        this.updatePlanDisplay();
        AlertManager.toast(`${user.name} has been removed`, "success");
      } catch (error) {
        console.error("Removal failed:", error);
        AlertManager.toast(
          error.message || "Failed to remove user. Please try again.",
          "warning"
        );
      }
    }
  },

  handleUpgrade: async function (planType) {
    this.setButtonLoading(`.btn-upgrade-${planType.toLowerCase()}`, true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.upgradePlan}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planType }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upgrade plan.");
      }

      const updatedPlan = await response.json();
      this.currentPlan = updatedPlan;

      this.setButtonLoading(`.btn-upgrade-${planType.toLowerCase()}`, false);
      this.closeModal("#upgradePlanModal");
      this.updatePlanDisplay();

      AlertManager.toast(
        `Successfully upgraded to ${planType} plan!`,
        "success"
      );
    } catch (error) {
      this.setButtonLoading(`.btn-upgrade-${planType.toLowerCase()}`, false);
      console.error("Upgrade failed:", error);
      AlertManager.toast(
        error.message || "Failed to upgrade plan. Please try again.",
        "warning"
      );
    }
  },

  handleAddUser: function () {
    if (this.canAddUser()) {
      this.showModal("#addUserModal");
      $("#userEmail").focus();
    } else {
      this.showUpgradeModal();
    }
  },

  canAddUser: function () {
    return this.currentPlan.currentUsers < this.currentPlan.maxUsers;
  },

  showUserExistsModal: function (email, role, message) {
    $("#foundUserEmail").text(email);
    $("#foundUserName").text(this.generateNameFromEmail(email));
    $("#invitationRole").text(this.getRoleDisplayName(role));

    if (message) {
      $("#invitationMessagePreview span").text(message);
    } else {
      $("#invitationMessagePreview span").text(
        "You're invited to collaborate on managing my FinanceFlow account."
      );
    }

    this.closeModal("#addUserModal");
    this.showModal("#userExistsModal");
  },

  addUserToList: function (newUser) {
    this.users.push(newUser);
    this.currentPlan.currentUsers++;
    this.renderUsers();
    this.updatePlanDisplay();
  },

  updatePlanDisplay: function () {
    const planNames = {
      FREE: "Free Plan",
      PRO: "Pro Plan",
      ENTERPRISE: "Enterprise Plan",
    };
    const planDescriptions = {
      FREE: "Basic features with limited user access",
      PRO: "Advanced features with up to 5 users",
      ENTERPRISE: "Full features with unlimited users",
    };

    $("#currentPlanName").text(planNames[this.currentPlan.type]);
    $(".plan-description").text(planDescriptions[this.currentPlan.type]);
    $("#planBadge").text(this.currentPlan.type);

    const maxUsers =
      this.currentPlan.maxUsers === 999 ? "∞" : this.currentPlan.maxUsers;
    $("#userLimit").text(`${this.currentPlan.currentUsers} / ${maxUsers}`);

    let progressPercent =
      this.currentPlan.maxUsers === 999
        ? this.currentPlan.currentUsers > 0
          ? 20
          : 0
        : (this.currentPlan.currentUsers / this.currentPlan.maxUsers) * 100;

    $("#userProgressBar .progress-fill").css("width", `${progressPercent}%`);

    const $planCard = $(".plan-status-card");
    $planCard.removeClass("premium enterprise");
    if (this.currentPlan.type === "PERSONAL_PRO") {
      $planCard.addClass("premium");
    } else if (this.currentPlan.type === "ENTERPRISE") {
      $planCard.addClass("enterprise");
    }

    if (this.canAddUser()) {
      $("#addUserBtn").show();
      $("#emptyUserSlot").hide();
    } else if (this.currentPlan.type === "PERSONAL_FREE") {
      $("#emptyUserSlot").show();
    } else {
      $("#emptyUserSlot").hide();
    }
  },

  renderUsers: function () {
    const $container = $("#userCardsContainer");
    const ownerCard = $container.find(".owner-card").detach();
    const emptySlot = $container.find(".empty-user-slot").detach();

    $container.empty().append(ownerCard);

    this.users.forEach((user) => {
      console.log("create user card: " + user);
      if (user.role !== "OWNER") {
        const userCard = this.createUserCard(user);
        $container.append(userCard);
      }
    });

    if (this.currentPlan.type === "PERSONAL_FREE" && !this.canAddUser()) {
      $container.append(emptySlot);
    }
  },

  // createUserCard: function (user) {
  //   const fullName = user.firstName + user.lastName;
  //   const roleClass = user.role.toLowerCase();
  //   const statusClass = user.userStatus.toLowerCase();
  //   const roleDisplayName = this.getRoleDisplayName(roleClass);
  //   const statusDisplayName =
  //     user.userStatus.charAt(0).toUpperCase() +
  //     user.userStatus.slice(1).toLowerCase();

  //   return $(`
  //       <div class="user-card invited-card" data-user-id="${user.id}">
  //         <div class="user-avatar-large">
  //           <i class="fas fa-user"></i>
  //         </div>
  //         <div class="user-details">
  //           <h4 class="user-name">${fullName}</h4>
  //           <p class="user-email">${user.email}</p>
  //           <span class="user-role ${roleClass}">${roleDisplayName}</span>
  //         </div>
  //         <div class="user-status">
  //           <span class="status-badge ${statusClass}">${statusDisplayName}</span>
  //         </div>
  //         <div class="user-actions">
  //           ${
  //             user.userStatus === "PENDING"
  //               ? `
  //             <button class="btn-action btn-resend" title="Resend Invitation">
  //               <i class="fas fa-paper-plane"></i>
  //             </button>
  //           `
  //               : ""
  //           }
  //           <button class="btn-action btn-remove" title="Remove User">
  //             <i class="fas fa-trash"></i>
  //           </button>
  //         </div>
  //       </div>
  //     `);
  // },

  createUserCard: function (user) {
    const fullName = (user.firstName || "") + " " + (user.lastName || "");

    const role = user.role || "COLLABORATOR"; // fallback if role missing
    const status = user.userStatus || "PENDING"; // fallback if status missing

    const roleClass = role.toLowerCase();
    const statusClass = status.toLowerCase();
    const roleDisplayName = this.getRoleDisplayName(role);
    const statusDisplayName =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    return $(`
    <div class="user-card invited-card" data-user-id="${user.id}">
      <div class="user-avatar-large">
        <i class="fas fa-user"></i>
      </div>
      <div class="user-details">
        <h4 class="user-name">${fullName.trim()}</h4>
        <p class="user-email">${user.email || ""}</p>
        <span class="user-role ${roleClass}">${roleDisplayName}</span>
      </div>
      <div class="user-status">
        <span class="status-badge ${statusClass}">${statusDisplayName}</span>
      </div>
      <div class="user-actions">
        ${
          status === "PENDING"
            ? `
          <button class="btn-action btn-resend" title="Resend Invitation">
            <i class="fas fa-paper-plane"></i>
          </button>
        `
            : ""
        }
        <button class="btn-action btn-remove" title="Remove User">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `);
  },

  showModal: function (modalId) {
    $(modalId).addClass("show").css("display", "flex");
    $("body").css("overflow", "hidden");
  },

  closeModal: function (modalId) {
    $(modalId).removeClass("show").css("display", "none");
    $("body").css("overflow", "");
  },

  showUpgradeModal: function () {
    this.showModal("#upgradePlanModal");
  },

  clearAddUserForm: function () {
    $("#addUserForm")[0].reset();
  },

  setButtonLoading: function (selector, loading) {
    const $btn = $(selector);
    if (loading) {
      $btn.addClass("loading").prop("disabled", true);
    } else {
      $btn.removeClass("loading").prop("disabled", false);
    }
  },

  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  },

  generateNameFromEmail: function (email) {
    const username = email.split("@")[0];
    const names = username.split(/[._-]/);
    return names
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(" ");
  },

  getRoleDisplayName: function (role) {
    const roleNames = {
      owner: "Account Owner",
      collaborator: "Collaborator",
      viewer: "Viewer",
    };
    return roleNames[role.toLowerCase()] || role;
  },
};
