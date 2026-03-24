import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SecretDetail } from "./pages/SecretDetail";
import { AuditTrail } from "./pages/AuditTrail";
import { Shared } from "./pages/Shared";
import { UserManagement } from "./pages/UserManagement";
import { SecuritySettings } from "./pages/SecuritySettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "secret/:id", Component: SecretDetail },
      { path: "shared", Component: Shared },
      { path: "audit", Component: AuditTrail },
      { path: "users", Component: UserManagement },
      { path: "settings", Component: SecuritySettings },
    ],
  },
]);
