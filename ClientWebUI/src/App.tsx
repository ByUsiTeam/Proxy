import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Center from './pages/Center/Center';
import Port from './pages/Port/Port';
import Domain from './pages/Domain/Domain';
import AutoProxy from './pages/AutoProxy/AutoProxy';
import Log from './pages/Log/Log';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* 受保护的路由 */}
        <Route path="/center" element={
          <ProtectedRoute>
            <AppLayout>
              <Center />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/port" element={
          <ProtectedRoute>
            <AppLayout>
              <Port />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/domain" element={
          <ProtectedRoute>
            <AppLayout>
              <Domain />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autoproxy" element={
          <ProtectedRoute>
            <AppLayout>
              <AutoProxy />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/log" element={
          <ProtectedRoute>
            <AppLayout>
              <Log />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;