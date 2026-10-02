import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Navbar } from '../components/Layout/Navbar';
import { PageLayout } from '../components/Layout/PageLayout';

// Pages
import { RoleSelect } from '../pages/RoleSelect';
import { UserDashboard } from '../pages/user/UserDashboard';
import { LocationPickerPage } from '../pages/user/LocationPickerPage';
import { ComplaintPage } from '../pages/user/ComplaintPage';
import { FacilityPage } from '../pages/user/FacilityPage';
import { StatusPage } from '../pages/user/StatusPage';
import { LeaderboardPage } from '../pages/user/LeaderboardPage';
import { PointsPage } from '../pages/user/PointsPage';
import { RedemptionPage } from '../pages/user/RedemptionPage';
import { WasteScannerPage } from '../pages/user/WasteScannerPage';
import { CollectorDashboard } from '../pages/collector/CollectorDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAppContext();
  if (!role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { role } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Show Navbar only when logged in */}
      {role && <Navbar />}

      <Routes>
        {/* Role selection (landing) */}
        <Route
          path="/"
          element={role ? <Navigate to={role === 'collector' ? '/collector' : '/user'} replace /> : <RoleSelect />}
        />

        {/* User routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <PageLayout><UserDashboard /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/map"
          element={
            <ProtectedRoute>
              <PageLayout><LocationPickerPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/complaint"
          element={
            <ProtectedRoute>
              <PageLayout><ComplaintPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/scan"
          element={
            <ProtectedRoute>
              <PageLayout><WasteScannerPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/facility"
          element={
            <ProtectedRoute>
              <PageLayout><FacilityPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/status"
          element={
            <ProtectedRoute>
              <PageLayout><StatusPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/leaderboard"
          element={
            <ProtectedRoute>
              <PageLayout><LeaderboardPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/points"
          element={
            <ProtectedRoute>
              <PageLayout><PointsPage /></PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/redeem"
          element={
            <ProtectedRoute>
              <PageLayout><RedemptionPage /></PageLayout>
            </ProtectedRoute>
          }
        />

        {/* Collector routes */}
        <Route
          path="/collector"
          element={
            <ProtectedRoute>
              <PageLayout><CollectorDashboard /></PageLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
