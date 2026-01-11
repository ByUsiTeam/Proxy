import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../../utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const userInfo = storage.getUserInfo();
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;