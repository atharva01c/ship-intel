const express = require("express");
const cors = require("cors");

const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

// Middleware
// Allowlist: the configured frontend origin plus local dev origins, so a
// missing/misconfigured FRONTEND_URL can't silently disable CORS.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
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
