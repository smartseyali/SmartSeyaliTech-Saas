import type { DocTypeDef } from "../types";

export const masterItem: DocTypeDef = {
  name: "Item",
  tableName: "master_items",
  selectQuery: "*, master_categories(name), master_brands(name)",
  module: "masters",
  icon: "Package",
  listTitle: "Product List",
  formTitle: "Product",
  showItems: true,
  itemTitle: "Product Variants",
  itemTableName: "master_product_variants",
  itemForeignKey: "item_id",

  defaults: {
    item_type: "Goods",
    status: "Active",
  },

  tabFields: {
    basic: [
      { key: "item_name", label: "Product Name", type: "text", required: true, placeholder: "Full product name" },
      { key: "item_code", label: "Item Code (SKU)", type: "text", required: true, placeholder: "S1-PROD-24" },
      {
        key: "item_type", label: "Item Type", type: "select",
        options: [
          { value: "Goods", label: "Physical Goods" },
          { value: "Service", label: "Service" },
          { value: "Raw Material", label: "Raw Material" },
          { value: "Course", label: "Course / Program" },
          { value: "Training", label: "Training" },
          { value: "Workshop", label: "Workshop" },
          { value: "Consultation", label: "Consultation" },
          { value: "Subscription", label: "Subscription" },
        ],
      },
      { key: "usage_unit", label: "Unit of Measure", type: "select", lookupTable: "master_uoms", lookupLabel: "name", lookupValue: "name" },
      { key: "category_id", label: "Product Category", type: "select", lookupTable: "master_categories", lookupLabel: "name", lookupValue: "id" },
      { key: "brand_id", label: "Brand", type: "select", lookupTable: "master_brands", lookupLabel: "name", lookupValue: "id" },
      { key: "hsn_sac", label: "HSN / SAC Code", type: "text", placeholder: "Tax code e.g. 8471" },
      {
        key: "status", label: "Status", type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Hidden" },
        ],
      },
      // Image upload
      { key: "image_url", label: "Product Image", type: "image", width: "full" },
      // Short description for listings, cards, search results
      { key: "description", label: "Short Description", type: "textarea", placeholder: "Brief product summary for listings and search results (1-2 lines)", width: "full" },
    ],
    config: [
      { key: "purchase_price", label: "Purchase Cost", type: "currency", placeholder: "0.00" },
      { key: "mrp", label: "MRP (Maximum Retail Price)", type: "currency", placeholder: "0.00" },
      { key: "selling_price", label: "Selling Price", type: "currency", placeholder: "0.00" },
      { key: "gst_rate", label: "GST Tax Rate (%)", type: "percentage", placeholder: "18" },
      { key: "discount_eligible", label: "Allow Discounts?", type: "checkbox" },
      { key: "tax_group_id", label: "Tax Configuration", type: "select", lookupTable: "master_taxes", lookupLabel: "tax_name", lookupValue: "id" },
    ],
    mapping: [
      { key: "is_live", label: "Show on Website / Store", type: "checkbox" },
      { key: "is_published", label: "Published on Website", type: "checkbox" },
      { key: "featured", label: "Pattikadai Special", type: "checkbox" },
      { key: "is_best_seller", label: "Best Selling", type: "checkbox" },
      { key: "is_combo", label: "Special Combo", type: "checkbox" },
      { key: "delivery_mode", label: "Delivery Mode", type: "select", options: [
        { value: "online", label: "Online" },
        { value: "offline", label: "Offline / In-person" },
        { value: "hybrid", label: "Hybrid" },
        { value: "self-paced", label: "Self-paced" },
      ]},
      { key: "duration_value", label: "Duration", type: "number" },
      { key: "duration_unit", label: "Duration Unit", type: "select", options: [
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
        { value: "weeks", label: "Weeks" },
        { value: "months", label: "Months" },
        { value: "years", label: "Years" },
      ]},
      { key: "level", label: "Level", type: "select", options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ]},
      { key: "max_capacity", label: "Max Capacity", type: "number" },
      { key: "eligibility", label: "Eligibility / Requirements", type: "textarea" },
      { key: "brochure_url", label: "Brochure / Attachment URL", type: "text" },
      { key: "web_title", label: "SEO Title", type: "text", placeholder: "Page title for search engines" },
      { key: "seo_description", label: "Meta Description", type: "textarea", placeholder: "SEO description (150-160 chars)", width: "full" },
      { key: "long_description", label: "Detailed Description", type: "textarea", placeholder: "Full description for website display", width: "full" },
      { key: "weight_kg", label: "Weight (Kg)", type: "number" },
    ],
    audit: [
      { key: "default_warehouse_id", label: "Default Warehouse", type: "select", lookupTable: "warehouses", lookupLabel: "name", lookupValue: "id" },
      { key: "reorder_level", label: "Low Stock Alert Level", type: "number", placeholder: "Threshold" },
      { key: "min_stock", label: "Minimum Buffer Stock", type: "number" },
      { key: "max_stock", label: "Maximum Stock Capacity", type: "number" },
      { key: "current_stock", label: "Current Stock", type: "number", placeholder: "0" },
    ],
  },

  itemFields: [
    { key: "image_url", label: "Image", type: "image" },
    { key: "name", label: "Variant Label", type: "text", required: true, placeholder: "e.g. Thokku 250g" },
    { key: "sku", label: "SKU Code", type: "text" },
    { key: "uom", label: "UOM", type: "select", lookupTable: "master_uoms", lookupLabel: "name", lookupValue: "name" },
    { key: "color", label: "Color", type: "text", placeholder: "e.g. Red" },
    { key: "size", label: "Size", type: "text", placeholder: "e.g. 250g / XL" },
    { key: "selling_price", label: "Selling Price", type: "currency", placeholder: "0.00" },
    { key: "mrp", label: "MRP", type: "currency", placeholder: "0.00" },
    { key: "is_in_stock", label: "In Stock", type: "checkbox" },
    { key: "is_default", label: "Default", type: "checkbox" },
  ],

  columns: [
    { key: "item_code", label: "SKU / Code", className: "font-semibold text-blue-600" },
    { key: "item_name", label: "Product Name" },
    { key: "item_type", label: "Type" },
    { key: "category_id", label: "Category" },
    { key: "selling_price", label: "Selling Price" },
    { key: "gst_rate", label: "GST %" },
    { key: "status", label: "Status" },
  ],
};
