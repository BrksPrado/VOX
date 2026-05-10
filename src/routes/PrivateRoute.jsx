import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user } = useAuth();

  // Ainda verificando sessão — não redireciona antes de saber
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--mut)", fontSize: "0.9rem" }}>Carregando...</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
