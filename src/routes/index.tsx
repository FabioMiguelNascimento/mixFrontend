import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import Home from "../pages/Home";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminOrders from "../pages/AdminOrders";
import AdminTags from "../pages/AdminTags";
import AdminCategories from "../pages/AdminCategories";
import AdminProducts from "../pages/AdminProducts";
import AdminUsers from "../pages/AdminUsers";
import Login from "../pages/Login";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();

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
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "tags",
        element: <AdminTags />,
      },
      {
        path: "categories",
        element: <AdminCategories />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
    ],
  },
];
