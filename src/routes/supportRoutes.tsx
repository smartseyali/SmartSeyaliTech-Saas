import { lazy } from "react";

const SupportPage = lazy(() => import("@/pages/modules/support/Support"));

export const supportRoutes = [
  { path: "/apps/support", element: <SupportPage /> },
];
