import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import FileComplaint from './pages/citizen/FileComplaint.jsx';
import TrackComplaint from './pages/citizen/TrackComplaint.jsx';
import Profile from './pages/citizen/Profile.jsx';
import Settings from './pages/citizen/Settings.jsx';
import Support from './pages/citizen/Support.jsx';
import AboutUs from './pages/citizen/AboutUs.jsx';
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import CitizenLayout from './components/CitizenLayout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { Toaster } from 'react-hot-toast';

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}


function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Initializing system..." />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center font-bold text-slate-800">403 - Unauthorized Access</div>} />

        {/* ROOT REDIRECT TO LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* CITIZEN ROUTES */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FileComplaint />} />
          <Route path="track-complaints" element={<TrackComplaint />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Support />} />
          <Route path="about" element={<AboutUs />} />
        </Route>

        {/* OFFICER ROUTES - Department Specific */}
        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OfficerDashboard />} />
          <Route path="public-works" element={<OfficerDashboard />} />
          <Route path="water-supply-and-drainage" element={<OfficerDashboard />} />
          <Route path="electricity-and-safety" element={<OfficerDashboard />} />
          <Route path="sanitation-and-public-health" element={<OfficerDashboard />} />
          <Route path="environment-and-public-property" element={<OfficerDashboard />} />
          <Route path="traffic-and-public-safety" element={<OfficerDashboard />} />
          <Route path="civic-control" element={<OfficerDashboard />} />
          <Route path=":department" element={<OfficerDashboard />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}


export default App;
