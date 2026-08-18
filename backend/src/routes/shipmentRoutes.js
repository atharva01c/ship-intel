const express = require("express");

const {
  createShipment,
  getShipment,
  getShipmentById,
  deleteShipmentById,
  analyzeShipmentController,
} = require("../controllers/shipmentController");

const router = express.Router();

router.post("/", createShipment);
router.post("/analyze", analyzeShipmentController);
router.get("/", getShipment);
router.get("/:id", getShipmentById);
router.delete("/:id", deleteShipmentById);

module.exports = router;
