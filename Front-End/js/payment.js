const BASE_URL_PAYMENT = "http://localhost:8080/api/v1/payment";

// document.getElementById("payhere-payment").onclick = function (e) {
//   payhere.startPayment(payment);
//   integratePayhere();
// };

let payhereData;

function payhereGateway() {
  integratePayhere();
}

async function integratePayhere() {
  try {
    // const response = await fetch(`${BASE_URL_PAYMENT}/payhere`, {
    //   method: "GET",
    // });

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
    // Note: validate the payment and show success or failure page to the customer
  };

  // Payment window closed
  payhere.onDismissed = function onDismissed() {
    // Note: Prompt user to pay again or show an error page
    console.log("Payment dismissed");
  };

  // Error occurred
  payhere.onError = function onError(error) {
    // Note: show an error page
    console.log("Error:" + error);
  };

  // Put the payment variables here
  var payment = {
    sandbox: true,
    merchant_id: "1232099",
    return_url: "http://127.0.0.1:5500/pages/payment.html", // Important
    cancel_url: "http://127.0.0.1:5500/pages/payment.html", // Important
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
    delivery_address: "No. 46, Galle road, Kalutara South",
    delivery_city: "Kalutara",
    delivery_country: "Sri Lanka",
    custom_1: "",
    custom_2: "",
  };

  payhere.startPayment(payment);
}

// const BASE_URL_PAYMENT = "http://localhost:8080/api/v1/payment";

// let payhereData;

// function payhereGateway() {
//   integratePayhere();
// }

// async function integratePayhere() {
//   try {
//     console.log("Fetching PayHere data...");

//     const response = await fetch(`${BASE_URL_PAYMENT}/payhere`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const apiResponse = await response.json();

//     if (!apiResponse.success) {
//       throw new Error(apiResponse.message || "Failed to load PayHere data");
//     }

//     payhereData = apiResponse.data;
//     console.log("Payhere loaded:", apiResponse.message);
//     console.log("PayHere Data:", payhereData);

//     // Verify that we have the hash
//     if (!payhereData.hash) {
//       throw new Error("Hash not generated properly");
//     }

//     console.log("Generated Hash:", payhereData.hash);
//     initiatePayhereGateway();
//   } catch (error) {
//     console.error("Fetch payhere error:", error);
//     alert("Error loading payment data: " + error.message);
//   }
// }

// function initiatePayhereGateway() {
//   // Payment completed successfully
//   payhere.onCompleted = function onCompleted(orderId) {
//     console.log("Payment completed. OrderID:" + orderId);
//     alert("Payment completed successfully! Order ID: " + orderId);

//     // You can redirect to success page or update UI
//     // window.location.href = "/success.html";
//   };

//   // Payment window closed by user
//   payhere.onDismissed = function onDismissed() {
//     console.log("Payment dismissed");
//     alert("Payment was cancelled. Please try again.");
//   };

//   // Error occurred during payment
//   payhere.onError = function onError(error) {
//     console.log("Error:" + error);
//     alert("Payment error: " + error);
//   };

//   // Validate required data before starting payment
//   if (!payhereData) {
//     alert("Payment data not loaded. Please try again.");
//     return;
//   }

//   // Payment configuration
//   var payment = {
//     sandbox: true, // Set to false for production
//     merchant_id: "1232099", // This should match your backend
//     return_url: "http://127.0.0.1:5500/pages/payment.html",
//     cancel_url: "http://127.0.0.1:5500/pages/payment.html",
//     notify_url: "http://sample.com/notify", // Your backend notification endpoint
//     order_id: payhereData.orderId,
//     items: payhereData.subscriptionPackage,
//     amount: payhereData.amount,
//     currency: payhereData.currency,
//     hash: payhereData.hash,
//     first_name: payhereData.firstName,
//     last_name: payhereData.lastName,
//     email: payhereData.email,
//     phone: payhereData.phoneNumber,
//     address: payhereData.address,
//     city: payhereData.city,
//     country: "Sri Lanka",
//     delivery_address: "No. 46, Galle road, Kalutara South",
//     delivery_city: "Kalutara",
//     delivery_country: "Sri Lanka",
//     custom_1: "",
//     custom_2: "",
//   };

//   console.log("Starting payment with config:", payment);

//   // Start the payment
//   payhere.startPayment(payment);
// }

// // Optional: Function to check PayHere script loading
// function checkPayHereLoaded() {
//   if (typeof payhere === "undefined") {
//     console.error(
//       "PayHere script not loaded. Make sure you include the PayHere script tag."
//     );
//     alert("PayHere payment system not loaded. Please refresh the page.");
//     return false;
//   }
//   return true;
// }

// // Call this when page loads to verify PayHere is available
// document.addEventListener("DOMContentLoaded", function () {
//   setTimeout(() => {
//     checkPayHereLoaded();
//   }, 1000); // Give some time for external scripts to load
// });
