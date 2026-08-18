const INDIA_LOCATIONS = [
  "mumbai",
  "delhi",
  "bangalore",
  "bengaluru",
  "pune",
  "chennai",
  "hyderabad",
  "kolkata",
  "ahmedabad",
  "surat",
  "jaipur",
  "thane",
  "nagpur",
];

const isInternationalShipment = (origin, destination) => {
  if (!origin || !destination) {
    return false;
  }

  const originIndia = INDIA_LOCATIONS.includes(origin.toLowerCase().trim());

  const destinationIndia = INDIA_LOCATIONS.includes(
    destination.toLowerCase().trim(),
  );

  return originIndia !== destinationIndia;
};

const calculateRisk = (shipment) => {
  let score = 0;
  const alerts = [];

  // 1. Delivery deadline
  if (shipment.delivery_days !== null) {
    if (shipment.delivery_days <= 3) {
      score += 30;

      alerts.push("Very tight delivery deadline");
    } else if (shipment.delivery_days <= 5) {
      score += 20;

      alerts.push("Tight delivery deadline");
    }
  }

  // 2. Shipment weight
  if (shipment.shipment_weight !== null) {
    if (shipment.shipment_weight >= 5000) {
      score += 25;

      alerts.push("Very heavy shipment");
    } else if (shipment.shipment_weight >= 1000) {
      score += 10;
    }
  }

  // 3. International shipment
  if (isInternationalShipment(shipment.origin, shipment.destination)) {
    score += 15;

    alerts.push("Shipment may require cross-border documentation");
  }

  // 4. Special requirements
  if (
    Array.isArray(shipment.special_requirements) &&
    shipment.special_requirements.length > 0
  ) {
    score += 15;

    alerts.push("Special handling requirements detected");
  }

  // Keep score between 0 and 100
  score = Math.min(score, 100);

  // Determine risk level
  let riskLevel;

  if (score <= 25) {
    riskLevel = "Low";
  } else if (score <= 50) {
    riskLevel = "Medium";
  } else if (score <= 75) {
    riskLevel = "High";
  } else {
    riskLevel = "Critical";
  }

  // Determine priority
  let priority;

  if (score >= 75) {
    priority = "Urgent";
  } else if (score >= 50) {
    priority = "High";
  } else if (score >= 25) {
    priority = "Normal";
  } else {
    priority = "Low";
  }

  return {
    riskScore: score,
    riskLevel,
    priority,
    alerts,
  };
};

module.exports = {
  calculateRisk,
};
