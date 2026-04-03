import { lazy } from "react";

const FinanceDashboard = lazy(() => import("@/pages/modules/finance/FinanceDashboard"));
const JournalEntries = lazy(() => import("@/pages/modules/finance/JournalEntries"));
const GeneralLedger = lazy(() => import("@/pages/modules/finance/GeneralLedger"));
const TrialBalance = lazy(() => import("@/pages/modules/finance/TrialBalance"));
const ProfitLoss = lazy(() => import("@/pages/modules/finance/ProfitLoss"));
const BalanceSheet = lazy(() => import("@/pages/modules/finance/BalanceSheet"));
const BankAccounts = lazy(() => import("@/pages/modules/finance/BankAccounts"));
const BankReconciliation = lazy(() => import("@/pages/modules/finance/BankReconciliation"));
const TaxConfiguration = lazy(() => import("@/pages/modules/finance/TaxConfiguration"));
const FinanceChartOfAccounts = lazy(() => import("@/pages/modules/masters/ChartOfAccounts"));

export const financeRoutes = [
    { path: "/apps/finance", element: <FinanceDashboard /> },
    { path: "/apps/finance/journal-entries", element: <JournalEntries /> },
    { path: "/apps/finance/ledger", element: <GeneralLedger /> },
    { path: "/apps/finance/trial-balance", element: <TrialBalance /> },
    { path: "/apps/finance/profit-loss", element: <ProfitLoss /> },
    { path: "/apps/finance/balance-sheet", element: <BalanceSheet /> },
    { path: "/apps/finance/bank-accounts", element: <BankAccounts /> },
    { path: "/apps/finance/reconciliation", element: <BankReconciliation /> },
    { path: "/apps/finance/tax-config", element: <TaxConfiguration /> },
    { path: "/apps/finance/coa", element: <FinanceChartOfAccounts /> },
];
