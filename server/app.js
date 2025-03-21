const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/milestones", require("./routes/milestone.routes"));
app.use("/api/submissions", require("./routes/submission.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/disputes", require("./routes/dispute.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));


app.get("/", (req, res) => {
  res.json({ message: "Welcome to FreeLance Fair API" });
});

app.use(errorHandler);

module.exports = app;