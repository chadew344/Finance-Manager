async function signInUser(credentials) {
  console.log("Signing in user:", credentials.email);

  try {
    const response = await makeAuthRequest("/authenticate", credentials);
    console.log("Sign in response:", response);

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.message || "Authentication failed");
    }
  } catch (error) {
    console.error("Sign in error:" + error);
    throw error;
  }
}

function handleSignInSuccess(response) {
  showSuccessMessage("Welcome Back!", "You have been successfully signed in.");

  if (response.data && response.data.access_token) {
    console.log("Access token received, storing in localStorage...");
    console.log("Response access token: " + response.data.access_token);

    // Store access token in localStorage
    localStorage.setItem("accessToken", response.data.access_token);
    console.log(
      "localStorage accessToken: " + localStorage.getItem("access_token")
    );
  } else {
    console.error("No access token in response:", response);
  }

  if (response.data && response.data.user) {
    localStorage.setItem("userData", JSON.stringify(response.data.user));
  }

  const redirectUrl = getUrlParams().get("redirect") || "/pages/dashboard.html";
  redirectAfterDelay(redirectUrl);
}

function handleSignInError(error) {
  let title = "Sign In Failed";
  let message = error.message || "Please check your credentials and try again.";

  if (
    error.message.includes("email") ||
    error.message.includes("user not found")
  ) {
    title = "Email Not Found";
    message = "No account found with this email address.";
  } else if (
    error.message.includes("password") ||
    error.message.includes("invalid credentials")
  ) {
    title = "Incorrect Password";
    message = "The password you entered is incorrect.";
  } else if (
    error.message.includes("verified") ||
    error.message.includes("not verified")
  ) {
    title = "Account Not Verified";
    message = "Please check your email and verify your account first.";
  } else if (
    error.message.includes("blocked") ||
    error.message.includes("suspended")
  ) {
    title = "Account Blocked";
    message = "Your account has been temporarily blocked. Contact support.";
  }

  showErrorMessage(title, message);
}

function handleForgotPassword() {
  const email = $("#email").val().trim();

  if (!email) {
    showErrorMessage(
      "Email Required",
      "Please enter your email address first."
    );
    $("#email").focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErrorMessage("Invalid Email", "Please enter a valid email address.");
    $("#email").focus();
    return;
  }

  showSuccessMessage(
    "Reset Link Sent",
    "If an account exists with this email, you will receive a password reset link."
  );

  makeAuthRequest("/forgot-password", { email }).catch((error) => {
    console.error("Forgot password error:", error);
    // Don't show error to user for security reasons
  });
}

function validateSignInForm() {
  let isValid = true;
  const $form = $("#signin-form");

  // Check email
  const $email = $("#email");
  if (!validateInput($email)) {
    isValid = false;
  }

  // Check password
  const $password = $("#password");
  if (!validateInput($password)) {
    isValid = false;
  }

  return isValid;
}

// Initialize sign-in form
function initSignInForm() {
  const $form = $("#signin-form");

  $form.on("submit", async function (e) {
    e.preventDefault();

    console.log("Sign-in form submitted");

    if (!validateSignInForm()) {
      showErrorMessage(
        "Validation Error",
        "Please fix the errors below and try again."
      );
      return;
    }

    const $submitButton = $form.find('button[type="submit"]');

    try {
      setButtonLoading($submitButton, "Signing In...");

      const credentials = {
        email: $("#email").val().trim(),
        password: $("#password").val(), // Don't trim passwords
        // rememberMe: $("#rememberCheck").is(":checked"), // Add if you have this field
      };

      console.log("Sending sign-in request...");

      const response = await signInUser(credentials);
      console.log("Sign-in successful:", response);

      handleSignInSuccess(response);
    } catch (error) {
      console.error("Sign-in error:", error);
      handleSignInError(error);
    } finally {
      // Reset button state
      resetButton($submitButton);
    }
  });
}

// Initialize forgot password link
function initForgotPasswordLink() {
  $(document).on(
    "click",
    'a[href="#"]:contains("Forgot your password?")',
    function (e) {
      e.preventDefault();
      handleForgotPassword();
    }
  );
}

function handleUrlParameters() {
  const params = getUrlParams();
  const email = params.get("email");

  if (email) {
    $("#email").val(decodeURIComponent(email));
  }

  if (params.get("verified") === "true") {
    showSuccessMessage(
      "Email Verified!",
      "Your email has been verified. You can now sign in."
    );
  }

  // Handle password reset success
  if (params.get("reset") === "true") {
    showSuccessMessage(
      "Password Reset!",
      "Your password has been reset. Please sign in with your new password."
    );
  }

  // Handle logout message
  if (params.get("logout") === "true") {
    showSuccessMessage("Signed Out", "You have been successfully signed out.");
  }
}

$(document).ready(function () {
  console.log("Initializing sign-in page...");

  initSignInForm();
  initForgotPasswordLink();
  handleUrlParameters();

  const $firstEmpty = $(".form-control")
    .filter(function () {
      return $(this).val() === "";
    })
    .first();

  if ($firstEmpty.length) {
    $firstEmpty.focus();
  }

  console.log("Sign-in page initialized");
});
