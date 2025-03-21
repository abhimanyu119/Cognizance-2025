const express = require("express");
const {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  startMilestone,
} = require("../controllers/milestoneController");

const router = express.Router({ mergeParams: true });

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Re-route into submission routes
const submissionRouter = require("./submission.routes");
router.use("/:milestoneId/submissions", submissionRouter);

router
  .route("/")
  .get(getMilestones)
  .post(auth, roleCheck("employer", "admin"), createMilestone);

router
  .route("/:id")
  .get(getMilestone)
  .put(auth, updateMilestone)
  .delete(auth, deleteMilestone);

router.route("/:id/start").put(auth, roleCheck("freelancer"), startMilestone);

module.exports = router;

// Include the following in project.routes.js to enable nested routes
// const milestoneRouter = require('./milestone.routes');
// router.use('/:projectId/milestones', milestoneRouter);
