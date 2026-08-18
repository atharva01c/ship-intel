const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Shipment", shipmentSchema);
