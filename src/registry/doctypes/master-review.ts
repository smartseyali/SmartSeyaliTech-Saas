import type { DocTypeDef } from "../types";

export const masterReview: DocTypeDef = {
  name: "Product Review",
  tableName: "master_product_reviews",
  module: "masters",
  icon: "MessageSquare",
  listTitle: "Product Reviews",
  formTitle: "Product Review",
  showItems: false,

  defaults: {
    status: "pending",
  },

  headerFields: [
    { key: "item_id", label: "Product", type: "select", required: true, lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "customer_id", label: "Customer", type: "select", required: true, lookupTable: "master_contacts", lookupLabel: "full_name", lookupValue: "id" },
    { key: "rating", label: "Rating (1-5)", type: "number", required: true },
    { key: "comment", label: "Review", type: "text", placeholder: "Share your experience..." },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Hidden", value: "hidden" },
      ],
    },
  ],

  columns: [
    { key: "identity", label: "Product" },
    { key: "narrative", label: "Review" },
    { key: "verification", label: "Status" },
    { key: "status", label: "Status" },
  ],
};
