const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignFreelancer,
} = require("../controllers/projectController");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router
  .route("/")
  .get(getProjects)
  .post(auth, roleCheck("employer", "admin"), createProject);

router
  .route("/:id")
  .get(getProject)
  .put(auth, updateProject)
  .delete(auth, deleteProject);

router
  .route("/:id/assign")
  .put(auth, roleCheck("employer", "admin"), assignFreelancer);

module.exports = router;