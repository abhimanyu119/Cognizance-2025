const Payment = require("../models/Payment");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const User = require("../models/User");
const stripeClient = require("../integrations/stripe");
const logger = require("../config/logger");

// @desc    Create escrow payment for milestone
// @route   POST /api/payments/escrow/create
// @access  Private (Employers only)
exports.createEscrowPayment = async (req, res, next) => {
  try {
    const { milestoneId, paymentMethodId } = req.body;

    // Check if milestone exists
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    // Get project to check ownership
    const project = await Project.findById(milestone.projectId).populate(
      "freelancerId",
      "payment_methods"
    );

    // Make sure user is project owner
    if (
      project.employerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create payment for this milestone",
      });
    }

    // Check if payment already exists
    if (milestone.paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment already exists for this milestone",
      });
    }

    // Get or create Stripe customer for employer
    let stripeCustomerId = req.user.payment_methods?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripeClient.createCustomer({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user.id, {
        "payment_methods.stripeCustomerId": stripeCustomerId,
      });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripeClient.createPaymentIntent({
      amount: milestone.amount,
      currency: project.currency || "USD",
      description: `Escrow payment for ${project.title} - ${milestone.title}`,
      metadata: {
        milestoneId: milestone._id.toString(),
        projectId: project._id.toString(),
        employerId: req.user.id,
        freelancerId: project.freelancerId
          ? project.freelancerId._id.toString()
          : "",
      },
    });

    // Create payment record
    const payment = await Payment.create({
      amount: milestone.amount,
      currency: project.currency || "USD",
      status: "pending",
      paymentMethod: "stripe",
      stripePaymentId: paymentIntent.id,
      milestoneId: milestone._id,
      from: req.user.id,
      to: project.freelancerId ? project.freelancerId._id : null,
      createdAt: new Date(),
    });

    // Update milestone with payment reference
    await Milestone.findByIdAndUpdate(milestoneId, {
      paymentId: payment._id,
      status: "in-progress", // Automatically start milestone when payment is created
    });

    // For frontend to complete payment
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (err) {
    logger.error(`Payment creation error: ${err.message}`);
    next(err);
  }
};

// @desc    Release escrow payment to freelancer
// @route   POST /api/payments/escrow/release
// @access  Private (Employers only)
exports.releaseEscrowPayment = async (req, res, next) => {
  try {
    const { milestoneId } = req.body;

    // Check if milestone exists
    const milestone = await Milestone.findById(milestoneId).populate(
      "paymentId"
    );
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: "Milestone not found",
      });
    }

    // Check if milestone has payment
    if (!milestone.paymentId) {
      return res.status(400).json({
        success: false,
        error: "No payment exists for this milestone",
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
        error: "Not authorized to release payment for this milestone",
      });
    }

    // Check if milestone is completed
    if (milestone.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Cannot release payment for a milestone that is not completed",
      });
    }

    // Get freelancer
    const freelancer = await User.findById(project.freelancerId);
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        error: "Freelancer not found",
      });
    }

    // Check if freelancer has a Stripe account
    const stripeAccountId = freelancer.payment_methods?.stripeAccountId;
    if (!stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: "Freelancer has not set up payment methods",
      });
    }

    // Calculate platform fee (e.g., 10%)
    const platformFeePercentage = 0.1;
    const platformFee = milestone.amount * platformFeePercentage;
    const freelancerAmount = milestone.amount - platformFee;

    // Transfer funds to freelancer
    const transfer = await stripeClient.transferToFreelancer({
      amount: freelancerAmount,
      currency: project.currency || "USD",
      destination: stripeAccountId,
      description: `Payment for ${project.title} - ${milestone.title}`,
      metadata: {
        milestoneId: milestone._id.toString(),
        projectId: project._id.toString(),
        paymentId: milestone.paymentId._id.toString(),
      },
    });

    // Update payment record
    await Payment.findByIdAndUpdate(milestone.paymentId._id, {
      status: "completed",
      platformFee,
      escrowReleaseDate: new Date(),
      completedAt: new Date(),
    });

    // Update freelancer's wallet balance
    await User.findByIdAndUpdate(freelancer._id, {
      $inc: {
        "wallet.balance": freelancerAmount,
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment released successfully",
      data: {
        transferId: transfer.id,
        amount: freelancerAmount,
        platformFee,
      },
    });
  } catch (err) {
    logger.error(`Payment release error: ${err.message}`);
    next(err);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private (Payment owner or receiver only)
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "milestoneId"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    // Check if user is involved in the payment
    if (
      payment.from.toString() !== req.user.id &&
      payment.to.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this payment",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payments for user
// @route   GET /api/payments
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [{ from: req.user.id }, { to: req.user.id }],
    })
      .sort("-createdAt")
      .populate("milestoneId");

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};
