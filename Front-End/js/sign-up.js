let selectedAccountType = null;

async function createAccount(formData) {
  console.log("Creating account with data:", formData);

  try {
    const response = await makeAuthRequest("/register", formData);
    console.log("Registration response:", response);

    if (response.status === 200 || response.status === 201) {
      return response;
    } else {
      throw new Error(response.message || "Registration failed");
    }
  } catch (error) {
    console.error("Create account error:", error);
    throw error;
  }
}

function handleSignUpSuccess(response, accountType) {
  const title =
    accountType === "business"
      ? "Business Account Created!"
      : "Personal Account Created!";
  const message =
    accountType === "business"
      ? "Welcome to FinanceFlow for Business. Check your email to verify your account."
      : "Welcome to FinanceFlow. Check your email to verify your account.";

  showSuccessMessage(title, message);

  if (response.data && response.data.access_token) {
    localStorage.setItem("accessToken", response.data.access_token);
    console.log("Access token stored in localStorage, redirecting...");

    redirectAfterDelay("/pages/dashboard.html");
  } else if (response.data && response.data.tempToken) {
    localStorage.setItem("tempToken", response.data.tempToken);
  }
}

function handleSignUpError(error) {
  let title = "Account Creation Failed";
  let message = error.message || "Please check your information and try again.";

  if (error.message.includes("email")) {
    title = "Email Already Exists";
    message =
      "An account with this email address already exists. Please sign in instead.";
  } else if (error.message.includes("password")) {
    title = "Password Requirements";
    message =
      "Password must be at least 8 characters long and contain a mix of letters and numbers.";
  } else if (error.message.includes("business")) {
    title = "Business Information Required";
    message = "Please fill in all required business information.";
  } else if (error.message.includes("validation")) {
    title = "Validation Error";
    message = "Please check your input and try again.";
  }

  showErrorMessage(title, message);
}

function showSignUpForm() {
  $("#step1").removeClass("active");
  $("#step2").addClass("active");

  const $formTitle = $("#formTitle");
  const $formSubtitle = $("#formSubtitle");
  const $createAccountBtn = $("#createAccountBtn");
  const $businessFields = $("#businessFields");
  const $firstNameLabel = $("#firstNameLabel");
  const $lastNameLabel = $("#lastNameLabel");
  const $newsletterLabel = $("#newsletterLabel");

  if (selectedAccountType === "business") {
    $formTitle.text("Create Business Account");
    $formSubtitle.text("Set up your business financial management");
    $createAccountBtn.addClass("business");
    $businessFields.addClass("show");
    $firstNameLabel.text("Contact First Name");
    $lastNameLabel.text("Contact Last Name");
    $newsletterLabel.text("Send me business tips and feature updates");
  } else {
    $formTitle.text("Create Personal Account");
    $formSubtitle.text("Start your journey to financial freedom");
    $createAccountBtn.removeClass("business");
    $businessFields.removeClass("show");
    $firstNameLabel.text("First Name");
    $lastNameLabel.text("Last Name");
    $newsletterLabel.text("Send me financial tips and product updates");
  }
}

function goBack() {
  $("#step2").removeClass("active");
  $("#step1").addClass("active");

  $("#formTitle").text("Choose Your Account Type");
  $("#formSubtitle").text("Select how you'll be using FinanceFlow");

  selectedAccountType = null;
  $(".account-type-option").removeClass("selected");

  const $continueBtn = $("#continueBtn");
  $continueBtn.prop("disabled", true).removeClass("business");
}

function initAccountTypeSelection() {
  const $continueBtn = $("#continueBtn");
  const $accountOptions = $(".account-type-option");

  $accountOptions.on("click", function () {
    $accountOptions.removeClass("selected");
    $(this).addClass("selected");

    selectedAccountType = $(this).data("type");
    $continueBtn.prop("disabled", false);

    if (selectedAccountType === "business") {
      $continueBtn.addClass("business");
    } else {
      $continueBtn.removeClass("business");
    }
  });

  $continueBtn.on("click", function () {
    if (selectedAccountType) {
      showSignUpForm();
    }
  });

  $(document).on("click", ".btn-back", function () {
    goBack();
  });
}

function validateSignUpForm() {
  let isValid = true;
  const $form = $("#signupForm");

  const requiredFields = $form.find(".form-control[required]");

  requiredFields.each(function () {
    const $field = $(this);
    if (!validateInput($field)) {
      isValid = false;
    }
  });

  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    const $confirmField = $("#confirmPassword");
    $confirmField.addClass("is-invalid");
    showFeedback($confirmField, "Passwords do not match", false);
    isValid = false;
  }

  if (selectedAccountType === "business") {
    const businessRequiredFields = $("#businessFields").find(
      ".form-control[required]"
    );
    businessRequiredFields.each(function () {
      const $field = $(this);
      if (!validateInput($field)) {
        isValid = false;
      }
    });
  }

  return isValid;
}

