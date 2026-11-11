import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
