const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://deepsahilz:Ghostx01@dummycluster.p5wwj.mongodb.net/",
  JWT_SECRET: process.env.JWT_SECRET||"eabc4f3f6c2e4e91765017e76b361e9b2fc2c8cf88f86cb499150e371e0906c25e3540de6ecd392a8039edf334cdc0e2ec8c7abd5f4629725d8cd09f1ce652c9",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};