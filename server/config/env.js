const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://deepsahilz:Ghostx01@dummycluster.p5wwj.mongodb.net/",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_your_test_key",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};