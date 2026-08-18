import axios from "axios";

import type { AnalyzeShipmentResponse, Shipment } from "../types/shipment";

const API_URL = "http://localhost:8000/api/shipments";

export const analyzeShipment = async (
  description: string,
): Promise<AnalyzeShipmentResponse> => {
  const response = await axios.post<AnalyzeShipmentResponse>(
    `${API_URL}/analyze`,
    { description },
  );

  return response.data;
};

export const getShipments = async (): Promise<Shipment[]> => {
  const response = await axios.get<{
    success: boolean;
    shipments: Shipment[];
  }>(API_URL);

  return response.data.shipments;
};

export const getShipmentById = async (id: string): Promise<Shipment> => {
  const response = await axios.get<{
    success: boolean;
    shipment: Shipment;
  }>(`${API_URL}/${id}`);

  return response.data.shipment;
};

export const deleteShipment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
