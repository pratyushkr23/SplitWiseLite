import React from "react";

const MEMBER_COLORS = {
  Amit:  "#6c63ff",
  Rahul: "#06b6d4",
  Sneha: "#f472b6",
};

function MemberBadge({ name }) {
  const color = MEMBER_COLORS[name] || "#9ca3af";
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white mr-1.5 flex-shrink-0"
      style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
    >
      {name[0]}
    </span>
  );
}

function SettlementRow({ entry }) {
  const isEven = entry.isEven;

  return (
    <div
      className={`
        flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all animate-slide-up
        ${isEven
          ? "bg-success/5 border-success/20"
          : "bg-card border-border hover:border-accent/40"
        }
      `}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <MemberBadge name={entry.member} />
        <span className="text-xs font-semibold text-subtle uppercase tracking-widest">
          {entry.member}
        </span>
        {isEven && (
          <span className="ml-auto text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            SETTLED
          </span>
        )}
      </div>

      {entry.sentences.map((sentence, i) => (
        <p
          key={i}
          className={`text-sm leading-relaxed ${
            isEven ? "text-success/80" : "text-slate-300"
          }`}
        >
          {isEven ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {sentence}
            </span>
          ) : (
            <DebtSentence sentence={sentence} />
          )}
        </p>
      ))}
    </div>
  );
}

/** Highlight the amount in a debt sentence */
function DebtSentence({ sentence }) {
  // e.g. "Rahul owes Sneha ₹15.00"
  const match = sentence.match(/^(.*)(₹[\d,]+\.\d{2})(.*)$/);
  if (!match) return <span>{sentence}</span>;

  return (
    <span>
      {match[1]}
      <span className="font-mono font-semibold text-warning">{match[2]}</span>
      {match[3]}
    </span>
  );
}

export default function SettlementBoard({ settlement, expenses }) {
  const hasData = expenses.length > 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            Net Balances
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Minimized debt settlement
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-1.5 bg-accent-dim rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse_soft" />
            <span className="text-xs font-semibold text-accent-soft">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Settlement cards */}
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2.5">
          {settlement.map((entry) => (
            <SettlementRow key={entry.member} entry={entry} />
          ))}
        </div>
      )}

      {/* Expense Log */}
      {hasData && (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
            Expense History
          </p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {[...expenses].reverse().map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between bg-surface rounded-lg px-3 py-2.5 border border-border"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {exp.description}
                  </span>
                  <span className="text-xs text-muted">
                    Paid by{" "}
                    <span
                      className="font-semibold"
                      style={{ color: MEMBER_COLORS[exp.payer] }}
                    >
                      {exp.payer}
                    </span>
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-300 ml-3 flex-shrink-0">
                  ₹{parseFloat(exp.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-dim flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-subtle">No expenses yet</p>
      <p className="text-xs text-muted mt-1">
        Add your first expense to see the settlement board
      </p>
    </div>
  );
}
