import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'developer' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const userRole = user.role.toLowerCase();
    
    // Admin can access everything
    if (userRole === 'admin') {
      return <>{children}</>;
    }

    // Check specific role requirements
    if (requiredRole === 'developer' && userRole !== 'developer') {
      return <Navigate to="/" replace />;
    }

    if (requiredRole === 'admin' && userRole !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;