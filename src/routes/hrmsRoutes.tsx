import { lazy } from "react";

const HRMSDashboard = lazy(() => import("@/pages/modules/hrms/HRMSDashboard"));
const HRMSRegistry = lazy(() => import("@/pages/modules/hrms/Employees"));
const HRMSInduction = lazy(() => import("@/pages/modules/hrms/Induction"));
const Attendance = lazy(() => import("@/pages/modules/hrms/Attendance"));
const LeaveManagement = lazy(() => import("@/pages/modules/hrms/LeaveManagement"));
const Departments = lazy(() => import("@/pages/modules/hrms/Departments"));
const EmployeeClaims = lazy(() => import("@/pages/modules/hrms/Claims"));
const EmployeeAppraisals = lazy(() => import("@/pages/modules/hrms/Appraisals"));
const Payroll = lazy(() => import("@/pages/modules/hrms/Payroll"));

export const hrmsRoutes = [
    { path: "/apps/hrms", element: <HRMSDashboard /> },
    { path: "/apps/hrms/departments", element: <Departments /> },
    { path: "/apps/hrms/employees", element: <HRMSRegistry /> },
    { path: "/apps/hrms/induction", element: <HRMSInduction /> },
    { path: "/apps/hrms/attendance", element: <Attendance /> },
    { path: "/apps/hrms/leaves", element: <LeaveManagement /> },
    { path: "/apps/hrms/claims", element: <EmployeeClaims /> },
    { path: "/apps/hrms/appraisals", element: <EmployeeAppraisals /> },
    { path: "/apps/hrms/payroll", element: <Payroll /> },
];
