const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config/env");
const logger = require("../config/logger");
const WorkSubmission = require("../models/WorkSubmission");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

/**
 * Process a new submission using AI verification
 * @param {string} submissionId - The ID of the submission to verify
 * @returns {Object} - Verification result
 */
exports.verifySubmission = async (submissionId) => {
  try {
    // Get submission details
    const submission = await WorkSubmission.findById(submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get milestone and project details
    const milestone = await Milestone.findById(submission.milestoneId).populate(
      "projectId"
    );
    if (!milestone) {
      throw new Error("Milestone not found");
    }

    logger.info(`Starting AI verification for submission ${submissionId}`);

    // Extract requirements and deliverables for AI analysis
    const requirements = extractRequirements(milestone);
    const deliverables = extractDeliverables(submission);

    // Run AI verification
    const startTime = Date.now();
    const verificationResult = await runAIVerification(
      requirements,
      deliverables,
      submission.attachments
    );
    const processingTime = Date.now() - startTime;

    logger.info(
      `AI verification completed in ${processingTime}ms with status: ${verificationResult.status}`
    );

    // Update submission with verification results
    await WorkSubmission.findByIdAndUpdate(submissionId, {
      aiVerification: {
        result: verificationResult.status,
        confidence: verificationResult.confidence,
        feedback: verificationResult.feedback,
        verifiedAt: new Date(),
        escalatedToManual: verificationResult.confidence < 0.85,
      },
    });

    // Handle verification result
    if (
      verificationResult.status === "approved" &&
      verificationResult.confidence >= 0.85
    ) {
      // High confidence approval - automatic approval
      await handleAutoApproval(submission, milestone);
      return {
        status: "auto-approved",
        message: "Submission automatically approved by AI verification",
        feedback: verificationResult.feedback,
      };
    } else if (
      verificationResult.status === "rejected" &&
      verificationResult.confidence >= 0.85
    ) {
      // High confidence rejection - automatic rejection
      await handleAutoRejection(
        submission,
        milestone,
        verificationResult.feedback
      );
      return {
        status: "auto-rejected",
        message: "Submission automatically rejected by AI verification",
        feedback: verificationResult.feedback,
      };
    } else {
      // Uncertain or low confidence - escalate to manual review
      await escalateToManualReview(submission, milestone, verificationResult);
      return {
        status: "manual-review",
        message: "Submission has been escalated for manual review",
        feedback: verificationResult.feedback,
      };
    }
  } catch (err) {
    logger.error(`AI verification error: ${err.message}`, { stack: err.stack });
    // Always default to manual review on error
    await escalateToManualReview(submission, milestone, {
      status: "error",
      confidence: 0,
      feedback: {
        strengths: [],
        issues: ["Error during AI verification"],
        suggestions: ["Please review manually"],
      },
    });
    throw err;
  }
};

/**
 * Extract structured requirements from milestone data
 */
function extractRequirements(milestone) {
  return {
    title: milestone.title,
    description: milestone.description,
    projectTitle: milestone.projectId.title,
    projectDescription: milestone.projectId.description,
    projectRequirements: milestone.projectId.requirements || {},
    deliverableTypes: milestone.requiredDeliverables || [],
    // For logo projects, extract specific requirements
    logoRequirements: milestone.projectId.requirements?.logoDetails || {},
  };
}

/**
 * Extract deliverables from submission data
 */
function extractDeliverables(submission) {
  return {
    description: submission.description,
    attachmentCount: submission.attachments.length,
    attachmentTypes: submission.attachments.map((a) => a.type),
    attachmentNames: submission.attachments.map((a) => a.name),
  };
}

/**
 * Run AI verification using Gemini API
 */
async function runAIVerification(requirements, deliverables, attachments) {
  try {
    // Prepare image files for Gemini processing
    const imageAttachments = await prepareImageFiles(attachments);

    // Construct prompt for Gemini
    const prompt = `
You are a specialized AI reviewer for our milestone-based freelance platform. Your task is to verify if a submitted deliverable meets the specified requirements.

# Project Requirements
Project: ${requirements.projectTitle}
Project Description: ${requirements.projectDescription}
Milestone: ${requirements.title}
Milestone Description: ${requirements.description}
${
  requirements.logoRequirements &&
  Object.keys(requirements.logoRequirements).length > 0
    ? `
# Logo-Specific Requirements
Brand Name: ${requirements.logoRequirements.brandName || "Not specified"}
Color Scheme: ${requirements.logoRequirements.colorScheme || "Not specified"}
Style Preferences: ${
        requirements.logoRequirements.stylePreferences || "Not specified"
      }
Industry: ${requirements.logoRequirements.industry || "Not specified"}
Target Audience: ${
        requirements.logoRequirements.targetAudience || "Not specified"
      }
Required Formats: ${requirements.deliverableTypes.join(", ") || "Not specified"}
`
    : ""
}

# Submitted Deliverables
Submission Description: ${deliverables.description}
Number of Attachments: ${deliverables.attachmentCount}
Attachment Types: ${deliverables.attachmentTypes.join(", ")}
File Names: ${deliverables.attachmentNames.join(", ")}

# Your Task
1. Analyze the submitted files and determine if they match the requirements
2. For logo designs, evaluate if the design elements (colors, style, etc.) match the requirements
3. Check if all required file formats are provided
4. Assign a verification status: "approved", "rejected", or "uncertain"
5. Provide a confidence score from 0 to 1
6. Give specific feedback on what meets requirements and what doesn't

Respond with JSON in this exact format:
{
  "status": "approved|rejected|uncertain",
  "confidence": 0.XX,
  "feedback": {
    "strengths": ["list of things that meet requirements"],
    "issues": ["list of discrepancies or missing items"],
    "suggestions": ["suggestions for improvement if any"]
  },
  "requirementsSatisfied": true|false,
  "recommendedAction": "approve|reject|manual-review"
}
`;

    // Call Gemini API with text and images
    let parts = [prompt];
    if (imageAttachments.length > 0) {
      parts = [prompt, ...imageAttachments];
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    try {
      // Try to find JSON in the response
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart >= 0 && jsonEnd >= 0) {
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        const verificationResult = JSON.parse(jsonString);

        return {
          status: verificationResult.status,
          confidence: verificationResult.confidence,
          feedback: verificationResult.feedback,
          requirementsSatisfied: verificationResult.requirementsSatisfied,
          recommendedAction: verificationResult.recommendedAction,
        };
      }
    } catch (err) {
      logger.error(`Error parsing AI response: ${err.message}`);
    }

    // Default response if parsing fails
    return {
      status: "uncertain",
      confidence: 0.5,
      feedback: {
        strengths: [],
        issues: ["Could not analyze submission properly"],
        suggestions: ["Please perform manual review"],
      },
      requirementsSatisfied: false,
      recommendedAction: "manual-review",
    };
  } catch (error) {
    logger.error(`Gemini API error: ${error.message}`);
    // Default to uncertain on API failure
    return {
      status: "uncertain",
      confidence: 0,
      feedback: {
        strengths: [],
        issues: ["AI verification service encountered an error"],
        suggestions: ["Please wait for manual review"],
      },
      requirementsSatisfied: false,
      recommendedAction: "manual-review",
    };
  }
}

/**
 * Prepare image files for Gemini API
 */
async function prepareImageFiles(attachments) {
  const imageAttachments = [];

  for (const attachment of attachments) {
    // Only process image files
    if (attachment.type && attachment.type.startsWith("image/")) {
      try {
        // If we have the file locally
        const filePath = path.join(process.cwd(), "public", attachment.url);

        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath);
          const base64Data = fileData.toString("base64");

          imageAttachments.push({
            inlineData: {
              data: base64Data,
              mimeType: attachment.type,
            },
          });
        } else if (attachment.url.startsWith("http")) {
          // If it's an external URL
          const response = await axios.get(attachment.url, {
            responseType: "arraybuffer",
          });
          const fileData = Buffer.from(response.data, "binary").toString(
            "base64"
          );

          imageAttachments.push({
            inlineData: {
              data: fileData,
              mimeType: attachment.type,
            },
          });
        }
      } catch (error) {
        logger.error(
          `Error preparing image ${attachment.name}: ${error.message}`
        );
      }
    }
  }

  return imageAttachments;
}

