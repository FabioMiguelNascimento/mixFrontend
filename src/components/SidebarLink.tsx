import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

interface SidebarLinkProps extends LinkProps {
  icon: React.ReactNode;
  text?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, text, to, ...rest }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      {...rest}
    >
      <span className="sidebar-link__icon">{icon}</span>
      {text && <span className="sidebar-link__text">{text}</span>}
    </NavLink>
  );
};

export default SidebarLink;
