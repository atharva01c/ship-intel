const express = require("express");
const cors = require("cors");

const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Shipment Intelligence API is running",
  });
});

app.use("/api/shipments", shipmentRoutes);

module.exports = app;
