/**
 * Splitwise-Lite Expense Tracker — Backend Server
 * All business logic, debt calculations, and minimization algorithms run here.
 */

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ─── In-Memory Store ──────────────────────────────────────────────────────────

const MEMBERS = ["Amit", "Rahul", "Sneha"];

/** @type {Array<{id: string, description: string, amount: number, payer: string, splits: Record<string,number>, createdAt: string}>} */
const expenses = [];

/**
 * Net balance map: balances[creditor][debtor] = amount debtor owes creditor.
 * Positive value means debtor owes creditor that amount.
 * @type {Record<string, Record<string, number>>}
 */
const balances = {};

// Initialise zero balances for all pairs
MEMBERS.forEach((creditor) => {
  balances[creditor] = {};
  MEMBERS.forEach((debtor) => {
    if (creditor !== debtor) balances[creditor][debtor] = 0;
  });
});

// ─── Core Business Logic ─────────────────────────────────────────────────────

/**
 * Proportional Division Processor
 * Given a total amount and a percentage split map, return the share per member.
 * @param {number} total
 * @param {Record<string, number>} percentages  e.g. { Amit: 50, Rahul: 30, Sneha: 20 }
 * @returns {Record<string, number>} shares in currency
 */
function computeShares(total, percentages) {
  const shares = {};
  let sumAssigned = 0;
  const members = Object.keys(percentages);

  members.forEach((member, idx) => {
    if (idx === members.length - 1) {
      // Last member gets the remainder to avoid floating-point drift
      shares[member] = parseFloat((total - sumAssigned).toFixed(2));
    } else {
      const share = parseFloat(((percentages[member] / 100) * total).toFixed(2));
      shares[member] = share;
      sumAssigned += share;
    }
  });

  return shares;
}

/**
 * Update the global balance ledger after a new expense.
 * The payer fronted `total`; each member owes their share to the payer.
 * @param {string} payer
 * @param {Record<string, number>} shares  amount each member owes for this expense
 */
function updateBalances(payer, shares) {
  Object.entries(shares).forEach(([member, share]) => {
    if (member === payer) return; // Payer doesn't owe themselves

    // `member` owes `payer` an additional `share`
    // We store net debt as: balances[creditor][debtor]
    // So balances[payer][member] += share (member owes payer)
    balances[payer][member] = parseFloat(
      (balances[payer][member] + share).toFixed(2)
    );
  });
}

/**
 * Debt Minimisation Algorithm
 *
 * Strategy:
 *  1. Compute net balance for every person (what they're owed minus what they owe).
 *  2. Separate into creditors (positive net) and debtors (negative net).
 *  3. Greedily match the largest debtor with the largest creditor,
 *     settling as much as possible per transaction.
 *
 * This produces the minimum number of transactions needed to settle all debts.
 *
 * @returns {Array<{from: string, to: string, amount: number}>}
 */
function minimizeDebts() {
  // Step 1: Compute net balance per person across all pairwise balances
  const netBalance = {};
  MEMBERS.forEach((m) => (netBalance[m] = 0));

  MEMBERS.forEach((creditor) => {
    MEMBERS.forEach((debtor) => {
      if (creditor === debtor) return;
      const amt = balances[creditor][debtor] || 0;
      if (amt !== 0) {
        netBalance[creditor] += amt;   // creditor is owed this
        netBalance[debtor]   -= amt;   // debtor owes this
      }
    });
  });

  // Step 2: Separate into creditors and debtors
  const creditors = []; // { name, amount }  → amount > 0 means they are owed money
  const debtors   = []; // { name, amount }  → amount < 0 means they owe money

  Object.entries(netBalance).forEach(([name, net]) => {
    const rounded = parseFloat(net.toFixed(2));
    if (rounded > 0)  creditors.push({ name, amount: rounded });
    if (rounded < 0)  debtors.push({ name, amount: Math.abs(rounded) });
  });

  // Step 3: Greedy matching
  const transactions = [];

  // Sort descending so we always tackle the largest amounts first
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor   = debtors[di];

    const settledAmount = parseFloat(
      Math.min(creditor.amount, debtor.amount).toFixed(2)
    );

    if (settledAmount > 0.005) { // ignore penny-rounding noise
      transactions.push({
        from:   debtor.name,
        to:     creditor.name,
        amount: settledAmount,
      });
    }

    creditor.amount = parseFloat((creditor.amount - settledAmount).toFixed(2));
    debtor.amount   = parseFloat((debtor.amount   - settledAmount).toFixed(2));

    if (creditor.amount < 0.005) ci++;
    if (debtor.amount   < 0.005) di++;
  }

  return transactions;
}

