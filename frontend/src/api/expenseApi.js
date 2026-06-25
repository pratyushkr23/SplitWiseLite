/**
 * API Client — all calls proxy to the backend.
 * Zero business logic lives here; this is pure transport.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

/** Fetch the current settlement board from the server. */
export async function fetchSettlement() {
  const { data } = await api.get("/settlement");
  return data;
}

/** Fetch all recorded expenses. */
export async function fetchExpenses() {
  const { data } = await api.get("/expenses");
  return data.expenses;
}

/**
 * Submit a new expense to the server for processing.
 * @param {{ description: string, amount: number, payer: string, percentages: Record<string,number> }} payload
 */
export async function submitExpense(payload) {
  const { data } = await api.post("/expenses", payload);
  return data;
}

/** Reset all expenses and balances on the server. */
export async function resetAll() {
  const { data } = await api.delete("/reset");
  return data;
}
