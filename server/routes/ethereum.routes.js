const express = require("express");
const {
  createProjectFunding,
  addMilestoneFunding,
  startMilestone,
  submitForReview,
  approveMilestone,
  raiseDispute,
  getTransactionHistory,
} = require("../controllers/ethereumController");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.post(
  "/project/fund",
  auth,
  roleCheck("employer", "admin"),
  createProjectFunding
);
router.post(
  "/milestone/add",
  auth,
  roleCheck("employer", "admin"),
  addMilestoneFunding
);
router.post("/milestone/start", auth, roleCheck("freelancer"), startMilestone);
router.post(
  "/milestone/submit",
  auth,
  roleCheck("freelancer"),
  submitForReview
);
router.post(
  "/milestone/approve",
  auth,
  roleCheck("employer", "admin"),
  approveMilestone
);
router.post("/milestone/dispute", auth, raiseDispute);
router.get("/transactions/:projectId", auth, getTransactionHistory);

module.exports = router;