/**
 * Build the human-readable settlement sentences for each member.
 * Members with no debts get an "even" sentence.
 * @returns {Array<{member: string, sentences: string[]}>}
 */
function buildSettlementBoard() {
  const transactions = minimizeDebts();

  // Collect sentences per member
  const board = {};
  MEMBERS.forEach((m) => (board[m] = []));

  transactions.forEach(({ from, to, amount }) => {
    board[from].push(`${from} owes ${to} ₹${amount.toFixed(2)}`);
  });

  return MEMBERS.map((member) => ({
    member,
    sentences:
      board[member].length > 0
        ? board[member]
        : [`${member} owes nobody (Even)`],
    isEven: board[member].length === 0,
  }));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** Health check */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", members: MEMBERS });
});

/** Get all expenses */
app.get("/api/expenses", (_req, res) => {
  res.json({ expenses });
});

/** Get current settlement board */
app.get("/api/settlement", (_req, res) => {
  const settlement = buildSettlementBoard();
  const transactions = minimizeDebts();
  res.json({ settlement, transactions });
});

/**
 * POST /api/expenses
 * Body: { description, amount, payer, percentages }
 * percentages: { Amit: 50, Rahul: 30, Sneha: 20 }  must sum to 100
 */
app.post("/api/expenses", (req, res) => {
  const { description, amount, payer, percentages } = req.body;

  // ── Input Validation ──────────────────────────────────────────────────────
  const errors = [];

  if (!description || typeof description !== "string" || description.trim() === "") {
    errors.push("Description is required.");
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be a positive number.");
  }

  if (!MEMBERS.includes(payer)) {
    errors.push(`Payer must be one of: ${MEMBERS.join(", ")}.`);
  }

  if (!percentages || typeof percentages !== "object") {
    errors.push("Percentages must be a valid object.");
  } else {
    const keys = Object.keys(percentages);
    const invalidKeys = keys.filter((k) => !MEMBERS.includes(k));
    if (invalidKeys.length > 0) {
      errors.push(`Unknown members in percentages: ${invalidKeys.join(", ")}.`);
    }

    const total = keys.reduce((sum, k) => sum + (percentages[k] || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      errors.push(`Percentages must sum to 100. Current sum: ${total}.`);
    }

    const negativeKeys = keys.filter((k) => percentages[k] < 0);
    if (negativeKeys.length > 0) {
      errors.push("All percentages must be non-negative.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // ── Business Logic (Server-Side Only) ────────────────────────────────────

  const shares = computeShares(parsedAmount, percentages);
  updateBalances(payer, shares);

  const expense = {
    id: uuidv4(),
    description: description.trim(),
    amount: parsedAmount,
    payer,
    percentages,
    shares,
    createdAt: new Date().toISOString(),
  };

  expenses.push(expense);

  const settlement = buildSettlementBoard();
  const transactions = minimizeDebts();

  return res.status(201).json({
    success: true,
    expense,
    settlement,
    transactions,
  });
});

/** DELETE all expenses and reset balances (for testing/reset) */
app.delete("/api/reset", (_req, res) => {
  expenses.length = 0;
  MEMBERS.forEach((creditor) => {
    MEMBERS.forEach((debtor) => {
      if (creditor !== debtor) balances[creditor][debtor] = 0;
    });
  });
  res.json({ success: true, message: "All expenses and balances have been reset." });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Splitwise-Lite backend running at http://localhost:${PORT}`);
  console.log(`   Members: ${MEMBERS.join(", ")}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
