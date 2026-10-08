import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import InstitutionDashboard from './pages/InstitutionDashboard';
import AddEquipment from './pages/AddEquipment';
import UploadEquipment from './pages/UploadEquipment';
import BMEUDashboard from './pages/BMEUDashboard';
import RDHSDashboard from './pages/RDHSDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Institution routes */}
        <Route
          path="/institution-dashboard"
          element={
            <ProtectedRoute allowedRoles={['institution']}>
              <InstitutionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-equipment"
          element={
            <ProtectedRoute allowedRoles={['institution']}>
              <AddEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-equipment"
          element={
            <ProtectedRoute allowedRoles={['institution']}>
              <UploadEquipment />
            </ProtectedRoute>
          }
        />

        {/* BMEU route */}
        <Route
          path="/bmeu-dashboard"
          element={
            <ProtectedRoute allowedRoles={['bmeu']}>
              <BMEUDashboard />
            </ProtectedRoute>
          }
        />

        {/* RDHS route */}
        <Route
          path="/rdhs-dashboard"
          element={
            <ProtectedRoute allowedRoles={['rdhs']}>
              <RDHSDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
