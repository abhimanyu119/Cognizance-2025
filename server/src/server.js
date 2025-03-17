const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const express = require("express");

const app = express();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const SERVER_PORT = process.env.SERVER_PORT;
app.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
