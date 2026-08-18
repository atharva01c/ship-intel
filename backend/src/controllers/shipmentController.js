const Shipment = require("../models/shipmentModel");
const mongoose = require("mongoose");
const { analyzeShipment } = require("../services/aiService");
const { calculateRisk } = require("../services/riskService");

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

    // 3. Calculate deterministic risk
    const riskAnalysis = calculateRisk(shipmentData);

    // 4. Save complete analysis to MongoDB
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

      priority: riskAnalysis.priority,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.riskScore,

      alerts: riskAnalysis.alerts,

      recommendations: shipmentData.recommendations || [],
    });

    // 5. Return saved shipment
    res.status(201).json({
      success: true,
      message: "Shipment analyzed successfully",
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

module.exports = {
  createShipment,
  getShipmentById,
  getShipment,
  deleteShipmentById,
  analyzeShipmentController,
};
