$(document).ready(function () {
  const DEVELOPMENT_MODE = false;

  function debugTokenStorage() {
    console.log("=== TOKEN DEBUG INFO ===");
    console.log("All localStorage keys:", Object.keys(localStorage));
    console.log("localStorage contents:");

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }

    console.log(
      "Direct accessToken check:",
      localStorage.getItem("accessToken")
    );
    console.log("Case-insensitive search for access token:");

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key.toLowerCase().includes("access") ||
        key.toLowerCase().includes("token")
      ) {
        console.log(
          `  Found token-like key: ${key} = ${localStorage.getItem(key)}`
        );
      }
    }
    console.log("=== END DEBUG INFO ===");
  }

  //======================================================================= Token Manager ===================================================================

  const TokenManager = (() => {
    const API_CONFIG = {
      baseUrl: "http://localhost:8080/api/v1",
      endpoints: {
        refresh: "/auth/refresh",
        logout: "/auth/logout",
      },
      tokenRefreshInterval: 14 * 60 * 1000, // 14 minutes
    };

    let tokenRefreshInterval = null;

    const setAccessToken = (token) => {
      if (token) {
        localStorage.setItem("accessToken", token);
        console.log("Access token updated in localStorage");
      } else {
        localStorage.removeItem("accessToken");
        console.log("Access token removed from localStorage");
      }
    };

    const getAccessToken = () => localStorage.getItem("accessToken");

    const clearTokens = () => {
      setAccessToken(null);
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        tokenRefreshInterval = null;
      }
      console.log("Tokens cleared and refresh stopped");
    };

    const handleTokenExpiry = () => {
      clearTokens();
      NotificationManager.add(
        "Session expired. Please log in again.",
        "warning"
      );
      setTimeout(() => {
        window.location.href = "/pages/sign-in.html";
      }, 3000);
    };

    const refreshAccessToken = async () => {
      try {
        const res = await fetch(
          API_CONFIG.baseUrl + API_CONFIG.endpoints.refresh,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.warn("Refresh token invalid or expired");
            window.location.href = "/pages/sign-in.html";
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response = await res.json();
        let accessToken = response.data.access_token;
        if (accessToken) {
          setAccessToken(accessToken);
          NotificationManager.add("Session refreshed", "success");
          return accessToken;
        } else {
          console.warn("No access token in refresh response");
          return null;
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        return null;
      }
    };

    const startAutoRefresh = () => {
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);

      tokenRefreshInterval = setInterval(async () => {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          console.warn("Auto refresh failed, will retry next interval");
        }
      }, API_CONFIG.tokenRefreshInterval);

      console.log(
        "Auto refresh started - interval:",
        API_CONFIG.tokenRefreshInterval / 1000 / 60,
        "minutes"
      );
    };

    const authenticatedFetch = async (url, options = {}) => {
      const token = getAccessToken();
      console.log(`authenticatedFetch Token: ${token}`);
      if (!token) return Promise.reject(new Error("No access token"));

      const defaultOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      };

      try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (response.status === 401) {
          console.warn("401 detected, refreshing token...");
          const newToken = await refreshAccessToken();
          if (!newToken) {
            handleTokenExpiry();
            return Promise.reject(new Error("Unauthorized"));
          }
          const retryOptions = {
            ...defaultOptions,
            ...options,
            headers: {
              ...defaultOptions.headers,
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return fetch(url, retryOptions);
        }

        console.log(`authenticatedFetch Response status: ${response.status}`);
        return response;
      } catch (err) {
        console.error("Authenticated fetch error:", err);
        throw err;
      }
    };

    const checkAuthentication = function () {
      const token = this.getAccessToken();
      if (!token) {
        window.location.href = "/pages/sign-in.html";
        throw new Error("Authorization Failed. Try again");
      }
      return true;
    };

    return {
      setAccessToken,
      getAccessToken,
      clearTokens,
      refreshAccessToken,
      handleTokenExpiry,
      startAutoRefresh,
      authenticatedFetch,
      checkAuthentication,
    };
  })();

  window.TokenManager = TokenManager;

  (async function initToken() {
    const token = TokenManager.getAccessToken();
    if (token) {
      TokenManager.startAutoRefresh();
      console.log("Using existing access token");
    } else {
      console.log("No existing token, attempting to refresh...");
      const newToken = await TokenManager.refreshAccessToken();
      if (newToken) {
        TokenManager.startAutoRefresh();
      } else {
        console.warn("No valid token, user may need to login manually");
      }
    }
  })();

  //========================================================================= Data Manager ==================================================================

  const DataManager = (() => {
    let appData = {};

    // const set = (key, value) => {
    //   if (key === null || key === undefined) {
    //     console.warn("Attempted to set data with a null or undefined key.");
    //     return;
    //   }
    //   appData[key] = value;
    //   console.log(`DataManager: Data for '${key}' updated.`);
    // };

    // const get = (key) => {
    //   const data = appData[key];
    //   if (data === undefined) {
    //     console.warn(`DataManager: Data for '${key}' not found.`);
    //   }
    //   return data;
    // };

    const set = (key, value) => {
      appData[key] = value;
      localStorage.setItem(key, JSON.stringify(value));
    };

    const get = (key) => {
      if (appData[key] !== undefined) return appData[key];
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : undefined;
    };

    const has = (key) => {
      return appData.hasOwnProperty(key);
    };

    const clear = (key) => {
      if (appData.hasOwnProperty(key)) {
        delete appData[key];
        console.log(`DataManager: Data for '${key}' cleared.`);
        return true;
      }
      console.warn(
        `DataManager: Could not clear data for '${key}', key not found.`
      );
      return false;
    };

    const clearAll = () => {
      appData = {};
      console.log("DataManager: All application data cleared.");
    };

    const dump = () => {
      console.log("=== DataManager Contents ===");
      console.log(JSON.stringify(appData, null, 2));
      console.log("=== End DataManager Contents ===");
    };

    const setProfileInfo = () => {
      const firstName = DataManager.get("firstName");
      const lastName = DataManager.get("lastName");
      const email = DataManager.get("email");

      let initials = firstName[0] + lastName[0];

      if (firstName && lastName) {
        $(".user-avatar").text(initials);
        $(".user-name").text(firstName + " " + lastName);
      }

      if (email) {
        $(".user-email").text(email);
      }
    };

    return {
      set,
      get,
      has,
      clear,
      clearAll,
      dump,
      setProfileInfo,
    };
  })();

  window.DataManager = DataManager;

  // ============================================================= THEME MANAGEMENT ======================================================================
  const ThemeManager = {
    init: function () {
      const $themeToggle = $("#themeToggle");

      if ($themeToggle.length === 0) {
        console.warn("Theme toggle element not found");
        return;
      }

      const savedTheme =
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark");

      this.applyTheme(savedTheme);

      $themeToggle.on("click", () => {
        const currentTheme = $("html").attr("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        this.applyTheme(newTheme);
      });

      console.log("Theme manager initialized");
    },

    applyTheme: function (theme) {
      const $html = $("html");
      const $themeIcon = $("#themeToggle i");

      if (theme === "light") {
        $html.attr("data-theme", "light");
        $themeIcon.removeClass("fa-sun").addClass("fa-moon");
      } else {
        $html.removeAttr("data-theme");
        $themeIcon.removeClass("fa-moon").addClass("fa-sun");
      }

      localStorage.setItem("theme", theme);
      console.log("Theme applied:", theme);
    },
  };

  // ======================================================== DROPDOWN MANAGEMENT ======================================================
  const DropdownManager = {
    init: function () {
      // Profile dropdown
      $(".user-avatar").on("click", function (e) {
        e.stopPropagation();
        $(".profile-dropdown").toggleClass("show");
        $(".notification-dropdown").removeClass("show");
      });

      // Notification dropdown
      $("#notificationToggle").on("click", function (e) {
        e.stopPropagation();
        $("#notificationDropdown").toggleClass("show");
        $(".profile-dropdown").removeClass("show");
      });

      // Close dropdowns when clicking outside
      $(document).on("click", function (e) {
        const $target = $(e.target);

        // Close profile dropdown
        if (!$target.closest(".user-avatar, .profile-dropdown").length) {
          $(".profile-dropdown").removeClass("show");
        }

        // Close notification dropdown
        if (
          !$target.closest("#notificationToggle, #notificationDropdown").length
        ) {
          $("#notificationDropdown").removeClass("show");
        }
      });

      // Close dropdowns on escape key
      $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
          $(".profile-dropdown, #notificationDropdown").removeClass("show");
        }
      });

      console.log("Dropdown manager initialized");
    },
  };

  // =========================================================== SIDEBAR MANAGEMENT ===================================================
  const SidebarManager = {
    init: function () {
      const $menuToggle = $("#menuToggle");
      const $sidebar = $("#sidebar");

      if ($menuToggle.length === 0 || $sidebar.length === 0) {
        console.warn("Sidebar elements not found");
        return;
      }

      $menuToggle.on("click", function () {
        $sidebar.toggleClass("open");
      });

      $(document).on("click", function (e) {
        if (
          $(window).width() < 992 &&
          $sidebar.hasClass("open") &&
          !$sidebar.is(e.target) &&
          $sidebar.has(e.target).length === 0 &&
          !$menuToggle.is(e.target)
        ) {
          $sidebar.removeClass("open");
        }
      });

      $(window).on("resize", function () {
        if ($(window).width() >= 992) {
          $sidebar.removeClass("open");
        }
      });

      console.log("Sidebar manager initialized");
    },
  };

  // ============================================================= ALERT MANAGER WITH SWEET ALERT ==========================================================

  const AlertManager = {
    toast: function (message, type) {
      if (!type) type = "success";

      let bgColor;
      switch (type) {
        case "success":
          bgColor = "#10c400ff";
          break;
        case "warning":
          bgColor = "#bb0000ff";
          break;
        case "error":
          bgColor = "#bb7000ff";
          break;
        default:
          bgColor = "#c4a600ff";
      }

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: type, // success | error | warning | info | question
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "my-toast" },
        iconColor: bgColor,
        background: "rgba(255, 255, 255, 0.22)",
      });
    },

    confirm: function (title, message, type) {
      if (!type) type = "question";

      return Swal.fire({
        title: title,
        text: message,
        icon: type,
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });
    },

    displayAlert: function (title, message, type) {
      AlertManager.confirm(title, message, type).then(function (result) {
        if (result.isConfirmed) {
          AlertManager.toast(title, type);
        } else {
          AlertManager.toast("Action cancelled", "info");
        }
      });
    },
  };

  window.AlertManager = AlertManager;

  // =================================================================  NOTIFICATION SYSTEM =======================================================

  const NotificationManager = {
    notifications: [
      {
        id: 1,
        message: "Your account balance has been updated",
        type: "info",
        time: "2 minutes ago",
        read: false,
      },
      {
        id: 2,
        message: "New transaction: $250.00 received",
        type: "success",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: 3,
        message: "Monthly budget limit reached for dining",
        type: "warning",
        time: "1 hour ago",
        read: false,
      },
    ],

    init: function () {
      const $notificationList = $("#notificationList");
      if ($notificationList.length === 0) {
        console.warn("Notification list element not found");
        return;
      }

      this.render();
      this.updateBadge();
      this.bindEvents();
      console.log("Notification system initialized");
    },

    bindEvents: function () {
      // Mark all as read
      $("#markAllRead").on("click", () => {
        this.markAllAsRead();
      });

      // Individual notification clicks
      $(document).on("click", ".notification-item", function () {
        const id = parseInt($(this).data("id"));
        NotificationManager.markAsRead(id);
      });
    },

    render: function () {
      const $notificationList = $("#notificationList");

      if (this.notifications.length === 0) {
        $notificationList.html(`
                    <div class="empty-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <p>No notifications</p>
                    </div>
                `);
        return;
      }

      const html = this.notifications
        .map(
          (notification) => `
                <div class="notification-item ${
                  !notification.read ? "unread" : ""
                }" data-id="${notification.id}">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas ${this.getIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-message">${
                          notification.message
                        }</div>
                        <div class="notification-time">${
                          notification.time
                        }</div>
                    </div>
                </div>
            `
        )
        .join("");

      $notificationList.html(html);
    },

    markAsRead: function (id) {
      const notification = this.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        this.render();
        this.updateBadge();
      }
    },

    markAllAsRead: function () {
      this.notifications.forEach((notification) => {
        notification.read = true;
      });
      this.render();
      this.updateBadge();
    },

    updateBadge: function () {
      const unreadCount = this.notifications.filter((n) => !n.read).length;
      const $badge = $("#notificationBadge");

      if ($badge.length === 0) return;

      if (unreadCount > 0) {
        $badge.text(unreadCount > 9 ? "9+" : unreadCount).removeClass("hidden");
      } else {
        $badge.addClass("hidden");
      }
    },

    getIcon: function (type) {
      const icons = {
        success: "fa-check-circle",
        warning: "fa-exclamation-triangle",
        danger: "fa-exclamation-circle",
        info: "fa-info-circle",
      };
      return icons[type] || icons.info;
    },

    add: function (message, type = "info") {
      const newNotification = {
        id: Date.now(),
        message: message,
        type: type,
        time: "Just now",
        read: false,
      };

      this.notifications.unshift(newNotification);

      if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
      }

      this.render();
      this.updateBadge();
      this.animateBell();
    },

    animateBell: function () {
      const $bell = $("#notificationToggle");
      if ($bell.length === 0) return;

      $bell.addClass("pulse-animation");
      setTimeout(() => {
        $bell.removeClass("pulse-animation");
      }, 500);
    },

    startDemo: function () {
      const messages = [
        { text: "New transaction processed", type: "info" },
        { text: "Budget alert: 80% spent", type: "warning" },
        { text: "Investment return received", type: "success" },
        { text: "Account statement ready", type: "info" },
        { text: "Security alert: New login detected", type: "danger" },
      ];

      setInterval(() => {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        this.add(randomMsg.text, randomMsg.type);
      }, 45000);
    },
  };

  window.NotificationManager = NotificationManager;

  // =============================================================== WEB SOCKET INTEGRATION =======================================================

  let stompClient = null;
  const BACKEND_URL = "http://localhost:8080/api/v1";

  function connect() {
    let socket = new SockJS(`${BACKEND_URL}/ws`);
    stompClient = Stomp.over(socket);

    stompClient.connect(
      {},
      function (frame) {
        console.log("Connected: " + frame);
        stompClient.subscribe(
          "/topic/public-notifications",
          function (message) {
            const notification = JSON.parse(message.body);
            NotificationManager.add(notification.content, notification.type);
            AlertManager.toast(notification.content, notification.type);
          }
        );
      },
      function (error) {
        console.error("WebSocket connection error: ", error);
      }
    );
  }

  // ============================================================  UTILITY FUNCTIONS =============================================================
  const Utils = {
    debounce: function (func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    timeAgo: function (date) {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    },

    showLoading: function (selector) {
      $(selector).addClass("loading");
    },

    hideLoading: function (selector) {
      $(selector).removeClass("loading").prop("disabled", false);
    },

    formatCurrency: function (amount, currency = "LKR") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    },
  };

  window.Utils = Utils;

  // ================================================================ SUBSCRIPTION Manager ==============================================================

  const SubcriptionManager = {
    setUserPlanStatus: function (isPremium) {
      const body = document.body;
      if (isPremium) {
        body.classList.remove("free-user");
        body.classList.add("premium-user");
      } else {
        body.classList.remove("premium-user");
        body.classList.add("free-user");
      }
    },
    updateSidebarBrand: function (isPremium = false) {
      const brandLink = $(".brand-name a");
      const existingCrown = brandLink.find(".premium-crown");

      existingCrown.remove();

      if (isPremium) {
        const crown = $('<i class="fas fa-crown premium-crown"></i>');
        brandLink.append(crown);
      }
    },
    isPremium: function (isPremium) {
      this.setUserPlanStatus(isPremium);
      this.updateSidebarBrand(isPremium);
    },

    updateUserProfileBadge: function (isPremium = false) {
      const $badge = $("#user-profile-premium-badge");

      if (isPremium) {
        $badge.removeClass("d-none");
      } else {
        $badge.addClass("d-none");
      }
    },

    getUserPlan: function () {
      return DataManager.get("userPlan") || "free";
    },

    isPremiumUser: function () {
      const plan = this.getUserPlan();
      return plan === "PERSONAL_PRO" || userPlan === "BUSINESS_PRO";
    },

    updateNavigationForPlan: function (userPlan) {
      if (!userPlan) userPlan = this.getUserPlan();
      const isPremium =
        userPlan === "PERSONAL_PRO" || userPlan === "BUSINESS_PRO";

      NotificationManager.add(`updateNavigationForPlan:  ${isPremium}`);
      console.log();

      const premiumNavItems = [
        'a[href="/pages/budget.html"]',
        'a[href="/pages/report.html"]',
        'a[href="/pages/analytics.html"]',
      ];

      premiumNavItems.forEach((selector) => {
        const navLink = $(selector);

        if (!isPremium) {
          navLink.addClass("locked");
          if (!navLink.find(".nav-premium-badge").length) {
            navLink.append(
              '<i class="nav-premium-badge fas fa-crown premium-crown"></i>'
            );
          }
        } else {
          navLink.removeClass("locked");
          navLink.find(".nav-premium-badge").remove();
        }
      });
    },

    togglePremiumDivs: function (isPremium = null) {
      if (isPremium === null) isPremium = this.isPremiumUser();

      if (isPremium) {
        $(".dashboard-charts").removeClass("d-none");
        $(".premium-only").removeClass("d-none");
      } else {
        $(".dashboard-charts").addClass("d-none");
        $(".premium-only").addClass("d-none");
      }
    },

    initPremiumNavigation: function () {
      const premiumLinks = [
        { selector: 'a[href="/pages/budget.html"]', name: "Budget Planning" },
        { selector: 'a[href="/pages/report.html"]', name: "Advanced Reports" },
        {
          selector: 'a[href="/pages/analytics.html"]',
          name: "Analytics Dashboard",
        },
      ];

      const self = this;
      premiumLinks.forEach((link) => {
        $(document).on("click", link.selector, function (e) {
          if (!self.isPremiumUser()) {
            e.preventDefault();
            self.showUpgradePrompt(link.name);
            return false;
          }
        });
      });
    },

    showUpgradePrompt: function (featureName = "this feature") {
      $(".upgrade-prompt-modal").remove();

      const modal = $(`
      <div class="upgrade-prompt-modal">
        <div class="upgrade-prompt-content">
          <button class="upgrade-prompt-close">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="upgrade-prompt-header">
            <div class="upgrade-prompt-icon">
              <i class="fas fa-crown"></i>
            </div>
            <h3 class="upgrade-prompt-title">Upgrade Required</h3>
          </div>
          
          <p class="upgrade-prompt-message">
            <strong>${featureName}</strong> is a premium feature. Upgrade your plan to unlock advanced tools and insights.
          </p>
          
          <div class="upgrade-prompt-actions">
            <button class="btn-close-small close-prompt">Not Now</button>
            <a href="/pages/subscription-plans.html" class="btn-upgrade-small">
              <i class="fas fa-star"></i>
              Upgrade Plan
            </a>
          </div>
        </div>
      </div>
    `);

      $("body").append(modal);
      setTimeout(() => modal.addClass("show"), 10);

      modal
        .find(".upgrade-prompt-close, .close-prompt")
        .click(() => this.closeUpgradePrompt(modal));
      modal.click((e) => {
        if (e.target === modal[0]) this.closeUpgradePrompt(modal);
      });
      $(document).on("keydown.upgradePrompt", (e) => {
        if (e.key === "Escape") this.closeUpgradePrompt(modal);
      });
    },

    closeUpgradePrompt: function (modal) {
      modal.removeClass("show");
      setTimeout(() => {
        modal.remove();
        $(document).off("keydown.upgradePrompt");
      }, 200);
    },

    initialize: function (userPlan = null) {
      if (!userPlan) userPlan = this.getUserPlan();
      const isPremium =
        userPlan === "PERSONAL_PRO" || userPlan === "BUSINESS_PRO";
      this.setUserPlanStatus(isPremium);
      this.updateSidebarBrand(isPremium);
      this.updateUserProfileBadge(isPremium);
      this.updateNavigationForPlan(userPlan);
      this.initPremiumNavigation();
      this.togglePremiumDivs(isPremium);
    },
  };

  window.SubcriptionManager = SubcriptionManager;

  // ================================================================= LOGOUT FUNCTIONALITY =============================================================

  const LogoutManager = {
    init: function () {
      $(document).on("click", "[data-logout]", function (e) {
        e.preventDefault();
        LogoutManager.performLogout();
      });

      console.log("Logout manager initialized");
    },

    performLogout: function () {
      Utils.showLoading("[data-logout]");

      const API_CONFIG = {
        baseUrl: "http://localhost:8080/api/v1",
        endpoints: {
          logout: "/auth/logout",
        },
      };

      fetch(API_CONFIG.baseUrl + API_CONFIG.endpoints.logout, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
            console.warn(
              "Logout request failed, but continuing with client-side cleanup"
            );
          }
          try {
            return await response.json();
          } catch {
            return {};
          }
        })
        .catch((error) => {
          console.error("Logout error:", error);
        })
        .finally(() => {
          TokenManager.clearTokens();
          localStorage.clear();
          NotificationManager.add("Logged out successfully", "info");

          setTimeout(() => {
            window.location.href = "/pages/sign-in.html";
          }, 1000);
        });
    },
  };

  window.LogoutManager = LogoutManager;

  window.apiCall = async function (url, options = {}) {
    try {
      console.log("API URL:", url);
      console.log("Access Token:", localStorage.getItem("accessToken"));

      let response = await TokenManager.authenticatedFetch(url, options);

      if (response.status === 401) {
        console.log("401 error - attempting token refresh");
        await TokenManager.refreshAccessToken();
        response = await TokenManager.authenticatedFetch(url, options);

        if (response.status === 401) {
          TokenManager.handleTokenExpiry();
          throw new Error("Unauthorized after token refresh");
        }
      }

      if (response.status === 403) {
        NotificationManager.add("Access denied", "danger");
        throw new Error("Forbidden");
      }

      if (response.status >= 500) {
        NotificationManager.add("Server error occurred", "danger");
        throw new Error("Server Error");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} response: ${errorText}`
        );
      }

      return response;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  function initializeDashboard() {
    console.log("Initializing dashboard components...");
    debugTokenStorage();
    ThemeManager.init();
    DropdownManager.init();
    SidebarManager.init();
    NotificationManager.init();
    LogoutManager.init();
    SubcriptionManager.initialize();

    connect();

    setTimeout(() => {
      NotificationManager.add("Dashboard loaded successfully", "success");
    }, 1000);
  }

  initializeDashboard();

  // $(window).on("beforeunload", function () {
  //   TokenManager.clearTokens();
  // });
});

//ddd
