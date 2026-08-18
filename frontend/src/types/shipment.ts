export interface ShipmentDetails {
  origin: string | null;
  destination: string | null;
  cargoType: string | null;
  weight: number | null;
  deliveryDeadline: number | null;
  specialRequirements: string[];
}

export interface Shipment {
  _id: string;
  originalDescription: string;

  shipmentDetails: ShipmentDetails;

  priority: "Low" | "Normal" | "High" | "Urgent";

  riskLevel: "Low" | "Medium" | "High" | "Critical";

  riskScore: number;

  alerts: string[];

  recommendations: string[];

  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeShipmentResponse {
  success: boolean;
  message: string;
  shipment: Shipment;
}
