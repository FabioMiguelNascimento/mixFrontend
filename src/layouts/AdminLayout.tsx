import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

interface AdminLayoutProps {
  allowedRoles?: UserRole[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
