const express = require("express");
const {
  getSubmissions,
  getSubmission,
  createSubmission,
  reviewSubmission,
} = require("../controllers/submissionController");

const router = express.Router({ mergeParams: true });

const auth = require("../middleware/auth");

router.route("/").get(auth, getSubmissions).post(auth, createSubmission);

router.route("/:id").get(auth, getSubmission);

router.route("/:id/review").put(auth, reviewSubmission);

module.exports = router;