import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  RoleProvider,
  useRole,
  ROLES,
} from "./context/RoleContext";

import AppLayout from "./components/layout/AppLayout";

import RoleLanding from "./pages/RoleLanding";
import Dashboard from "./pages/Dashboard";

import Instruments from "./pages/Instruments";
import NewInstrument from "./pages/NewInstrument";
import InstrumentDetails from "./pages/InstrumentDetails";

import Evaluations from "./pages/Evaluations";
import NewEvaluation from "./pages/NewEvaluation";
import EvaluationWorkspace from "./pages/EvaluationWorkspace";
import EvaluationReview from "./pages/EvaluationReview";

import TestExecution from "./pages/TestExecution";
import Evidence from "./pages/Evidence";

import ReportPreview from "./pages/ReportPreview";

import Equipment from "./pages/Equipment";
import AuditLog from "./pages/AuditLog";

import NotFound from "./pages/NotFound";


/* ============================================================
   ROLE ENTRY
============================================================ */

function RoleEntry() {
  const { role } = useRole();

  /*
   * The role-selection screen is the entry point only when
   * there is no active role.
   */
  if (role) {
    return <Navigate to="/" replace />;
  }

  return <RoleLanding />;
}


/* ============================================================
   TESTER-ONLY ROUTE GUARD
============================================================ */

function TesterRoute({ children }) {
  const { role } = useRole();

  if (!role) {
    return <Navigate to="/enter" replace />;
  }

  if (role !== ROLES.TESTER) {
    return <Navigate to="/" replace />;
  }

  return children;
}


/* ============================================================
   AUTHORITY-ONLY ROUTE GUARD
============================================================ */

function AuthorityRoute({ children }) {
  const { role } = useRole();

  if (!role) {
    return <Navigate to="/enter" replace />;
  }

  if (role !== ROLES.AUTHORITY) {
    return <Navigate to="/" replace />;
  }

  return children;
}


/* ============================================================
   PROTECTED APPLICATION LAYOUT
============================================================ */

function ProtectedRoutes() {
  const { role } = useRole();

  if (!role) {
    return <Navigate to="/enter" replace />;
  }

  return <AppLayout />;
}


/* ============================================================
   APPLICATION ROUTES
============================================================ */

function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
          LANDING / ROLE SELECTION
      ======================================================= */}

      <Route
        path="/enter"
        element={<RoleEntry />}
      />


      {/* ======================================================
          PROTECTED APPLICATION
      ======================================================= */}

      <Route element={<ProtectedRoutes />}>

        {/* ====================================================
            COMMON
        ===================================================== */}

        <Route
          path="/"
          element={<Dashboard />}
        />


        {/* ====================================================
            TESTER
        ===================================================== */}

        <Route
          path="/instruments"
          element={
            <TesterRoute>
              <Instruments />
            </TesterRoute>
          }
        />

        <Route
          path="/instruments/new"
          element={
            <TesterRoute>
              <NewInstrument />
            </TesterRoute>
          }
        />

        <Route
          path="/instruments/:id"
          element={
            <TesterRoute>
              <InstrumentDetails />
            </TesterRoute>
          }
        />

        <Route
          path="/evaluations/new"
          element={
            <TesterRoute>
              <NewEvaluation />
            </TesterRoute>
          }
        />

        <Route
          path="/evaluations/:id/tests/:testId"
          element={
            <TesterRoute>
              <TestExecution />
            </TesterRoute>
          }
        />

        <Route
          path="/evaluations/:id/evidence"
          element={
            <TesterRoute>
              <Evidence />
            </TesterRoute>
          }
        />


        {/* ====================================================
            EVALUATIONS LIST
            Both roles can view evaluations, but the page
            renders differently according to role.
        ===================================================== */}

        <Route
          path="/evaluations"
          element={<Evaluations />}
        />


        {/* ====================================================
            TESTER EVALUATION WORKSPACE
        ===================================================== */}

        <Route
          path="/evaluations/:id"
          element={<EvaluationWorkspace />}
        />


        {/* ====================================================
            REPORT
            Existing report system remains untouched.
            Both roles may view an evaluation report.
        ===================================================== */}

        <Route
          path="/evaluations/:id/report"
          element={<ReportPreview />}
        />


        {/* ====================================================
            AUTHORITY REVIEW
        ===================================================== */}

        <Route
          path="/evaluations/:id/review"
          element={
            <AuthorityRoute>
              <EvaluationReview />
            </AuthorityRoute>
          }
        />


        {/* ====================================================
            AUTHORITY
        ===================================================== */}

        <Route
          path="/audit-log"
          element={
            <AuthorityRoute>
              <AuditLog />
            </AuthorityRoute>
          }
        />


        {/* ====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Route>

    </Routes>
  );
}


/* ============================================================
   APP
============================================================ */

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </BrowserRouter>
  );
}