function initSignUpForm() {
  const $form = $("#signupForm");

  $form.on("submit", async function (e) {
    e.preventDefault();

    console.log("Form submitted");

    if (!validateSignUpForm()) {
      showErrorMessage(
        "Validation Error",
        "Please fix the errors below and try again."
      );
      return;
    }

    const $submitButton = $form.find("button[type='submit']");

    try {
      setButtonLoading($submitButton, "Creating Account...");

      const formData = {
        firstName: $("#firstName").val().trim(),
        lastName: $("#lastName").val().trim(),
        email: $("#email").val().trim(),
        password: $("#password").val(),
        userAccountType: selectedAccountType.toUpperCase(),
      };

      if (selectedAccountType === "business") {
        formData.businessName = $("#businessName").val().trim();
        formData.industry = $("#industry").val();
        formData.businessSize = $("#businessSize").val();
      }

      formData.newsletter = $("#newsletterCheck").is(":checked");

      console.log("Sending registration data:", formData);

      const response = await createAccount(formData);
      console.log("Registration successful:", response);

      handleSignUpSuccess(response, selectedAccountType);
    } catch (error) {
      console.error("Registration error:", error);
      handleSignUpError(error);
    } finally {
      resetButton($submitButton);
    }
  });
}

function validateSignUpPassword($input) {
  const password = $input.val();
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  let strength = "Weak";
  let isValid = requirements.length >= 8; // At least 8 characters

  if (score >= 4) {
    strength = "Strong";
  } else if (score >= 2) {
    strength = "Medium";
  }

  const $strengthIndicator = $input.parent().find(".password-strength");
  if ($strengthIndicator.length && password.length > 0) {
    $strengthIndicator
      .text(`Password Strength: ${strength}`)
      .attr("class", `password-strength ${strength.toLowerCase()}`);
  }

  return isValid;
}

async function checkEmailAvailability(email) {
  try {
    await makeAuthRequest("/api/accounts/check-email", { email }, "POST");
    return true;
  } catch (error) {
    if (error.message.includes("exists")) {
      return false;
    }
    throw error;
  }
}

function validateSignUpEmail($input) {
  const email = $input.val().trim();

  if (!email) return true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFeedback($input, "Please enter a valid email address", false);
    return false;
  }

  // Check availability (debounced)
  // clearTimeout($input.data("checkTimeout"));
  // const timeout = setTimeout(async () => {
  //   try {
  //     const isAvailable = await checkEmailAvailability(email);
  //     if (!isAvailable) {
  //       showFeedback($input, "This email is already registered", false);
  //       $input.addClass("is-invalid");
  //     } else {
  //       showFeedback($input, "Email is available", true);
  //       $input.removeClass("is-invalid").addClass("is-valid");
  //     }
  //   } catch (error) {
  //     // Handle silently for UX
  //     console.error("Email check error:", error);
  //   }
  // }, 500);

  // $input.data("checkTimeout", timeout);
  showFeedback($input, "Email format is valid", true);
  return true;
}

const input = document.querySelector("#phoneNumberInput");

const iti = window.intlTelInput(input, {
  initialCountry: "auto",
  geoIpLookup: function (callback) {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => callback(data.country_code))
      .catch(() => callback("us")); // default to 'us' on error
  },
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});

function initSignUpValidation() {
  $(document).on("input", 'input[type="password"]', function () {
    if ($(this).closest("form").attr("id") === "signupForm") {
      validateSignUpPassword($(this));
    }
  });

  $(document).on("blur", 'input[type="email"]', function () {
    if ($(this).closest("form").attr("id") === "signupForm") {
      validateSignUpEmail($(this));
    }
  });

  $(document).on("blur", "#confirmPassword", function () {
    const password = $("#password").val();
    const confirmPassword = $(this).val();

    if (confirmPassword && password !== confirmPassword) {
      $(this).addClass("is-invalid");
      showFeedback($(this), "Passwords do not match", false);
    } else if (confirmPassword && password === confirmPassword) {
      $(this).removeClass("is-invalid").addClass("is-valid");
      showFeedback($(this), "Passwords match", true);
    }
  });
}

function handleSignUpUrlParameters() {
  const params = getUrlParams();
  const type = params.get("type");

  if (type === "personal" || type === "business") {
    selectedAccountType = type;
    showSignUpForm();
  }
}

$(document).ready(function () {
  console.log("Initializing sign-up page...");

  initAccountTypeSelection();
  initSignUpForm();
  initSignUpValidation();
  handleSignUpUrlParameters();
  phoneNumberfieldInitiate();

  setTimeout(() => {
    const $firstVisible = $(".form-control:visible").first();
    if ($firstVisible.length) {
      $firstVisible.focus();
    }
  }, 100);

  console.log("Sign-up page initialized");
});
