$(document).ready(function () {
  console.log("User Management Module Initialized");

  const UserManagement = {
    currentPlan: {
      type: "FREE",
      maxUsers: 1,
      currentUsers: 1,
    },

    users: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "owner",
        status: "active",
        isOwner: true,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "collaborator",
        status: "pending",
        isOwner: false,
        invitedAt: new Date().toISOString(),
      },
    ],

    init: function () {
      this.bindEvents();
      this.updatePlanDisplay();
      this.renderUsers();
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

    handleSendInvitation: function () {
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

      setTimeout(() => {
        this.setButtonLoading("#sendInvitation", false);

        const userExists = Math.random() < 0.7;

        if (userExists) {
          this.showUserExistsModal(email, role, message);
        } else {
          this.sendInvitationToNewUser(email, role, message);
        }
      }, 1500);
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

    handleConfirmSendInvitation: function () {
      const email = $("#foundUserEmail").text();
      const role = $("#invitationRole").text().toLowerCase();
      const message = $("#invitationMessagePreview span").text();

      this.setButtonLoading("#confirmSendInvitation", true);

      setTimeout(() => {
        this.setButtonLoading("#confirmSendInvitation", false);
        this.closeModal("#userExistsModal");
        this.addUserToList(
          email,
          this.generateNameFromEmail(email),
          role,
          "pending"
        );
        AlertManager.toast("Invitation sent successfully!", "success");
        this.clearAddUserForm();

        if (typeof NotificationManager !== "undefined") {
          NotificationManager.add(`Invitation sent to ${email}`, "info");
        }
      }, 1000);
    },

    sendInvitationToNewUser: function (email, role, message) {
      this.closeModal("#addUserModal");
      this.addUserToList(
        email,
        this.generateNameFromEmail(email),
        role,
        "pending"
      );
      AlertManager.toast("Invitation sent successfully!", "success");
      this.clearAddUserForm();

      if (typeof NotificationManager !== "undefined") {
        NotificationManager.add(`Invitation sent to ${email}`, "info");
      }
    },

    addUserToList: function (email, name, role, status) {
      const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        role: role,
        status: status,
        isOwner: false,
        invitedAt: new Date().toISOString(),
      };

      this.users.push(newUser);
      this.currentPlan.currentUsers++;
      this.renderUsers();
      this.updatePlanDisplay();
    },

    handleResendInvitation: function (userId) {
      const user = this.users.find((u) => u.id == userId);
      if (!user) return;

      AlertManager.confirm(
        "Resend Invitation",
        `Are you sure you want to resend the invitation to ${user.email}?`,
        "question"
      ).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            AlertManager.toast(`Invitation resent to ${user.email}`, "success");
            if (typeof NotificationManager !== "undefined") {
              NotificationManager.add(
                `Invitation resent to ${user.email}`,
                "info"
              );
            }
          }, 500);
        }
      });
    },

    handleRemoveUser: function (userId) {
      const user = this.users.find((u) => u.id == userId);
      if (!user || user.isOwner) return;

      AlertManager.confirm(
        "Remove User",
        `Are you sure you want to remove ${user.name} from your account? This action cannot be undone.`,
        "warning"
      ).then((result) => {
        if (result.isConfirmed) {
          this.users = this.users.filter((u) => u.id != userId);
          this.currentPlan.currentUsers--;
          this.renderUsers();
          this.updatePlanDisplay();

          AlertManager.toast(`${user.name} has been removed`, "success");
          if (typeof NotificationManager !== "undefined") {
            NotificationManager.add(
              `${user.name} removed from account`,
              "info"
            );
          }
        }
      });
    },

    handleUpgrade: function (planType) {
      this.setButtonLoading(`.btn-upgrade-${planType.toLowerCase()}`, true);

      setTimeout(() => {
        this.setButtonLoading(`.btn-upgrade-${planType.toLowerCase()}`, false);
        this.closeModal("#upgradePlanModal");

        this.currentPlan.type = planType;
        this.currentPlan.maxUsers = planType === "PRO" ? 5 : 999;
        this.updatePlanDisplay();

        AlertManager.toast(
          `Successfully upgraded to ${planType} plan!`,
          "success"
        );
        if (typeof NotificationManager !== "undefined") {
          NotificationManager.add(
            `Account upgraded to ${planType} plan`,
            "success"
          );
        }
      }, 2000);
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

      const planColors = {
        FREE: "warning",
        PRO: "primary",
        ENTERPRISE: "success",
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
      if (this.currentPlan.type === "PRO") {
        $planCard.addClass("premium");
      } else if (this.currentPlan.type === "ENTERPRISE") {
        $planCard.addClass("enterprise");
      }

      if (this.canAddUser()) {
        $("#addUserBtn").show();
        $("#emptyUserSlot").hide();
      } else if (this.currentPlan.type === "FREE") {
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
        if (!user.isOwner) {
          const userCard = this.createUserCard(user);
          $container.append(userCard);
        }
      });

      if (this.currentPlan.type === "FREE" && !this.canAddUser()) {
        $container.append(emptySlot);
      }
    },

    createUserCard: function (user) {
      const roleClass = user.role.toLowerCase();
      const statusClass = user.status.toLowerCase();
      const roleDisplayName = this.getRoleDisplayName(user.role);
      const statusDisplayName =
        user.status.charAt(0).toUpperCase() + user.status.slice(1);

      return $(`
        <div class="user-card invited-card new" data-user-id="${user.id}">
          <div class="user-avatar-large">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <h4 class="user-name">${user.name}</h4>
            <p class="user-email">${user.email}</p>
            <span class="user-role ${roleClass}">${roleDisplayName}</span>
          </div>
          <div class="user-status">
            <span class="status-badge ${statusClass}">${statusDisplayName}</span>
          </div>
          <div class="user-actions">
            ${
              user.status === "pending"
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
        .map(
          (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        )
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

  const DemoManager = {
    init: function () {
      this.setupPlanSimulation();
    },

    setupPlanSimulation: function () {
      $(document).on("keydown", function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === "P") {
          DemoManager.cyclePlan();
        }
      });
    },

    cyclePlan: function () {
      const plans = ["FREE", "PRO", "ENTERPRISE"];
      const currentIndex = plans.indexOf(UserManagement.currentPlan.type);
      const nextIndex = (currentIndex + 1) % plans.length;
      const nextPlan = plans[nextIndex];

      UserManagement.currentPlan.type = nextPlan;
      UserManagement.currentPlan.maxUsers =
        nextPlan === "FREE" ? 1 : nextPlan === "PRO" ? 5 : 999;

      UserManagement.updatePlanDisplay();
      UserManagement.renderUsers();

      AlertManager.toast(`Switched to ${nextPlan} plan (Demo Mode)`, "info");
      console.log(
        "Demo: Switched to",
        nextPlan,
        "plan. Press Ctrl+Shift+P to cycle plans."
      );
    },
  };

  function initializeUserManagement() {
    console.log("Initializing User Management...");

    UserManagement.init();
    DemoManager.init();

    console.log("User Management initialized successfully");

    setTimeout(() => {
      console.log(
        "💡 Demo Tip: Press Ctrl+Shift+P to cycle through different plan types"
      );
    }, 2000);
  }

  initializeUserManagement();
});
