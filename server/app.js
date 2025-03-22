const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const path = require("path");
const config = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,               // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded (10MB)",
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

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
app.use("/api/ethereum", require("./routes/ethereum.routes"));
app.use("/api/disputes", require("./routes/dispute.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FreeLance Fair API" });
});

app.use(errorHandler);

module.exports = app;
