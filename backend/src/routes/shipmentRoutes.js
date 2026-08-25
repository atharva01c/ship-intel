const express = require("express");

const {
  createShipment,
  getShipment,
  getShipmentById,
  deleteShipmentById,
  analyzeShipmentController,
  reviewShipment,
  askShipmentQuestion,
  updateTimelineEvent,
} = require("../controllers/shipmentController");

const router = express.Router();

router.post("/", createShipment);
router.post("/analyze", analyzeShipmentController);
router.get("/", getShipment);
router.patch("/:id/review", reviewShipment);
router.post("/:id/ask", askShipmentQuestion);
router.patch("/:id/timeline/:eventId", updateTimelineEvent);
router.get("/:id", getShipmentById);
router.delete("/:id", deleteShipmentById);

module.exports = router;
