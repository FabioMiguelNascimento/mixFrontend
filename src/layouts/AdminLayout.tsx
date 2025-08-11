import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

interface AdminLayoutProps {
  allowedRoles?: UserRole[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER] }) => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`admin-layout ${!isSidebarExpanded ? 'admin-layout--sidebar-collapsed' : ''}`}>
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;