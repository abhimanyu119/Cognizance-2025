const WorkSubmission = require("../models/WorkSubmission");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const aiVerificationService = require("../services/aiVerificationService");

// @desc    Get all submissions for a milestone
// @route   GET /api/milestones/:milestoneId/submissions
// @access  Private (Project owner or assigned freelancer)
exports.getSubmissions = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    const project = await Project.findById(milestone.projectId);

    if (
      project.employerId.toString() !== req.user.id &&
      project.freelancerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view submissions for this milestone",
      });
    }

    const submissions = await WorkSubmission.find({
      milestoneId: req.params.milestoneId,
    }).sort("-submittedAt");

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private (Project owner or assigned freelancer)
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await WorkSubmission.findById(req.params.id).populate(
      "milestoneId",
      "title status projectId"
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    const project = await Project.findById(submission.milestoneId.projectId);

    if (
      project.employerId.toString() !== req.user.id &&
      project.freelancerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this submission",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new submission
// @route   POST /api/milestones/:milestoneId/submissions
// @access  Private (Freelancer assigned to project)
exports.createSubmission = async (req, res, next) => {
  try {
    req.body.milestoneId = req.params.milestoneId;
    req.body.freelancerId = req.user.id;

    const milestone = await Milestone.findById(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    if (milestone.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        error: `Cannot submit work for a milestone with status: ${milestone.status}`,
      });
    }

    const project = await Project.findById(milestone.projectId);

    // Make sure user is assigned freelancer
    if (
      project.freelancerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to submit work for this milestone",
      });
    }

    // Handle file uploads (simplified, would use a file upload service in production)
    if (req.files) {
      const attachments = [];

      Object.keys(req.files).forEach((key) => {
        const file = req.files[key];

        // In a real implementation, you would upload to S3/cloud storage
        // and store the resulting URL
        const url = `/uploads/${file.name}`;

        attachments.push({
          name: file.name,
          url: url,
          type: file.mimetype,
          size: file.size,
        });

        // Move file to public uploads directory
        file.mv(`./public/uploads/${file.name}`, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });

      req.body.attachments = attachments;
    }

    const submission = await WorkSubmission.create(req.body);

    await Milestone.findByIdAndUpdate(req.params.milestoneId, {
      status: "under-review",
    });

    // Trigger AI verification if enabled
    const aiVerificationEnabled = true;
    if (aiVerificationEnabled) {
      aiVerificationService
        .verifySubmission(submission._id)
        .catch((err) => console.error("AI Verification Error:", err));
    }

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review submission (approve/reject)
// @route   PUT /api/milestones/:milestoneId/submissions/:id/review
// @access  Private (Project owner only)
exports.reviewSubmission = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    if (
      !status ||
      !["approved", "rejected", "revision-requested"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Please provide a valid status (approved, rejected, or revision-requested)",
      });
    }

    let submission = await WorkSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    if (submission.milestoneId.toString() !== req.params.milestoneId) {
      return res.status(400).json({
        success: false,
        error: "Submission does not belong to the specified milestone",
      });
    }

    const milestone = await Milestone.findById(req.params.milestoneId);
    const project = await Project.findById(milestone.projectId);

    if (
      project.employerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to review this submission",
      });
    }

    // Update submission
    submission = await WorkSubmission.findByIdAndUpdate(
      req.params.id,
      {
        status,
        feedback: feedback || "",
        reviewedAt: Date.now(),
      },
      { new: true }
    );

    if (status === "approved") {
      await Milestone.findByIdAndUpdate(req.params.milestoneId, {
        status: "completed",
        completedAt: Date.now(),
      });

      await Project.findByIdAndUpdate(project._id, {
        $inc: { completedMilestones: 1 },
      });
    } else if (status === "revision-requested" || status === "rejected") {
      // Set milestone back to in-progress for revisions
      await Milestone.findByIdAndUpdate(req.params.milestoneId, {
        status: "in-progress",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};
