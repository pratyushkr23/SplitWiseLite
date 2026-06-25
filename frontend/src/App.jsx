import React from "react";
import { useExpenseTracker } from "./hooks/useExpenseTracker";
import ExpenseForm from "./components/ExpenseForm";
import SettlementBoard from "./components/SettlementBoard";

export default function App() {
  const tracker = useExpenseTracker();

  return (
    <div className="min-h-screen bg-surface text-slate-200 flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-panel sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-dim flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-none">
                Splitwise-Lite
              </h1>
              <p className="text-[10px] text-muted mt-0.5 leading-none">
                Group Expense Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Member pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[
                { name: "Amit",  color: "#6c63ff" },
                { name: "Rahul", color: "#06b6d4" },
                { name: "Sneha", color: "#f472b6" },
              ].map(({ name, color }) => (
                <span
                  key={name}
                  className="text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ color, borderColor: `${color}44`, background: `${color}11` }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Reset button */}
            {tracker.expenses.length > 0 && (
              <button
                onClick={tracker.handleReset}
                className="text-xs text-muted hover:text-danger border border-border hover:border-danger/40 px-3 py-1.5 rounded-lg transition-all"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Toast Notifications ──────────────────────────────────────────────── */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {tracker.successMsg && (
          <div className="animate-slide-up bg-success/10 border border-success/30 text-success text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
            ✓ {tracker.successMsg}
          </div>
        )}
        {tracker.error && (
          <div className="animate-slide-up bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg max-w-sm">
            ✕ {tracker.error}
          </div>
        )}
      </div>

      {/* ── Main Split Layout ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* LEFT — Bill Creation Form */}
          <div className="lg:col-span-2">
            <div className="bg-panel border border-border rounded-2xl p-5 sticky top-20">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Add Expense
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  All splits are calculated server-side
                </p>
              </div>

              <ExpenseForm
                form={tracker.form}
                members={tracker.members}
                sliderTotal={tracker.sliderTotal}
                isSliderValid={tracker.isSliderValid}
                isFormValid={tracker.isFormValid}
                isSubmitting={tracker.isSubmitting}
                onDescriptionChange={tracker.handleDescriptionChange}
                onAmountChange={tracker.handleAmountChange}
                onPayerChange={tracker.handlePayerChange}
                onPercentageChange={tracker.handlePercentageChange}
                onSubmit={tracker.handleSubmit}
              />
            </div>
          </div>

          {/* RIGHT — Settlement Board */}
          <div className="lg:col-span-3">
            <div className="bg-panel border border-border rounded-2xl p-5">
              <SettlementBoard
                settlement={tracker.settlement}
                expenses={tracker.expenses}
              />
            </div>
          </div>

        </div>

        {/* Architecture Note */}
        <div className="mt-6 bg-panel/50 border border-border/50 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs text-muted leading-relaxed">
            <span className="text-subtle font-medium">Architecture:</span> All proportional division, debt netting, and minimization algorithms execute exclusively on the Node.js backend (port 3001). The frontend renders results — zero financial calculations occur in the browser.
          </p>
        </div>
      </main>
    </div>
  );
}
