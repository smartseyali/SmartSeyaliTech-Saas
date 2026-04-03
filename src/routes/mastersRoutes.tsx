import { lazy } from "react";

const MasterDashboard = lazy(() => import("@/pages/modules/masters/MasterDashboard"));

export const mastersRoutes = [
    { path: "/apps/masters/*", element: <MasterDashboard /> },
];