/**
 * Handle automatic approval
 */
async function handleAutoApproval(submission, milestone) {
  logger.info(
    `Auto-approving submission ${submission._id} for milestone ${milestone._id}`
  );

  // Update submission status
  await WorkSubmission.findByIdAndUpdate(submission._id, {
    status: "approved",
    reviewedAt: new Date(),
    reviewNotes: "Automatically approved by AI verification",
  });

  // Update milestone status
  await Milestone.findByIdAndUpdate(milestone._id, {
    status: "completed",
    completedAt: new Date(),
  });

  // Update project completed milestones count
  await Project.findByIdAndUpdate(milestone.projectId._id, {
    $inc: { completedMilestones: 1 },
  });

  // In a real app, you would notify users here
}

/**
 * Handle automatic rejection
 */
async function handleAutoRejection(submission, milestone, feedback) {
  logger.info(
    `Auto-rejecting submission ${submission._id} for milestone ${milestone._id}`
  );

  // Update submission status
  await WorkSubmission.findByIdAndUpdate(submission._id, {
    status: "rejected",
    reviewedAt: new Date(),
    reviewNotes:
      "Automatically rejected by AI verification. See feedback for details.",
  });

  // Keep milestone status as in-progress
  await Milestone.findByIdAndUpdate(milestone._id, {
    status: "in-progress",
  });

  // In a real app, you would notify users here
}

/**
 * Escalate to manual review
 */
async function escalateToManualReview(
  submission,
  milestone,
  verificationResult
) {
  logger.info(`Escalating submission ${submission._id} for manual review`);

  // Leave submission status as pending
  await WorkSubmission.findByIdAndUpdate(submission._id, {
    $set: {
      "aiVerification.escalatedToManual": true,
    },
  });

  // Keep milestone as under-review
  // No change needed to milestone status

  // In a real app, you would notify users here
}
