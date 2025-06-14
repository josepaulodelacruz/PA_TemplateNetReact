import { createBrowserRouter, RouterProvider } from "react-router";
import StringRoutes from '~/constants/StringRoutes';
import DashboardLayout from "~/layouts/DasboardLayout";

//Setup
import Setup from "~/pages/Setup";
import User from "~/sub_pages/Setup/User";
import Modules from "~/sub_pages/Setup/Modules";
import ModulesInitialPage from "~/sub_pages/Setup/ModulesInitialPage.jsx";
import ModulesFormPage from "~/sub_pages/Setup/ModulesFormPage";
import Login from "./pages/Auth/Login";
import UserTab from "./sub_pages/Setup/UserTab";
import UserPermission from "./sub_pages/Setup/UserPermission";
import UserHistory from "./sub_pages/Setup/UserHistory";
import Reports from "~/pages/Reports";
import CrashReport from '~/sub_pages/Reports/CrashReport'
import CrashReportView from "./sub_pages/Reports/CrashReportView";

const DASHBOARD_ROUTES = [

  { index: true, element: <div>Dashboard </div> },
  {
    path: StringRoutes.setup,
    Component: Setup,
    children: [
      { path: StringRoutes.users, Component: User },
      {
        path: `${StringRoutes.users_tab}`,
        Component: UserTab,
        children: [

          {
            path: `${StringRoutes.users_permission}/:id?`,
            Component: UserPermission,
          },
          {
            path: `${StringRoutes.users_history}/:id?`,
            Component: UserHistory,
          }
        ]
      },
      {
        path: StringRoutes.modules,
        Component: Modules,
        children: [
          { index: true, Component: ModulesInitialPage },
          { path: `${StringRoutes.modules_form}/:id?`, Component: ModulesFormPage },
        ]
      }
    ]
  },
  {
    path: StringRoutes.report,
    Component: Reports,
    children: [
      { path: StringRoutes.report_crash, Component: CrashReport },
      {
        path: `${StringRoutes.report_crash}/:id?`,
        Component: CrashReportView,
      }
    ]
  }
]

const router = createBrowserRouter([
  {
    path: StringRoutes.dashboard,
    Component: DashboardLayout,
    children: DASHBOARD_ROUTES
  },
  {
    path: StringRoutes.login,
    Component: Login,
  }
],
  {
    future: {
      v7_startTransition: true,
    },
  },
  
)

export default function Router() {
  return <RouterProvider router={router} />
}
