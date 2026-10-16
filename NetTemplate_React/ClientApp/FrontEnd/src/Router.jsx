import { createBrowserRouter, RouterProvider } from "react-router";
import StringRoutes from '~/Constants/StringRoutes';
import DashboardLayout from "~/layouts/DasboardLayout";
import Dashboard from "~/pages/Dashboard";

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
import FeedbackForms from "./Pages/FeedbackForms";
import Reservation from "./Pages/FeedbackForms/Reservation";
import LoanProcessing from "./Pages/FeedbackForms/LoanProcessing";
import Turnover from "./Pages/FeedbackForms/Turnover";
import UserGuidePage from "./Pages/FeedbackForms/UserGuidePage";
import RequirePermission from "~/components/RequirePermission";
import ModuleNames from "~/Constants/ModuleNames";
import DocumentSetup from "./Pages/Setup/DocumentSetup";
import Document from "./Pages/Setup/DocumentSetup/Document";
import DocumentCategory from "./Pages/Setup/DocumentSetup/DocumentCategory";
import Matrix from "./Pages/Setup/DocumentSetup/Matrix";

const DASHBOARD_ROUTES = [

  { index: true, Component: Dashboard},
  {
    element: <RequirePermission module={ModuleNames.homeBuyerFeedback} />,
    children: [
      { path: StringRoutes.feedback, Component: FeedbackForms },
      { path: StringRoutes.feedback_reservation, Component: Reservation },
      { path: StringRoutes.feedback_loan_processing, Component: LoanProcessing },
      { path: StringRoutes.feedback_turnover, Component: Turnover },
      { path: StringRoutes.feedback_user_guide, Component: UserGuidePage },
    ]
  },
  {
    path: StringRoutes.setup,
    Component: Setup,
    children: [
      {
        element: <RequirePermission module={ModuleNames.users} />,
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
        ]
      },
      {
        element: <RequirePermission module={ModuleNames.modules} />,
        children: [
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
        element: <RequirePermission module={ModuleNames.modules} />,
        children: [
          {
            path: StringRoutes.buyers_document,
            Component: DocumentSetup,
            children: [
              {
                path: StringRoutes.matrix,
                Component: Matrix
              },
              {
                path: StringRoutes.document,
                Component: Document
              },
              {
                path: StringRoutes.category,
                Component: DocumentCategory 
              }

            ]
          }
        ],
      }
    ]
  },
  {
    path: StringRoutes.report,
    Component: Reports,
    children: [
      {
        element: <RequirePermission module={ModuleNames.crashReports} />,
        children: [
          { path: StringRoutes.report_crash, Component: CrashReport },
          {
            path: `${StringRoutes.report_crash}/:id?`,
            Component: CrashReportView,
          }
        ]
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
    basename: '/ECastV2'
  },
  
)

export default function Router() {
  return <RouterProvider router={router} />
}
