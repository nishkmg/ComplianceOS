import { db } from "@complianceos/db";
import type { OpeningBalancesInput } from "@complianceos/shared";
import { createJournalEntry } from "./create-journal-entry";
import type { AccountKind } from "@complianceos/shared";

function balancesMatch(
  balances: Array<{ openingBalance: number }>,
): { valid: boolean; totalDebit: string; totalCredit: string } {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const balance of balances) {
    if (balance.openingBalance === 0) continue;

    // Assets/Expenses: positive = debit, negative = credit
    // Liabilities/Equity/Revenue: positive = credit, negative = debit
    const abs = Math.abs(balance.openingBalance);
    if (balance.openingBalance > 0) {
      totalDebit += abs;
    } else {
      totalCredit += abs;
    }
  }

  const valid = Math.abs(totalDebit - totalCredit) < 0.01;
  return {
    valid,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
  };
}

export async function setupOpeningBalances(
  tenantId: string,
  userId: string,
  fiscalYear: string,
  input: OpeningBalancesInput,
): Promise<{ mode: "fresh_start"; count: number } | { mode: "migration"; entryId: string; totalDebit: string; totalCredit: string }> {
  // 1. Fresh start mode: no balances to create
  if (input.mode === "fresh_start") {
    return { mode: "fresh_start", count: 0 };
  }

  // 2. Migration mode: create opening balance journal entry
  const migrationBalances = input.balances.filter((b) => b.openingBalance !== 0);
  const { valid, totalDebit, totalCredit } = balancesMatch(migrationBalances);

  if (!valid) {
    throw new Error(
      `Opening balances out of balance. Total Debits: ${totalDebit}, Total Credits: ${totalCredit}`,
    );
  }

  // Build journal entry lines from balances
  const lines = migrationBalances.map((balance) => {
    const abs = Math.abs(balance.openingBalance).toFixed(2);
    const isPositive = balance.openingBalance > 0;

    // Determine debit vs credit based on account kind
    let debit = "0.00";
    let credit = "0.00";

    if (balance.kind === "Asset" || balance.kind === "Expense") {
      // Assets and Expenses: positive = debit, negative = credit
      if (isPositive) {
        debit = abs;
      } else {
        credit = abs;
      }
    } else {
      // Liabilities, Equity, Revenue: positive = credit, negative = debit
      if (isPositive) {
        credit = abs;
      } else {
        debit = abs;
      }
    }

    return {
      accountId: balance.accountId,
      debit,
      credit,
      description: `${balance.name} - Opening Balance`,
    };
  });

  // Create the journal entry (auto-posts since it's opening balance)
  const { entryId } = await createJournalEntry(db, tenantId, userId, fiscalYear, {
    date: new Date().toISOString().split("T")[0],
    narration: "Opening Balance Entry",
    referenceType: "opening_balance",
    lines,
  });

  return { mode: "migration", entryId, totalDebit, totalCredit };
}
