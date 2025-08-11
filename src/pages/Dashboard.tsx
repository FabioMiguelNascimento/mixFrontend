
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo à área protegida, {user?.name}!</p>
      <p>Seu papel é: <strong>{user?.role}</strong></p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};

export default Dashboard;
