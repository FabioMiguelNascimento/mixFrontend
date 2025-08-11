
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      <h1>Página Inicial</h1>
      <nav>
        <ul>
          {isAuthenticated ? (
            <>
              <li>Bem-vindo, {user?.name}!</li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <button onClick={logout}>Sair</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
      <p>Conteúdo público do e-commerce.</p>
    </div>
  );
};

export default Home;
