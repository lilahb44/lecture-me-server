const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID || "PAYPAL-SANDBOX-CLIENT-ID";
  let clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || "PAYPAL-SANDBOX-CLIENT-SECRET";

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

module.exports = function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
};
