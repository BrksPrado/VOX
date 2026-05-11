import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, role } = useAuth();

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>Carregando...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

export default AdminRoute;
