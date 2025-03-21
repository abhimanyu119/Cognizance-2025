const app = require("./app");
const connectDB = require("./config/database");
const config = require("./config/env");
const logger = require("./config/logger");

connectDB();

const server = app.listen(config.PORT, () => {
  logger.info(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});

process.on("unhandledRejection", (err) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
