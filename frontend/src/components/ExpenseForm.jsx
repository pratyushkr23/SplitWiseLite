import React from "react";

const MEMBER_COLORS = {
  Amit:  { bar: "#6c63ff", glow: "#6c63ff55" },
  Rahul: { bar: "#06b6d4", glow: "#06b6d455" },
  Sneha: { bar: "#f472b6", glow: "#f472b655" },
};

function PercentageSlider({ member, value, onChange }) {
  const colors = MEMBER_COLORS[member];
  const initials = member[0];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: colors.bar, boxShadow: `0 0 8px ${colors.glow}` }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-200">{member}</span>
        </div>
        <span
          className="font-mono text-sm font-semibold w-12 text-right"
          style={{ color: colors.bar }}
        >
          {value}%
        </span>
      </div>

      <div className="relative flex items-center">
        {/* Track fill overlay */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full pointer-events-none transition-all duration-150"
          style={{
            width: `${value}%`,
            background: colors.bar,
            boxShadow: value > 0 ? `0 0 6px ${colors.glow}` : "none",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(member, e.target.value)}
          className="slider-thumb w-full h-1 rounded-full cursor-pointer relative z-10 appearance-none bg-transparent"
          style={{
            "--thumb-color": colors.bar,
          }}
        />
      </div>
    </div>
  );
}

export default function ExpenseForm({
  form,
  members,
  sliderTotal,
  isSliderValid,
  isFormValid,
  isSubmitting,
  onDescriptionChange,
  onAmountChange,
  onPayerChange,
  onPercentageChange,
  onSubmit,
}) {
  const sliderDiff = sliderTotal - 100;
  const sliderColor = isSliderValid ? "text-success" : sliderDiff > 0 ? "text-danger" : "text-warning";
  const sliderLabel = isSliderValid
    ? "✓ Splits total 100%"
    : sliderDiff > 0
    ? `Over by ${sliderDiff.toFixed(0)}%`
    : `Under by ${Math.abs(sliderDiff).toFixed(0)}%`;

  return (
    <div className="flex flex-col gap-5">
      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted">
          Item Description
        </label>
        <input
          type="text"
          placeholder="e.g. Dinner, Cab fare, Hotel…"
          value={form.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        />
      </div>

      {/* Amount + Payer row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">
            Total Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">₹</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">
            Paid By
          </label>
          <div className="relative">
            <select
              value={form.payer}
              onChange={(e) => onPayerChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none cursor-pointer transition-all"
            >
              {members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Percentage Sliders */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">
            Split Percentages
          </label>
          <span className={`text-xs font-semibold font-mono transition-colors ${sliderColor}`}>
            {sliderLabel}
          </span>
        </div>

        {/* Slider progress bar */}
        <div className="h-1 w-full bg-border rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min(sliderTotal, 100)}%`,
              background: isSliderValid
                ? "#22c55e"
                : sliderDiff > 0
                ? "#ef4444"
                : "#f59e0b",
              boxShadow: isSliderValid ? "0 0 8px #22c55e66" : "none",
            }}
          />
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-4">
          {members.map((m) => (
            <PercentageSlider
              key={m}
              member={m}
              value={form.percentages[m]}
              onChange={onPercentageChange}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!isFormValid || isSubmitting}
        className={`
          w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200
          ${isFormValid && !isSubmitting
            ? "bg-accent text-white cursor-pointer hover:bg-accent-soft shadow-glow hover:shadow-glow"
            : "bg-border text-muted cursor-not-allowed opacity-60"
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : (
          "Submit Expense"
        )}
      </button>
    </div>
  );
}
