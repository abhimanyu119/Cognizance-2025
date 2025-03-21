const mongoose = require("mongoose");

const DisputeSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: [true, "Please provide a reason for the dispute"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a detailed description"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    status: {
      type: String,
      enum: ["open", "under-review", "resolved", "closed"],
      default: "open",
    },
    resolution: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedToAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    conversations: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    outcome: {
      decision: {
        type: String,
        enum: ["full-employer", "full-freelancer", "partial"],
      },
      amount: Number,
      reason: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dispute", DisputeSchema);