const fs = require('fs');

const updates = [
  {
    file: 'src/pages/modules/crm/Accounts.tsx',
    subtitle: 'B2B Enterprise Entities',
    fields: `[ 
      { key: 'name', label: 'Company Name', required: true }, 
      { key: 'industry', label: 'Industry Vertical' }, 
      { key: 'website', label: 'Domain' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Account Name', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'industry', label: 'Sector' } 
    ]`
  },
  {
    file: 'src/pages/modules/crm/Forecast.tsx',
    subtitle: 'Revenue Pipeline Predictions',
    fields: `[ 
      { key: 'name', label: 'Forecast Quarter', required: true }, 
      { key: 'target_revenue', label: 'Target Revenue', type: 'number' }, 
      { key: 'confidence', label: 'Confidence %' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Quarter', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'target_revenue', label: 'Target' }, 
      { key: 'confidence', label: 'Confidence' } 
    ]`
  },
  {
    file: 'src/pages/modules/crm/Segments.tsx',
    subtitle: 'Marketing Segmentation Engine',
    fields: `[ 
      { key: 'name', label: 'Segment Tag', required: true }, 
      { key: 'criteria', label: 'Target Audience Profile' }
    ]`,
    columns: `[ 
      { key: 'name', label: 'Segment', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'criteria', label: 'Audience' } 
    ]`
  },
  {
    file: 'src/pages/modules/inventory/StockLevels.tsx',
    subtitle: 'Real-time Stock Positioning',
    fields: `[ 
      { key: 'name', label: 'Item Hash', required: true }, 
      { key: 'warehouse', label: 'Warehouse Code' }, 
      { key: 'available_qty', label: 'On-Hand Level', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Item Hash', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'available_qty', label: 'Level' } 
    ]`
  },
  {
    file: 'src/pages/modules/inventory/StockTransfers.tsx',
    subtitle: 'Internal Warehouse Logistics',
    fields: `[ 
      { key: 'name', label: 'Transfer Reference', required: true }, 
      { key: 'source_warehouse', label: 'From Warehouse' }, 
      { key: 'dest_warehouse', label: 'To Warehouse' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Reference', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'source_warehouse', label: 'Source' }, 
      { key: 'dest_warehouse', label: 'Destination' } 
    ]`
  },
  {
    file: 'src/pages/modules/inventory/BatchTracking.tsx',
    subtitle: 'Expiration & Lot Tracing',
    fields: `[ 
      { key: 'name', label: 'Batch / Lot Code', required: true }, 
      { key: 'expiry_date', label: 'Expiration Horizon', type: 'date' }
    ]`,
    columns: `[ 
      { key: 'name', label: 'Lot Code', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'expiry_date', label: 'Expires' } 
    ]`
  },
  {
    file: 'src/pages/modules/inventory/StockAudits.tsx',
    subtitle: 'Physical Verification Ledger',
    fields: `[ 
      { key: 'name', label: 'Audit Reference', required: true }, 
      { key: 'warehouse', label: 'Location' }, 
      { key: 'reconciliation_status', label: 'Status' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Reference', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'warehouse', label: 'Location' } 
    ]`
  },
  {
    file: 'src/pages/modules/purchase/GoodsReceipts.tsx',
    subtitle: 'Inbound GRN Protocol',
    fields: `[ 
      { key: 'name', label: 'Receipt Reference', required: true }, 
      { key: 'po_reference', label: 'Purchase Order Ref' }, 
      { key: 'supplier_name', label: 'Supplier' }, 
      { key: 'receipt_date', label: 'Date', type: 'date' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'GRN No', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'supplier_name', label: 'Supplier' },
      { key: 'receipt_date', label: 'Receiving Date' }
    ]`
  },
  {
    file: 'src/pages/modules/invoicing/ReceiptVouchers.tsx',
    subtitle: 'Incoming Payment Treasury',
    fields: `[ 
      { key: 'name', label: 'Voucher Serial', required: true }, 
      { key: 'amount', label: 'Tender Amount', type: 'number' }, 
      { key: 'payment_mode', label: 'Tender Medium' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Voucher No', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'amount', label: 'Capital Amount' } 
    ]`
  },
  {
    file: 'src/pages/modules/hrms/Departments.tsx',
    subtitle: 'Organizational Cost Centers',
    fields: `[ 
      { key: 'name', label: 'Department Name', required: true }, 
      { key: 'manager', label: 'HOD / Manager' }, 
      { key: 'cost_center', label: 'Cost Center Code' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Department', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'manager', label: 'Manager' } 
    ]`
  },
  {
    file: 'src/pages/modules/payroll/SalaryStructures.tsx',
    subtitle: 'Compensation Standardizations',
    fields: `[ 
      { key: 'name', label: 'Structure Grade', required: true }, 
      { key: 'base_salary', label: 'Base Compensation', type: 'number' }, 
      { key: 'hra', label: 'HRA (%)', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Grade', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'base_salary', label: 'Base' } 
    ]`
  },
  {
    file: 'src/pages/modules/payroll/RunPayroll.tsx',
    subtitle: 'Execute Bulk Salary Matrix',
    fields: `[ 
      { key: 'name', label: 'Payroll Cycle (e.g. Oct 2026)', required: true }, 
      { key: 'status', label: 'Cycle Status', type: 'select', options: [{label: "Draft Protocol", value: "draft"}, {label: "Processed & Locked", value: "processed"}] } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Cycle', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'status', label: 'Status' } 
    ]`
  },
  {
    file: 'src/pages/modules/hrms/Appraisals.tsx',
    subtitle: 'Performance Review Cycles',
    fields: `[ 
      { key: 'name', label: 'Appraisal Title', required: true }, 
      { key: 'employee_name', label: 'Employee Name' }, 
      { key: 'rating', label: 'Performance Rating (1-5)', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Title', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'employee_name', label: 'Employee' }, 
      { key: 'rating', label: 'Rating' } 
    ]`
  },
  {
    file: 'src/pages/modules/hrms/Claims.tsx',
    subtitle: 'Employee Expense Claims',
    fields: `[ 
      { key: 'name', label: 'Reimbursement Request ID', required: true }, 
      { key: 'employee', label: 'Employee Name' }, 
      { key: 'amount', label: 'Requested Value', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Claim ID', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'employee', label: 'Staff' }, 
      { key: 'amount', label: 'Claim Amount' } 
    ]`
  },
  {
    file: 'src/pages/modules/books/BankReconciliation.tsx',
    subtitle: 'Financial Sync Logs',
    fields: `[ 
      { key: 'name', label: 'Statement Profile', required: true }, 
      { key: 'account', label: 'Bank Account' }, 
      { key: 'closing_balance', label: 'Closing Balance', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Profile', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'closing_balance', label: 'Matched Balance' } 
    ]`
  },
  {
    file: 'src/pages/modules/books/FinancialReports.tsx',
    subtitle: 'P&L, Trail Balance & Balance Sheet Viewers',
    fields: `[ 
      { key: 'name', label: 'Report Snapshot Request', required: true }, 
      { key: 'start_date', label: 'Fiscal Start Range', type: 'date' }, 
      { key: 'end_date', label: 'Fiscal End Range', type: 'date' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Snapshot Name', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> } 
    ]`
  },
  {
    file: 'src/pages/modules/books/TaxConfigurations.tsx',
    subtitle: 'Compliance Tax Slabs',
    fields: `[ 
      { key: 'name', label: 'Tax Profile Name', required: true }, 
      { key: 'percentage', label: 'Tax Rate %', type: 'number' }, 
      { key: 'region', label: 'Jurisdiction / Region' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Profile', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'percentage', label: 'Rate %' } 
    ]`
  },
  {
    file: 'src/pages/modules/settings/FiscalYears.tsx',
    subtitle: 'Global Fiscal Boundaries & Locks',
    fields: `[ 
      { key: 'name', label: 'Fiscal Label (e.g. FY-26)', required: true }, 
      { key: 'start_date', label: 'Start Term', type: 'date' }, 
      { key: 'end_date', label: 'Cut-off Term', type: 'date' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Fiscal Year', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'start_date', label: 'Start' } 
    ]`
  },
  {
    file: 'src/pages/modules/pos/Register.tsx',
    subtitle: 'Cash Drawer Control Logic',
    fields: `[ 
      { key: 'name', label: 'Shift Identifier', required: true }, 
      { key: 'cashier', label: 'Attributed Cashier' }, 
      { key: 'opening_amount', label: 'Drawer Baseline Float', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Shift No', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'cashier', label: 'Operator' } 
    ]`
  },
  {
    file: 'src/pages/modules/pos/POSOrders.tsx',
    subtitle: 'Retail Point-of-Sale Logbook',
    fields: `[ 
      { key: 'name', label: 'Receipt Hash', required: true }, 
      { key: 'register_id', label: 'Register Sequence' }, 
      { key: 'grand_total', label: 'Till Sum', type: 'number' } 
    ]`,
    columns: `[ 
      { key: 'name', label: 'Receipt Hash', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'grand_total', label: 'Checkout Valuation' } 
    ]`
  }
];

updates.forEach(u => {
  if (!fs.existsSync(u.file)) return;
  let content = fs.readFileSync(u.file, 'utf8');
  
  // Replace the subtitle
  content = content.replace(/subtitle="Enterprise Core Logic Ops"/g, `subtitle="${u.subtitle}"`);
  
  // Replace the fields array - this regex looks for const fields = [ ... ];
  content = content.replace(/const fields = \[\s*\{\s*key: "name"[\s\S]*?\];/g, `const fields = ${u.fields};`);
  
  // Replace the columns array
  content = content.replace(/const columns = \[\s*\{\s*key: "name"[\s\S]*?\];/g, `const columns = ${u.columns};`);
  
  fs.writeFileSync(u.file, content);
  console.log(`Updated ${u.file}`);
});
