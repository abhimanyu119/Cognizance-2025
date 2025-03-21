const express = require("express");
const {
  createEscrowPayment,
  releaseEscrowPayment,
  getPayment,
  getUserPayments,
} = require("../controllers/paymentController");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.get("/", auth, getUserPayments);
router.get("/:id", auth, getPayment);

router.post(
  "/escrow/create",
  auth,
  roleCheck("employer", "admin"),
  createEscrowPayment
);
router.post(
  "/escrow/release",
  auth,
  roleCheck("employer", "admin"),
  releaseEscrowPayment
);

module.exports = router;
