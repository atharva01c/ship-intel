// One-off migration: shipments created before the timeline feature are
// missing the `timeline` and `messages` fields, because Mongoose schema
// defaults only apply at creation time — they never apply retroactively to
// existing documents.
//
// Usage (from backend/): node src/scripts/backfillTimeline.js
require("dotenv").config();

const mongoose = require("mongoose");
const Shipment = require("../models/shipmentModel");

const backfill = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const query = { timeline: { $exists: false } };
  const stale = await Shipment.find(query).select("_id").lean();

  console.log(`Found ${stale.length} shipment(s) to backfill`);

  for (const { _id } of stale) {
    // A fresh seeded timeline per document so event ids stay unique.
    await Shipment.updateOne(
      { _id },
      {
        $set: {
          timeline: Shipment.buildDefaultTimeline(),
          messages: [],
        },
      },
    );
  }

  const remaining = await Shipment.countDocuments(query);
  console.log(`Done. ${remaining} shipment(s) still without a timeline.`);

  await mongoose.disconnect();
};

backfill().catch((error) => {
  console.error("Backfill failed:", error.message);
  process.exit(1);
});
