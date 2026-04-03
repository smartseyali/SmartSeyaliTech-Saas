import type { DocTypeDef } from "../types";

/**
 * StockLevels.tsx is a read-only aggregated view (no ERPEntryForm).
 * It queries stock_levels joined with products & warehouses.
 * This doctype captures the list-view metadata only.
 */
export const stockLevel: DocTypeDef = {
  name: "Stock Level",
  tableName: "stock_levels",
  module: "inventory",
  icon: "BarChart3",
  listTitle: "Current Stock Levels",
  formTitle: "Stock Level",
  showItems: false,

  columns: [
    { key: "product_name", label: "Product", className: "font-bold text-slate-900" },
    { key: "variant", label: "Variant" },
    { key: "warehouse", label: "Warehouse" },
    { key: "on_hand_qty", label: "On Hand", className: "text-right font-bold" },
    { key: "reserved_qty", label: "Reserved", className: "text-right text-slate-500" },
    { key: "status", label: "Level Status" },
  ],
};
