const Dispute = require("../models/Dispute");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const Payment = require("../models/Payment");
const User = require("../models/User");
const logger = require("../config/logger");

// @desc    Create a new dispute
// @route   POST /api/milestones/:milestoneId/disputes
// @access  Private (Project participants only)
exports.createDispute = async (req, res, next) => {
  try {
    const { reason, description } = req.body;

    // Check if milestone exists
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    // Get project to check access rights
    const project = await Project.findById(milestone.projectId);

    // Check if user is involved in the project
    if (
      project.employerId.toString() !== req.user.id &&
      project.freelancerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create a dispute for this milestone",
      });
    }

    // Check if there's already an open dispute
    const existingDispute = await Dispute.findOne({
      milestoneId: milestone._id,
      status: { $in: ["open", "under-review"] },
    });

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        error: "There is already an active dispute for this milestone",
      });
    }

    // Handle file uploads if any
    let attachments = [];
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        const file = req.files[key];

        // In a real app, upload to a storage service
        const url = `/uploads/disputes/${file.name}`;
        attachments.push({
          name: file.name,
          url,
          type: file.mimetype,
        });

        // Move file to uploads directory
        file.mv(`./public/uploads/disputes/${file.name}`, (err) => {
          if (err) {
            logger.error(`File upload error: ${err.message}`);
          }
        });
      });
    }

    // Create initial conversation message
    const initialMessage = {
      sender: req.user._id,
      message: description,
      timestamp: new Date(),
    };

    // Create dispute
    const dispute = await Dispute.create({
      reason,
      description,
      projectId: project._id,
      milestoneId: milestone._id,
      raisedBy: req.user._id,
      attachments,
      conversations: [initialMessage],
      createdAt: new Date(),
    });

    // Update milestone status to disputed
    await Milestone.findByIdAndUpdate(milestone._id, {
      status: "disputed",
    });

    // Find admin to assign
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Dispute.findByIdAndUpdate(dispute._id, {
        assignedToAdmin: admin._id,
      });

      // In a real app, notify the admin
    }

    res.status(201).json({
      success: true,
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get disputes for a user
// @route   GET /api/disputes
// @access  Private
exports.getDisputes = async (req, res, next) => {
  try {
    let disputes;

    if (req.user.role === "admin") {
      // Admins can see all disputes, or those assigned to them
      if (req.query.assignedToMe === "true") {
        disputes = await Dispute.find({ assignedToAdmin: req.user._id })
          .sort("-createdAt")
          .populate("projectId", "title")
          .populate("milestoneId", "title")
          .populate("raisedBy", "name role");
      } else {
        disputes = await Dispute.find()
          .sort("-createdAt")
          .populate("projectId", "title")
          .populate("milestoneId", "title")
          .populate("raisedBy", "name role");
      }
    } else {
      // Regular users can only see disputes they're involved in
      // First, get all projects where the user is either employer or freelancer
      const projects = await Project.find({
        $or: [{ employerId: req.user._id }, { freelancerId: req.user._id }],
      });

      const projectIds = projects.map((project) => project._id);

      // Then get disputes related to those projects
      disputes = await Dispute.find({ projectId: { $in: projectIds } })
        .sort("-createdAt")
        .populate("projectId", "title")
        .populate("milestoneId", "title")
        .populate("raisedBy", "name role");
    }

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single dispute
// @route   GET /api/disputes/:id
// @access  Private (Project participants or assigned admin)
exports.getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("projectId", "title employerId freelancerId")
      .populate("milestoneId", "title amount status")
      .populate("raisedBy", "name role")
      .populate("assignedToAdmin", "name")
      .populate("conversations.sender", "name role");

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Check if user is allowed to view this dispute
    const isAdmin = req.user.role === "admin";
    const isAssignedAdmin =
      dispute.assignedToAdmin &&
      dispute.assignedToAdmin._id.toString() === req.user._id.toString();
    const isEmployer =
      dispute.projectId.employerId.toString() === req.user._id.toString();
    const isFreelancer =
      dispute.projectId.freelancerId &&
      dispute.projectId.freelancerId.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedAdmin && !isEmployer && !isFreelancer) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this dispute",
      });
    }

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a message to a dispute
// @route   POST /api/disputes/:id/messages
// @access  Private (Project participants or assigned admin)
exports.addMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Please provide a message",
      });
    }

    const dispute = await Dispute.findById(req.params.id).populate(
      "projectId",
      "employerId freelancerId"
    );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Check if user is allowed to add message
    const isAdmin = req.user.role === "admin";
    const isAssignedAdmin =
      dispute.assignedToAdmin &&
      dispute.assignedToAdmin.toString() === req.user._id.toString();
    const isEmployer =
      dispute.projectId.employerId.toString() === req.user._id.toString();
    const isFreelancer =
      dispute.projectId.freelancerId &&
      dispute.projectId.freelancerId.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedAdmin && !isEmployer && !isFreelancer) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add messages to this dispute",
      });
    }

    // Add message to conversations
    dispute.conversations.push({
      sender: req.user._id,
      message,
      timestamp: new Date(),
    });

    await dispute.save();

    // Populate the new message's sender
    const populatedDispute = await Dispute.findById(dispute._id).populate(
      "conversations.sender",
      "name role"
    );

    const newMessage =
      populatedDispute.conversations[populatedDispute.conversations.length - 1];

    res.status(200).json({
      success: true,
      data: newMessage,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve a dispute
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin only)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { decision, amount, reason } = req.body;

    if (
      !decision ||
      !["full-employer", "full-freelancer", "partial"].includes(decision)
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid decision",
      });
    }

    if (decision === "partial" && !amount) {
      return res.status(400).json({
        success: false,
        error: "Please provide an amount for partial resolution",
      });
    }

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Only admins can resolve disputes
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to resolve disputes",
      });
    }

    // Get milestone and project
    const milestone = await Milestone.findById(dispute.milestoneId);
    const project = await Project.findById(dispute.projectId);

    // Check if there's a payment
    if (!milestone.paymentId) {
      return res.status(400).json({
        success: false,
        error: "No payment found for this milestone",
      });
    }

    const payment = await Payment.findById(milestone.paymentId);

    // Process the resolution based on decision
    let updatedPayment;

    if (decision === "full-employer") {
      // Refund the full amount to employer
      // In a real app, this would involve a Stripe refund
      updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: "refunded",
          completedAt: new Date(),
        },
        { new: true }
      );

      // Update milestone status
      await Milestone.findByIdAndUpdate(milestone._id, {
        status: "in-progress", // Reset to in-progress for resubmission
      });
    } else if (decision === "full-freelancer") {
      // Release full payment to freelancer
      // In a real app, this would involve a Stripe transfer
      updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: "completed",
          escrowReleaseDate: new Date(),
          completedAt: new Date(),
        },
        { new: true }
      );

      // Update milestone status
      await Milestone.findByIdAndUpdate(milestone._id, {
        status: "completed",
        completedAt: new Date(),
      });

      // Update project completed milestone count
      await Project.findByIdAndUpdate(project._id, {
        $inc: { completedMilestones: 1 },
      });
    } else if (decision === "partial") {
      // Split the payment
      // In a real app, this would involve partial transfers/refunds
      updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: "completed",
          amount: amount, // Update to the new amount
          escrowReleaseDate: new Date(),
          completedAt: new Date(),
        },
        { new: true }
      );

      // Update milestone status and amount
      await Milestone.findByIdAndUpdate(milestone._id, {
        status: "completed",
        amount: amount, // Update to the new amount
        completedAt: new Date(),
      });

      // Update project completed milestone count
      await Project.findByIdAndUpdate(project._id, {
        $inc: { completedMilestones: 1 },
      });
    }

    // Update dispute
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolvedAt: new Date(),
        resolution: reason || "Dispute resolved by admin",
        outcome: {
          decision,
          amount: amount || milestone.amount,
          reason: reason || "Administrative decision",
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedDispute,
    });
  } catch (err) {
    next(err);
  }
};
