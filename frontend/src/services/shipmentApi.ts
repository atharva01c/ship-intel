import axios from "axios";

import type {
  AnalyzeShipmentResponse,
  Shipment,
  ReviewShipmentPayload,
  TimelineEventStatus,
} from "../types/shipment";

const API_URL = import.meta.env.VITE_API_URL;

export const analyzeShipment = async (
  description: string,
): Promise<AnalyzeShipmentResponse> => {
  const response = await axios.post<AnalyzeShipmentResponse>(
    `${API_URL}/shipments/analyze`,
    { description },
  );

  return response.data;
};

export const getShipments = async (): Promise<Shipment[]> => {
  const response = await axios.get<{
    success: boolean;
    shipments: Shipment[];
  }>(`${API_URL}/shipments`);

  return response.data.shipments;
};

export const getShipmentById = async (id: string): Promise<Shipment> => {
  const response = await axios.get<{
    success: boolean;
    shipment: Shipment;
  }>(`${API_URL}/shipments/${id}`);

  return response.data.shipment;
};

export const deleteShipment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/shipments/${id}`);
};

export const reviewShipment = async (
  id: string,
  payload: ReviewShipmentPayload,
): Promise<Shipment> => {
  const response = await axios.patch<{
    success: boolean;
    message: string;
    shipment: Shipment;
  }>(`${API_URL}/shipments/${id}/review`, payload);

  return response.data.shipment;
};

export interface AskShipmentResponse {
  success: boolean;
  answer: string;
}

export const askShipmentQuestion = async (
  id: string,
  question: string,
): Promise<AskShipmentResponse> => {
  const response = await axios.post<AskShipmentResponse>(
    `${API_URL}/shipments/${id}/ask`,
    { question },
  );

  return response.data;
};

export const updateTimelineEventStatus = async (
  id: string,
  eventId: string,
  status: TimelineEventStatus,
): Promise<Shipment> => {
  const response = await axios.patch<{
    success: boolean;
    message: string;
    shipment: Shipment;
  }>(`${API_URL}/shipments/${id}/timeline/${eventId}`, { status });

  return response.data.shipment;
};
