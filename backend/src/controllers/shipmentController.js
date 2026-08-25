const Shipment = require("../models/shipmentModel");
const { TIMELINE_STATUSES } = require("../models/shipmentModel");
const crypto = require("crypto");
const mongoose = require("mongoose");
const {
  analyzeShipment,
  answerShipmentQuestion,
} = require("../services/aiService");
const { calculateRisk } = require("../services/riskService");

// Shipments whose AI extraction scored below this are saved with
// needsReview: true and skip automatic risk scoring.
const LOW_CONFIDENCE_THRESHOLD = 60;

const createShipment = async (req, res) => {
  try {
    const { originalDescription } = req.body;

    if (!originalDescription) {
      return res.status(400).json({
        success: false,
        message: "Shipment description is required",
      });
    }

    const shipment = await Shipment.create({
      originalDescription,
    });

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipment,
    });
  } catch (error) {
    console.error("Create shipment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create shipment",
    });
  }
};

const getShipment = async (req, res) => {
  try {
    const shipments = await Shipment.find({});

    res.status(200).json({
      success: true,
      shipments,
    });
  } catch (error) {
    console.error("Error while displaying shipments:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to display shipments",
    });
  }
};

const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error("Error while displaying shipment:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to display shipment",
    });
  }
};

const deleteShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const deleted = await Shipment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `No shipment with the given id found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Deleted shipment with id: ${id}`,
    });
  } catch (error) {
    console.error("Error while deleting shipment:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete shipment",
    });
  }
};

const analyzeShipmentController = async (req, res) => {
  try {
    const { description } = req.body;

    // 1. Validate input
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Shipment description is required",
      });
    }

    // 2. Ask AI to extract shipment information
    const shipmentData = await analyzeShipment(description);

    // 3. Gate: low-confidence extractions skip risk scoring until a user
    //    verifies the extracted details via PATCH /shipments/:id/review
    const needsReview = shipmentData.confidence < LOW_CONFIDENCE_THRESHOLD;

    let riskAnalysis = null;

    if (!needsReview) {
      // 4. Calculate deterministic risk
      riskAnalysis = calculateRisk(shipmentData);
    }

    // 5. Save analysis to MongoDB
    const shipment = await Shipment.create({
      originalDescription: description,

      shipmentDetails: {
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        cargoType: shipmentData.product_type,
        weight: shipmentData.shipment_weight,
        deliveryDeadline: shipmentData.delivery_days,
        specialRequirements: shipmentData.special_requirements || [],
      },

      confidence: shipmentData.confidence,
      confidenceReasons: shipmentData.confidence_reasons || [],
      needsReview,

      ...(riskAnalysis && {
        priority: riskAnalysis.priority,
        riskLevel: riskAnalysis.riskLevel,
        riskScore: riskAnalysis.riskScore,

        alerts: riskAnalysis.alerts,
      }),

      recommendations: shipmentData.recommendations || [],
    });

    // 6. Return saved shipment
    res.status(201).json({
      success: true,
      message: needsReview
        ? "Low extraction confidence — please review the extracted details"
        : "Shipment analyzed successfully",
      shipment,
    });
  } catch (error) {
    console.error("Shipment analysis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to analyze shipment",
    });
  }
};

// User has verified/edited the AI-extracted details after a low-confidence
// extraction. Persists the corrections, then runs the risk engine and
// clears the review flag.
const reviewShipment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const { origin, destination, cargoType, weight, deliveryDeadline, specialRequirements } =
      req.body ?? {};

    // Validate optional fields when provided — they may legitimately be
    // null if the description never mentioned them.
    if (weight !== null && weight !== undefined && (!Number.isFinite(Number(weight)) || Number(weight) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Weight must be a positive number",
      });
    }

    if (
      deliveryDeadline !== null &&
      deliveryDeadline !== undefined &&
      (!Number.isInteger(Number(deliveryDeadline)) || Number(deliveryDeadline) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery deadline must be a positive whole number of days",
      });
    }

    if (
      specialRequirements !== undefined &&
      specialRequirements !== null &&
      (!Array.isArray(specialRequirements) ||
        specialRequirements.some((r) => typeof r !== "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Special requirements must be an array of strings",
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    shipment.shipmentDetails = {
      origin: origin ?? null,
      destination: destination ?? null,
      cargoType: cargoType ?? null,
      weight: weight !== undefined && weight !== null ? Number(weight) : null,
      deliveryDeadline:
        deliveryDeadline !== undefined && deliveryDeadline !== null
          ? Number(deliveryDeadline)
          : null,
      specialRequirements: specialRequirements ?? [],
    };

    // Run the (unmodified) deterministic risk engine on the verified data.
    // Field names are mapped back to the snake_case shape it expects.
    const riskAnalysis = calculateRisk({
      shipment_weight: shipment.shipmentDetails.weight,
      delivery_days: shipment.shipmentDetails.deliveryDeadline,
      origin: shipment.shipmentDetails.origin,
      destination: shipment.shipmentDetails.destination,
      special_requirements: shipment.shipmentDetails.specialRequirements,
    });

    shipment.priority = riskAnalysis.priority;
    shipment.riskLevel = riskAnalysis.riskLevel;
    shipment.riskScore = riskAnalysis.riskScore;
    shipment.alerts = riskAnalysis.alerts;
    shipment.needsReview = false;

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Shipment details confirmed and risk recalculated",
      shipment,
    });
  } catch (error) {
    console.error("Review shipment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to confirm shipment details",
    });
  }
};

