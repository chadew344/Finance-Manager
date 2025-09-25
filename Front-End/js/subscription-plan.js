const BASE_URL_PAYMENT = "http://localhost:8080/api/v1/payment";

let payhereData;
let userAccountId;

$(document).ready(function () {
  TokenManager.checkAuthentication();
  SubcriptionManager.initialize();
  DataManager.setProfileInfo();
  userAccountId = DataManager.get("userAccountId");

  const pricingData = {
    "personal-free": { monthly: 0, yearly: 0 },
    "personal-pro": { monthly: 9, yearly: 7 },
    "personal-elite": { monthly: 19, yearly: 15 },
    "business-free": { monthly: 0, yearly: 0 },
    "small-business": { monthly: 29, yearly: 23 },
    enterprise: { monthly: 99, yearly: 79 },
  };

  $(".type-option").click(function () {
    const selectedType = $(this).data("type");

    $(".type-option").removeClass("active");
    $(this).addClass("active");

    const slider = $("#typeSlider");
    if (selectedType === "business") {
      slider.addClass("business");
    } else {
      slider.removeClass("business");
    }

    $(".plans-section").removeClass("active");
    $("#" + selectedType + "-plans").addClass("active");

    $(".plan-card").removeClass("in-viewport");
    setTimeout(() => {
      $(window).trigger("scroll");
    }, 100);
  });

  $("#billingToggle").change(function () {
    const isYearly = $(this).is(":checked");

    $(".price-value").each(function () {
      const planBtn = $(this).closest(".plan-card").find(".plan-btn");
      const planType = planBtn.data("plan");

      if (pricingData[planType]) {
        const newPrice = isYearly
          ? pricingData[planType].yearly
          : pricingData[planType].monthly;

        if (newPrice === 0) return;

        $(this).fadeOut(200, function () {
          $(this).text(newPrice).fadeIn(200);
        });
      }
    });

    $(".price-period").each(function () {
      const card = $(this).closest(".plan-card");
      if (card.hasClass("free-plan")) {
        return;
      }
      $(this).text(isYearly ? "per month, billed yearly" : "per month");
    });
  });

  $(".plan-btn").click(function () {
    const plan = $(this).data("plan");
    const isYearly = $("#billingToggle").is(":checked");
    const planName = $(this).closest(".plan-card").find(".plan-name").text();

    if (plan.includes("free")) {
      if (plan === "personal-free") {
        alert(
          "🎉 Welcome to your free Starter plan! You can begin using our basic features immediately."
        );
      } else if (plan === "business-free") {
        alert(
          "🚀 Your 30-day Business trial has started! Enjoy full access to all business features."
        );
      }
      return;
    }

    if (plan === "enterprise") {
      alert(
        "🏢 Thank you for your interest in our Enterprise plan! Our sales team will contact you within 24 hours to discuss your requirements."
      );
      return;
    }

    const price = $(this).closest(".plan-card").find(".price-value").text();

    $("#selected-plan-name").text(planName + " Plan");
    $("#selected-price").text(price);
    $("#selected-period").text(isYearly ? "month (billed yearly)" : "month");

    let features = "";
    if (plan === "personal-pro") {
      features = "Up to 3 users • 5 bank accounts • Advanced tracking";
    } else if (plan === "personal-elite") {
      features = "Up to 5 users • Unlimited accounts • Investment tracking";
    } else if (plan === "small-business") {
      features = "Up to 6 users • Unlimited accounts • Invoicing & Reports";
    }
    $("#selected-plan-features").text(features);

    $("#paymentModal").modal("show");
  });

  $(".payment-option").click(function () {
    $(".payment-option").removeClass("selected");
    $(this).addClass("selected");

    const method = $(this).data("method");

    $("#payhere-form, #card-form").hide();

    if (method === "payhere") {
      $("#payhere-form").show();
    } else if (method === "card") {
      $("#card-form").show();
    }
  });

  $("#proceed-payment").click(function () {
    const selectedMethod = $(".payment-option.selected").data("method");
    const planName = $("#selected-plan-name").text();
    const price = $("#selected-price").text();

    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }

    const originalText = $(this).html();
    $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Processing...');

    if (selectedMethod === "payhere") {
      setTimeout(() => {
        $(this).html(originalText);
        console.log("payment starts with payehre");

        integratePayhere();
      }, 1500);
    } else if (selectedMethod === "card") {
      const cardForm = $("#cardPaymentForm")[0];
      const inputs = cardForm.querySelectorAll("input");
      let isValid = true;

      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = "#ff6b6b";
        } else {
          input.style.borderColor = "";
        }
      });

      if (!isValid) {
        $(this).html(originalText);
        alert("Please fill in all card details.");
        return;
      }

      setTimeout(() => {
        $(this).html(originalText);
        upgradePlan();

        AlertManager.confirm(
          "Upgrade to Personal Pro",
          `✅ Payment successful! Welcome to ${planName}!`,
          "success"
        );
        $("#paymentModal").modal("hide");
      }, 2000);

      window.location.href = "/pages/dashboard.html";
    }
  });

  async function upgradePlan() {
    console.log("payment backend with payehre");

    try {
      const response = await window.apiCall(
        `${BASE_URL_PAYMENT}/upgrade-plan/${userAccountId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiResponse = await response.json();

      consolelog(apiResponse.data);
    } catch (error) {
      console.error("Failed make payment:", error);
    }
  }

  async function integratePayhere() {
    console.log("payment backend with payehre");

    try {
      const response = await window.apiCall(`${BASE_URL_PAYMENT}/payhere`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiResponse = await response.json();

      payhereData = apiResponse.data;
      console.log("Payhere loaded:", apiResponse.message);

      console.log(payhereData);
      alert(payhereData.hash);
      initiatePayhereGateway();
    } catch (error) {
      console.error("Fetch payhere error:", error);
    }
  }

  function initiatePayhereGateway() {
    payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:" + orderId);
    };

    payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
    };

    payhere.onError = function onError(error) {
      console.log("Error:" + error);
    };

    const payment = {
      sandbox: true,
      merchant_id: "1232099",
      return_url: window.location.href,
      cancel_url: window.location.href,
      notify_url: "http://sample.com/notify",
      order_id: payhereData.orderId,
      items: payhereData.subscriptionPackage,
      amount: payhereData.amount,
      currency: payhereData.currency,
      hash: payhereData.hash,
      first_name: payhereData.firstName,
      last_name: payhereData.lastName,
      email: payhereData.email,
      phone: payhereData.phoneNumber,
      address: payhereData.address,
      city: payhereData.city,
      country: "Sri Lanka",
    };

    if (typeof payhere !== "undefined") {
      payhere.startPayment(payment);
    } else {
      alert(`🚀 Redirecting to PayHere for ${planName} - ${price}`);
      $("#paymentModal").modal("hide");
    }
  }

  $(document).on(
    "input",
    'input[placeholder="1234 5678 9012 3456"]',
    function () {
      let value = $(this)
        .val()
        .replace(/\s/g, "")
        .replace(/[^0-9]/gi, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      $(this).val(formattedValue);
    }
  );

  $(document).on("input", 'input[placeholder="MM/YY"]', function () {
    let value = $(this).val().replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    $(this).val(value);
  });

  $(".plan-features li").hover(
    function () {
      $(this).find("i").addClass("fa-bounce");
    },
    function () {
      $(this).find("i").removeClass("fa-bounce");
    }
  );

  $(window).scroll(function () {
    $(".plan-card").each(function () {
      const cardTop = $(this).offset().top;
      const cardBottom = cardTop + $(this).outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();

      if (cardBottom > viewportTop && cardTop < viewportBottom) {
        $(this).addClass("in-viewport");
      }
    });
  });

  $(window).trigger("scroll");
});
