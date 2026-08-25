const mongoose = require("mongoose");
const crypto = require("crypto");

const TIMELINE_STATUSES = ["pending", "in-progress", "completed"];

const DEFAULT_MILESTONES = [
  "Order confirmed",
  "Shipped",
  "In transit",
  "Customs clearance",
  "Out for delivery",
  "Delivered",
];

// Factory (not a literal) so every new document gets its own event objects
// with fresh ids instead of sharing references across documents. All
// milestones start pending except the first, which is completed at
// creation time.
const buildDefaultTimeline = () =>
  DEFAULT_MILESTONES.map((label, index) => ({
    id: crypto.randomUUID(),
    label,
    status: index === 0 ? "completed" : "pending",
    isCustom: false,
    timestamp: index === 0 ? new Date() : null,
    notes: "",
  }));

const shipmentSchema = new mongoose.Schema(
  {
    originalDescription: {
      type: String,
      required: true,
      trim: true,
    },

    shipmentDetails: {
      origin: {
        type: String,
        default: null,
      },

      destination: {
        type: String,
        default: null,
      },

      cargoType: {
        type: String,
        default: null,
      },

      weight: {
        type: Number,
        default: null,
      },

      deliveryDeadline: {
        type: Number,
        default: null,
      },

      specialRequirements: {
        type: [String],
        default: [],
      },
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Low",
    },

    // AI self-reported extraction confidence (0-100).
    // Null for shipments that were never analyzed.
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // What made the extraction uncertain (mirrors AI's confidence_reasons).
    confidenceReasons: {
      type: [String],
      default: [],
    },

    // Set when confidence is below the backend threshold; blocks automatic
    // risk scoring until a user verifies the extracted details.
    needsReview: {
      type: Boolean,
      default: false,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    alerts: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    // Conversation history for follow-up questions about this shipment.
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },

        content: {
          type: String,
          required: true,
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Progress milestones. Defaults are seeded on creation; users can add
    // their own timepoints (isCustom: true).
    timeline: {
      type: [
        {
          id: {
            type: String,
            required: true,
          },

          label: {
            type: String,
            required: true,
            trim: true,
          },

          status: {
            type: String,
            enum: TIMELINE_STATUSES,
            default: "pending",
          },

          isCustom: {
            type: Boolean,
            default: false,
          },

          // When the event was created, or when it was marked completed.
          timestamp: {
            type: Date,
            default: null,
          },

          notes: {
            type: String,
            default: "",
          },
        },
      ],
      default: buildDefaultTimeline,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Shipment", shipmentSchema);

// Re-exported so controllers/scripts can validate statuses and reuse the
// default timeline without duplicating the logic.
module.exports.TIMELINE_STATUSES = TIMELINE_STATUSES;
module.exports.buildDefaultTimeline = buildDefaultTimeline;
