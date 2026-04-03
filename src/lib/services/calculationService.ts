/**
 * Transaction Calculation Service
 *
 * Centralized calculation engine for all transactional documents
 * (Sales Orders, Invoices, Purchase Orders, Bills, etc.)
 *
 * Replaces duplicated calculation logic across module pages.
 */

export interface CalculatedItem {
  [key: string]: any;
  amount: number;
  sort_order: number;
}

export interface TransactionTotals {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  total_qty: number;
}

export interface CalculationResult {
  items: CalculatedItem[];
  totals: TransactionTotals;
}

/**
 * Calculate line item amounts and document totals.
 *
 * Formula per row:
 *   base       = quantity × unit_price
 *   discount   = base × (discount_pct / 100)
 *   taxable    = base - discount
 *   tax        = taxable × (tax_rate / 100)
 *   amount     = taxable + tax
 *
 * Grand Total = subtotal - total_discount + total_tax
 */
export function calculateTransaction(
  items: Record<string, any>[],
  config?: {
    qtyField?: string;
    rateField?: string;
    taxField?: string;
    discountField?: string;
    amountField?: string;
  }
): CalculationResult {
  const qtyKey = config?.qtyField || "quantity";
  const rateKey = config?.rateField || "unit_price";
  const taxKey = config?.taxField || "tax_rate";
  const discKey = config?.discountField || "discount_pct";
  const amtKey = config?.amountField || "amount";

  let subtotal = 0;
  let tax_amount = 0;
  let discount_amount = 0;
  let total_qty = 0;

  const calculatedItems = items.map((item, idx) => {
    const qty = Number(item[qtyKey] || 0);
    const rate = Number(item[rateKey] || 0);
    const taxPct = Number(item[taxKey] || 0);
    const discPct = Number(item[discKey] || 0);

    const base = qty * rate;
    const discAmt = (base * discPct) / 100;
    const taxable = base - discAmt;
    const taxAmt = (taxable * taxPct) / 100;
    const rowAmount = taxable + taxAmt;

    subtotal += base;
    discount_amount += discAmt;
    tax_amount += taxAmt;
    total_qty += qty;

    return {
      ...item,
      amount: rowAmount,
      [amtKey]: rowAmount,
      sort_order: idx + 1,
    };
  });

  return {
    items: calculatedItems,
    totals: {
      subtotal,
      tax_amount,
      discount_amount,
      grand_total: subtotal - discount_amount + tax_amount,
      total_qty,
    },
  };
}

/**
 * Format a number as Indian Rupee currency.
 */
export function formatINR(n: number | null | undefined): string {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate a reference number with prefix and unique sequence.
 * e.g. generateRefNo("SO") → "SO-2026-A3K7X"
 */
export function generateRefNo(prefix: string): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${prefix}-${year}-${seq}`;
}