// RAG-style follow-up Q&A: retrieve the shipment's stored data, inject it
// as grounding context in the system prompt, then generate an answer from
// the user's question plus recent conversation history.
const MAX_CONTEXT_MESSAGES = 20;

const buildShipmentContext = (shipment) => {
  const details = shipment.shipmentDetails;
  const timeline = (shipment.timeline || [])
    .map(
      (event) =>
        `- ${event.label} [${event.status}]${event.notes ? ` (${event.notes})` : ""}`,
    )
    .join("\n");

  return [
    "SHIPMENT DATA:",
    `- Origin: ${details.origin ?? "unknown"}`,
    `- Destination: ${details.destination ?? "unknown"}`,
    `- Cargo type: ${details.cargoType ?? "unknown"}`,
    `- Weight: ${details.weight != null ? `${details.weight} kg` : "unknown"}`,
    `- Delivery deadline: ${
      details.deliveryDeadline != null
        ? `${details.deliveryDeadline} days`
        : "unknown"
    }`,
    `- Special requirements: ${
      details.specialRequirements.length > 0
        ? details.specialRequirements.join(", ")
        : "none"
    }`,
    "",
    "RISK BREAKDOWN:",
    `- Risk level: ${shipment.riskLevel} (score ${shipment.riskScore}/100)`,
    `- Priority: ${shipment.priority}`,
    ...(shipment.alerts.length > 0
      ? [
          `- Alerts:\n${shipment.alerts.map((a) => `  * ${a}`).join("\n")}`,
        ]
      : []),
    ...(shipment.recommendations.length > 0
      ? [
          `- Recommendations:\n${shipment.recommendations
            .map((r) => `  * ${r}`)
            .join("\n")}`,
        ]
      : []),
    ...(timeline ? ["", "TIMELINE:", timeline] : []),
    "",
    `Original description from the user: "${shipment.originalDescription}"`,
  ].join("\n");
};

const askShipmentQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    // Retrieve → ground → generate
    const answer = await answerShipmentQuestion({
      question,
      history: shipment.messages.slice(-MAX_CONTEXT_MESSAGES),
      shipmentContext: buildShipmentContext(shipment),
    });

    // Append both turns atomically only after a successful AI response.
    await Shipment.updateOne(
      { _id: shipment._id },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: question.trim(), timestamp: new Date() },
              { role: "assistant", content: answer, timestamp: new Date() },
            ],
          },
        },
      },
    );

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Ask shipment question error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to answer question",
    });
  }
};

// Update a timeline event's status using the positional $ operator.
const updateTimelineEvent = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    if (!TIMELINE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${TIMELINE_STATUSES.join(", ")}`,
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    if (!shipment.timeline.some((event) => event.id === eventId)) {
      return res.status(404).json({
        success: false,
        message: "No timeline event with the given id found.",
      });
    }

    const setPayload = {
      "timeline.$.status": status,
    };

    // Completing a milestone records when it happened.
    if (status === "completed") {
      setPayload["timeline.$.timestamp"] = new Date();
    }

    // Positional $ updates the first array element matching the filter.
    await Shipment.updateOne(
      { _id: id, "timeline.id": eventId },
      { $set: setPayload },
    );

    const updated = await Shipment.findById(id);

    res.status(200).json({
      success: true,
      message: "Timeline event updated",
      shipment: updated,
    });
  } catch (error) {
    console.error("Update timeline event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update timeline event",
    });
  }
};

// Add a user-defined timepoint to the timeline.
const addTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, notes } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    if (!label || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: "Timeline label is required",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "Notes must be a string",
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    const event = {
      id: crypto.randomUUID(),
      label: label.trim(),
      status: "pending",
      isCustom: true,
      timestamp: new Date(),
      notes: notes?.trim() || "",
    };

    const updated = await Shipment.findByIdAndUpdate(
      id,
      { $push: { timeline: event } },
      { new: true, runValidators: true },
    );

    res.status(201).json({
      success: true,
      message: "Timeline event added",
      shipment: updated,
    });
  } catch (error) {
    console.error("Add timeline event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add timeline event",
    });
  }
};

// Remove a custom timepoint. Default milestones can never be deleted —
// the guard lives in both the pre-check and the $pull condition itself.
const deleteTimelineEvent = async (req, res) => {
  try {
    const { id, eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment with the given id found.",
      });
    }

    const event = shipment.timeline.find((event) => event.id === eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No timeline event with the given id found.",
      });
    }

    if (!event.isCustom) {
      return res.status(400).json({
        success: false,
        message: "Default milestones cannot be deleted",
      });
    }

    // The isCustom condition in $pull makes the delete safe even if the
    // document changes between the check and this write.
    await Shipment.updateOne(
      { _id: id, "timeline.id": eventId },
      { $pull: { timeline: { id: eventId, isCustom: true } } },
    );

    const updated = await Shipment.findById(id);

    res.status(200).json({
      success: true,
      message: `Deleted timeline event: ${event.label}`,
      shipment: updated,
    });
  } catch (error) {
    console.error("Delete timeline event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete timeline event",
    });
  }
};

module.exports = {
  createShipment,
  getShipmentById,
  getShipment,
  deleteShipmentById,
  analyzeShipmentController,
  reviewShipment,
  askShipmentQuestion,
  updateTimelineEvent,
  addTimelineEvent,
  deleteTimelineEvent,
};
