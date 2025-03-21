const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../config/logger");

/**
 * Create a payment intent for milestone escrow
 * @param {Object} data - Payment data
 * @returns {Object} - Stripe payment intent
 */
exports.createPaymentIntent = async (data) => {
  try {
    const { amount, currency, description, metadata } = data;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      description,
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    logger.error(`Stripe payment intent error: ${error.message}`);
    throw error;
  }
};

/**
 * Create a Stripe customer
 * @param {Object} data - Customer data
 * @returns {Object} - Stripe customer
 */
exports.createCustomer = async (data) => {
  try {
    const { email, name, metadata } = data;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    logger.error(`Stripe customer creation error: ${error.message}`);
    throw error;
  }
};

/**
 * Create a Stripe Connect account for freelancers
 * @param {Object} data - Account data
 * @returns {Object} - Stripe account
 */
exports.createConnectAccount = async (data) => {
  try {
    const { email, country, type = "express" } = data;

    const account = await stripe.accounts.create({
      type,
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    logger.error(`Stripe Connect account error: ${error.message}`);
    throw error;
  }
};

/**
 * Create an account link for onboarding
 * @param {string} accountId - Stripe account ID
 * @param {string} refreshUrl - URL to redirect on refresh
 * @param {string} returnUrl - URL to redirect on completion
 * @returns {Object} - Account link
 */
exports.createAccountLink = async (accountId, refreshUrl, returnUrl) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink;
  } catch (error) {
    logger.error(`Stripe account link error: ${error.message}`);
    throw error;
  }
};

/**
 * Transfer funds from platform to freelancer
 * @param {Object} data - Transfer data
 * @returns {Object} - Transfer result
 */
exports.transferToFreelancer = async (data) => {
  try {
    const { amount, currency, destination, description, metadata } = data;

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      destination, // Stripe account ID of freelancer
      description,
      metadata,
    });

    return transfer;
  } catch (error) {
    logger.error(`Stripe transfer error: ${error.message}`);
    throw error;
  }
};
