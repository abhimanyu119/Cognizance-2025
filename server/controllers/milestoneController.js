const Milestone = require("../models/Milestone");
const Project = require("../models/Project");

// @desc    Get all milestones for a project
// @route   GET /api/projects/:projectId/milestones
// @access  Public
exports.getMilestones = async (req, res, next) => {
  try {
    const milestones = await Milestone.find({
      projectId: req.params.projectId,
    }).sort("order");

    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Public
exports.getMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate(
      "projectId",
      "title status"
    );

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new milestone
// @route   POST /api/projects/:projectId/milestones
// @access  Private (Project owner only)
exports.createMilestone = async (req, res, next) => {
  try {
    // Add project ID to req.body
    req.body.projectId = req.params.projectId;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Make sure user is project owner
    if (
      project.employerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add milestones to this project",
      });
    }

    // Get the current highest order
    const maxOrderMilestone = await Milestone.findOne(
      { projectId: req.params.projectId },
      {},
      { sort: { order: -1 } }
    );

    // Set order to be the next number
    req.body.order = maxOrderMilestone ? maxOrderMilestone.order + 1 : 1;

    const milestone = await Milestone.create(req.body);

    // Update project total milestones count
    await Project.findByIdAndUpdate(req.params.projectId, {
      $inc: { totalMilestones: 1 },
    });

    res.status(201).json({
      success: true,
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Project owner only)
exports.updateMilestone = async (req, res, next) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    // Get project to check ownership
    const project = await Project.findById(milestone.projectId);

    // Make sure user is project owner
    if (
      project.employerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this milestone",
      });
    }

    milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Project owner only)
exports.deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    const project = await Project.findById(milestone.projectId);

    if (
      project.employerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this milestone",
      });
    }

    // Only allow deletion if milestone is pending and has no payment
    if (milestone.status !== "pending") {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete a milestone that is already in progress or completed",
      });
    }

    await milestone.remove();

    // Update project total milestones count
    await Project.findByIdAndUpdate(milestone.projectId, {
      $inc: { totalMilestones: -1 },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Start milestone (change status to in-progress)
// @route   PUT /api/milestones/:id/start
// @access  Private (Freelancer assigned to project)
exports.startMilestone = async (req, res, next) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    const project = await Project.findById(milestone.projectId);

    if (
      project.freelancerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to start this milestone",
      });
    }

    // Can only start milestone if it's in pending status
    if (milestone.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Milestone is already in ${milestone.status} status`,
      });
    }

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { status: "in-progress" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
};
