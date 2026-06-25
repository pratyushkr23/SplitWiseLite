/**
 * useExpenseTracker — Application state hook.
 *
 * Responsibilities:
 *  - Manages form state (purely presentational)
 *  - Calls the backend API for all calculations
 *  - Tracks settlement board received from server
 *  - Zero arithmetic here; all math lives in server.js
 */
import { useState, useEffect, useCallback } from "react";
import { submitExpense, fetchSettlement, fetchExpenses, resetAll } from "../api/expenseApi";

const MEMBERS = ["Amit", "Rahul", "Sneha"];

const DEFAULT_PERCENTAGES = { Amit: 34, Rahul: 33, Sneha: 33 };

const DEFAULT_FORM = {
  description: "",
  amount: "",
  payer: "Amit",
  percentages: { ...DEFAULT_PERCENTAGES },
};

export function useExpenseTracker() {
  const [form, setForm]               = useState({ ...DEFAULT_FORM });
  const [settlement, setSettlement]   = useState([]);
  const [expenses, setExpenses]       = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError]             = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

  // Compute slider total — the ONLY frontend calculation (pure presentation validation)
  const sliderTotal = MEMBERS.reduce((sum, m) => sum + (form.percentages[m] || 0), 0);
  const isSliderValid = Math.abs(sliderTotal - 100) < 0.1;
  const isFormValid =
    isSliderValid &&
    form.description.trim() !== "" &&
    parseFloat(form.amount) > 0;

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const [settlementData, expensesData] = await Promise.all([
          fetchSettlement(),
          fetchExpenses(),
        ]);
        setSettlement(settlementData.settlement || []);
        setExpenses(expensesData || []);
      } catch {
        // Server might not be running yet; silently handle
      }
    }
    init();
  }, []);

  const handleDescriptionChange = useCallback((val) => {
    setForm((f) => ({ ...f, description: val }));
  }, []);

  const handleAmountChange = useCallback((val) => {
    setForm((f) => ({ ...f, amount: val }));
  }, []);

  const handlePayerChange = useCallback((val) => {
    setForm((f) => ({ ...f, payer: val }));
  }, []);

  const handlePercentageChange = useCallback((member, value) => {
    setForm((f) => ({
      ...f,
      percentages: { ...f.percentages, [member]: Number(value) },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await submitExpense({
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        payer: form.payer,
        percentages: form.percentages,
      });

      if (result.success) {
        setSettlement(result.settlement);
        setExpenses((prev) => [...prev, result.expense]);
        setForm({ ...DEFAULT_FORM, percentages: { ...DEFAULT_PERCENTAGES } });
        setSuccessMsg(`"${result.expense.description}" added successfully!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      const msgs =
        err.response?.data?.errors?.join(", ") ||
        "Failed to submit expense. Is the backend running?";
      setError(msgs);
    } finally {
      setSubmitting(false);
    }
  }, [form, isFormValid]);

  const handleReset = useCallback(async () => {
    try {
      await resetAll();
      setSettlement([]);
      setExpenses([]);
      setForm({ ...DEFAULT_FORM, percentages: { ...DEFAULT_PERCENTAGES } });
      setError(null);
      setSuccessMsg("All expenses cleared.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {
      setError("Failed to reset. Is the backend running?");
    }
  }, []);

  return {
    form,
    settlement,
    expenses,
    sliderTotal,
    isSliderValid,
    isFormValid,
    isSubmitting,
    error,
    successMsg,
    members: MEMBERS,
    handleDescriptionChange,
    handleAmountChange,
    handlePayerChange,
    handlePercentageChange,
    handleSubmit,
    handleReset,
  };
}
