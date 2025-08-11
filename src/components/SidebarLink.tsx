import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface SidebarLinkProps extends LinkProps {
  icon: React.ReactNode;
  text?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, text, to, ...rest }) => {
  return (
    <Link to={to} className="sidebar-link" {...rest}>
      <span className="sidebar-link__icon">{icon}</span>
      {text && <span className="sidebar-link__text">{text}</span>}
    </Link>
  );
};

export default SidebarLink;
