# Splitwise-Lite — Group Expense Tracker

A full-stack collaborative expense ledger for **Amit, Rahul, and Sneha** with server-side debt minimization.

---

## Architecture

```
splitwise-lite/
├── backend/
│   ├── server.js          ← All business logic lives here
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx                         ← Split layout shell
        ├── api/
        │   └── expenseApi.js               ← Thin Axios transport layer
        ├── hooks/
        │   └── useExpenseTracker.js        ← UI state; zero calculations
        └── components/
            ├── ExpenseForm.jsx             ← Sliders, inputs, submit
            └── SettlementBoard.jsx         ← Live debt display
```

### Key Architecture Rules
- **All** proportional division, balance netting, and debt minimisation run in `backend/server.js`
- The frontend has exactly one calculation: summing slider values to 100% (presentation validation only)
- No financial arithmetic in React components or hooks

---

## Prerequisites
- Node.js v18+
- npm v9+

---

## Setup & Run

### 1. Start the Backend
```bash
cd backend
npm install
npm start
# → Running at http://localhost:3001
```

### 2. Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# → Running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/expenses` | List all expenses |
| GET | `/api/settlement` | Current minimised debts |
| POST | `/api/expenses` | Add new expense |
| DELETE | `/api/reset` | Clear all data |

### POST `/api/expenses` payload
```json
{
  "description": "Dinner",
  "amount": 900,
  "payer": "Amit",
  "percentages": { "Amit": 50, "Rahul": 30, "Sneha": 20 }
}
```

---

## Debt Minimisation Algorithm

1. Compute **net balance** per person (owed − owes across all pairwise ledgers)
2. Split into **creditors** (positive net) and **debtors** (negative net)
3. Greedy match: largest debtor pays largest creditor, repeat until settled
4. Produces the **minimum number of transactions** to clear all debts

**Example:**
- Expense A: Amit pays ₹600, Rahul owes ₹300, Sneha owes ₹300
- Expense B: Rahul pays ₹200, Amit owes ₹100, Sneha owes ₹100
- Net: Amit is owed ₹200, Rahul is owed ₹100, Sneha owes ₹400
- Result: `Sneha owes Amit ₹200`, `Sneha owes Rahul ₹100` (2 transactions, minimised)
