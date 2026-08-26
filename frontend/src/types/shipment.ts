/** Shape of the extracted shipment fields. Internal to this module —
    consumers read it via Shipment["shipmentDetails"]. */
interface ShipmentDetails {
  origin: string | null;
  destination: string | null;
  cargoType: string | null;
  weight: number | null;
  deliveryDeadline: number | null;
  specialRequirements: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type TimelineEventStatus = "pending" | "in-progress" | "completed";

export interface TimelineEvent {
  id: string;
  label: string;
  status: TimelineEventStatus;
  /** When the event was created, or when it was marked completed. */
  timestamp: string | null;
}

export interface Shipment {
  _id: string;
  originalDescription: string;

  shipmentDetails: ShipmentDetails;

  priority: "Low" | "Normal" | "High" | "Urgent";

  /** AI self-reported extraction confidence, 0-100.
      Null for shipments that were never analyzed. */
  confidence: number | null;

  /** What made the extraction uncertain, per the AI. */
  confidenceReasons: string[];

  /** True when confidence fell below the backend threshold — risk scoring
      is skipped until a user verifies the extracted details. */
  needsReview: boolean;

  riskLevel: "Low" | "Medium" | "High" | "Critical";

  riskScore: number;

  alerts: string[];

  recommendations: string[];

  /** Follow-up conversation history for this shipment. */
  messages: ChatMessage[];

  /** Progress milestones (defaults seeded at creation, plus custom ones). */
  timeline: TimelineEvent[];

  createdAt: string;
  updatedAt: string;
}

/** User-verified shipment details submitted after a low-confidence
    extraction; triggers risk recalculation on the backend. */
export interface ReviewShipmentPayload {
  origin: string | null;
  destination: string | null;
  cargoType: string | null;
  weight: number | null;
  deliveryDeadline: number | null;
  specialRequirements: string[];
}

export interface AnalyzeShipmentResponse {
  success: boolean;
  message: string;
  shipment: Shipment;
}
