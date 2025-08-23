import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileCircle from './ProfileCircle';
import SidebarLink from './SidebarLink';

import {
  MdDashboard,
  MdShoppingCart,
  MdLabel,
  MdCategory,
  MdMenu,
  MdPerson,
  MdProductionQuantityLimits,
} from 'react-icons/md';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const { user } = useAuth();

  const handleToggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleProfileClick = () => {
    alert('Abrir modal de perfil do usuário');
  };

  const links = [
    { to: '/admin/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
    { to: '/admin/orders', icon: <MdShoppingCart />, text: 'Pedidos' },
    { to: '/admin/tags', icon: <MdLabel />, text: 'Tags' },
    { to: '/admin/categories', icon: <MdCategory />, text: 'Categorias' },
    { to: '/admin/products', icon: <MdProductionQuantityLimits />, text: 'Produtos' },
    { to: '/admin/users', icon: <MdPerson />, text: 'Usuários' },
  ];

  const renderLinks = () => {
    return links.map((link) => (
      <li key={link.to}>
        <SidebarLink to={link.to} icon={link.icon} text={isExpanded ? link.text : undefined} />
      </li>
    ));
  }

  return (
    <aside className={`sidebar ${!isExpanded ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-user-profile-section" onClick={handleProfileClick} >
          <ProfileCircle name={user?.name || ''} onClick={handleProfileClick} />
          {isExpanded && (
          <span className="sidebar-user-fullname">{user?.name || 'Visitante'}</span>
          )}
        </div>
      </div>

      <nav className="sidebar-body">
        <ul>
          {renderLinks()}
        </ul>
      </nav>

      <div className="sidebar-functions">
        <Button variant="secondary" onClick={handleToggleSidebar} size="sm">
          <MdMenu />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
