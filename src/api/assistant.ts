import { api } from "./client";
import type { Doctor } from "../types/clinic";

export type AssistantMessage = {
  role: "user" | "model";
  text: string;
  doctorIds?: string[];
};

export type AssistantReply = {
  reply: string;
  urgent: boolean;
  doctors: Array<Pick<Doctor, "id" | "name" | "specialization" | "avatarUrl" | "consultationFee">>;
};

export async function sendAssistantMessage(message: string, history: AssistantMessage[]) {
  const response = await api.post<{ data: AssistantReply }>("/public/assistant/chat", {
    message,
    history: history.slice(-6),
    demoAcknowledged: true
  });
  return response.data.data;
}
