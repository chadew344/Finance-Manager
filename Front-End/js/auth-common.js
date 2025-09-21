const AUTH_BASE_URL = "http://localhost:8080/api/v1/auth";

function showSuccessMessage(title, message) {
  $(".success-message, .error-message").remove();

  const $authCard = $(".auth-card");
  const $successDiv = $(`
    <div class="success-message">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="success-title">${title}</div>
      <div class="success-text">${message}</div>
    </div>
  `);

  $authCard.prepend($successDiv);
  setTimeout(() => $successDiv.remove(), 5000);
}

function showErrorMessage(title, message) {
  $(".success-message, .error-message").remove();

  const $passwordGroup = $("#password").closest(".form-group");

  const $errorDiv = $(`
        <div class="error-message mb-2 text-danger">
            <span class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </span>
            <span class="error-title">${title}</span>
            <span class="error-text">${message}</span>
        </div>
    `);

  $passwordGroup.after($errorDiv);

  setTimeout(() => $errorDiv.remove(), 5000);
}

function showFeedback($input, message, isValid) {
  $input
    .closest(".form-group")
    .find(".invalid-feedback, .valid-feedback")
    .remove();

  if ($input.attr("type") === "password" || $input.attr("type") === "text") {
    const $validationIcon = $input.parent().find(".password-validation-icon");
    if ($validationIcon.length && $input.val().trim().length > 0) {
      $validationIcon.attr(
        "class",
        `password-validation-icon ${isValid ? "valid" : "invalid"}`
      );
    } else if ($validationIcon.length) {
      $validationIcon.attr("class", "password-validation-icon"); // Hide icon if no input
    }
  } else {
    const $feedbackDiv = $(
      `<div class="${
        isValid ? "valid-feedback" : "invalid-feedback"
      }">${message}</div>`
    );
    $input.parent().append($feedbackDiv);
  }
}

function validateInput($input) {
  const value = $input.val().trim();
  let isValid = true,
    message = "";

  $input.parent().find(".invalid-feedback, .valid-feedback").remove();

  if ($input.attr("type") === "email") {
    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    message = isValid ? "Looks good!" : "Please enter a valid email address";
  } else if ($input.attr("type") === "password") {
    const minLength =
      $input.closest("form").attr("id") === "signin-form" ? 1 : 8;
    isValid = value.length >= minLength;
    message = isValid
      ? "Looks good!"
      : minLength === 1
      ? "Password is required"
      : "Password must be at least 8 characters";
  } else if ($input.prop("required")) {
    isValid = value.length > 0;
    message = isValid ? "Looks good!" : "This field is required";
  } else if ($input.is("select") && $input.val() === "") {
    isValid = false;
    message = "Please select an option";
  }

  $input.removeClass("is-valid is-invalid");
  if (value.length > 0 || $input.is("select")) {
    $input.addClass(isValid ? "is-valid" : "is-invalid");
    showFeedback($input, message, isValid);
  }

  return isValid;
}

function validateForm() {
  let isFormValid = true;
  const $inputs = $(".form-control:visible");

  $inputs.each(function () {
    if (!validateInput($(this))) {
      isFormValid = false;
    }
  });

  return isFormValid;
}

// -------------------------------------------------------- PASSWORD TOGGLE FUNCTIONALITY ------------------------------------------------

function initPasswordToggle() {
  $(document).on("click", ".password-toggle", function () {
    const $button = $(this);
    const $input = $button
      .parent()
      .find('input[type="password"], input[type="text"]');
    const $icon = $button.find("i");

    if ($input.attr("type") === "password") {
      $input.attr("type", "text");
      $icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      $input.attr("type", "password");
      $icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
}

// ------------------------------------------------------------ SOCIAL LOGIN RIPPLE EFFECT --------------------------------------------------------

function initSocialButtonRipple() {
  $(document).on("click", ".btn-social", function (e) {
    e.preventDefault();

    const $btn = $(this);
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const $ripple = $("<span></span>").css({
      width: size + "px",
      height: size + "px",
      left: e.clientX - rect.left - size / 2 + "px",
      top: e.clientY - rect.top - size / 2 + "px",
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      transform: "scale(0)",
      animation: "ripple 0.6s linear",
      pointerEvents: "none",
    });

    $btn.css("position", "relative");

    $btn.append($ripple);
    setTimeout(() => $ripple.remove(), 600);

    // Handle social login
    handleSocialLogin($btn);
  });
}

async function makeAuthRequest(url, data, method = "POST") {
  try {
    const shouldIncludeCredentials =
      url.includes("/refresh") || url.includes("/logout");

    const fetchOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    if (shouldIncludeCredentials) {
      fetchOptions.credentials = "include";
    }

    const response = await fetch(AUTH_BASE_URL + url, fetchOptions);

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error("Auth request error:", error);
    throw error;
  }
}

function handleSocialLogin($button) {
  const provider = $button.hasClass("btn-google") ? "google" : "apple";

  try {
    const originalText = $button.html();
    $button.html(`<i class="fas fa-spinner fa-spin me-2"></i>Connecting...`);

    setTimeout(() => {
      window.location.href = `/auth/${provider}`;
    }, 500);
  } catch (error) {
    showErrorMessage(
      "Social Login Error",
      `Failed to connect with ${provider}`
    );
    setTimeout(() => {
      $button.html(originalText);
    }, 1000);
  }
}

// -----------------------------------------------------  BUTTON LOADING STATE METHODS --------------------------------------------------------------

function setButtonLoading($button, loadingText) {
  const originalText = $button.html();
  $button.data("original-text", originalText);
  $button
    .html(`<span class="loading"></span>${loadingText}`)
    .prop("disabled", true);
}

function resetButton($button) {
  const originalText = $button.data("original-text");
  if (originalText) {
    $button.html(originalText).prop("disabled", false);
  }
}

// ---------------------------------------------------------- FORM EVENT HANDLERS (COMMON) -------------------------------------------------------------

function initCommonFormHandlers() {
  $(document).on("blur", ".form-control", function () {
    validateInput($(this));
  });

  $(document).on("input", ".form-control", function () {
    if ($(this).hasClass("is-invalid")) {
      validateInput($(this));
    }
  });

  // Remove any existing messages when user starts typing
  $(document).on("input focus", ".form-control", function () {
    $(".success-message, .error-message").remove();
  });
}

// -------------------------------------------------------------------  UTIL METHODS ------------------------------------------------------------------

function clearForm($form) {
  $form[0].reset();
  $form.find(".form-control").removeClass("is-valid is-invalid");
  $form.find(".invalid-feedback, .valid-feedback").remove();
  $form
    .find(".password-validation-icon")
    .attr("class", "password-validation-icon");
}

function redirectAfterDelay(url, delay = 2000) {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}

function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

function addRippleAnimation() {
  if (!$("#ripple-animation-css").length) {
    const $style = $(`
      <style id="ripple-animation-css">
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      </style>
    `);
    $("head").append($style);
  }
}

$(document).ready(function () {
  initCommonFormHandlers();
  initPasswordToggle();
  initSocialButtonRipple();
  addRippleAnimation();
});
