const ethers = require("ethers");
const User = require("../models/User");
const Project = require("../models/Project");
const Milestone = require("../models/Milestone");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const contractABI = require("../contracts/Cognizance2025Payments.json").abi;

// Contract configuration
const CONTRACT_ADDRESS = process.env.ETHEREUM_CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.ETHEREUM_PROVIDER_URL;

// Get provider and contract instances
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// Create project funding
exports.createProjectFunding = async (req, res) => {
  try {
    const { projectId, txHash } = req.body;

    // Verify transaction is confirmed
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return res
        .status(400)
        .json({ success: false, error: "Transaction not found" });
    }

    await tx.wait(1); // Wait for 1 confirmation

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt.status) {
      return res
        .status(400)
        .json({ success: false, error: "Transaction failed" });
    }

    // Get project details from contract event logs
    const events = await contract.queryFilter(
      contract.filters.ProjectCreated(),
      receipt.blockNumber,
      receipt.blockNumber
    );

    // Find the event matching our transaction
    const event = events.find((e) => e.transactionHash === txHash);
    if (!event) {
      return res
        .status(400)
        .json({ success: false, error: "Project creation event not found" });
    }

    const blockchainProjectId = event.args.projectId.toNumber();

    // Update project in database
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    // Update project status
    project.status = "open";
    await project.save();

    // Create payment record
    await Payment.create({
      project: projectId,
      amount: ethers.utils.formatEther(tx.value),
      currency: "ETH",
      status: "escrow",
      employer: req.user.id,
      freelancer: project.freelancerId,
      blockchainTxHash: txHash,
      blockchainContractAddress: CONTRACT_ADDRESS,
      blockchainProjectId: blockchainProjectId,
    });

    // Create notification for freelancer
    await Notification.create({
      type: "payment",
      message: `Project "${project.title}" has been funded and is ready to start`,
      userId: project.freelancerId,
      referenceId: project._id,
      referenceModel: "Project",
    });

    res.status(200).json({
      success: true,
      data: {
        blockchainProjectId,
        txHash,
      },
    });
  } catch (error) {
    console.error("Error in createProjectFunding:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Add more controller methods here for milestone funding, releasing payments, etc.
