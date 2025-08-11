
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Login from "../pages/Login";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();

  // Papéis que podem acessar o dashboard
  const allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER];

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ],
  },
];
