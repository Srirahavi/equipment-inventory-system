import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    if (user.role === 'institution') return <Navigate to="/institution-dashboard" replace />;
    if (user.role === 'bmeu') return <Navigate to="/bmeu-dashboard" replace />;
    if (user.role === 'rdhs') return <Navigate to="/rdhs-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
