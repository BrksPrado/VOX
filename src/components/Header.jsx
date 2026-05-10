import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/Header.css";

function Header({ variant = "public" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "usuarios", user.uid)).then((snap) => {
      if (snap.exists()) {
        // Pega só o primeiro nome
        const nomeCompleto = snap.data().nome ?? "";
        setNomeUsuario(nomeCompleto.split(" ")[0]);
      }
    });
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const nomeExibido = nomeUsuario || user?.email?.split("@")[0] || "Cidadão";

  return (
    <header className="header">
      <img src={logo} alt="VOX" className="header-logo" onClick={() => navigate("/")} />

      {variant === "public" && (
        <button className="btn btn-filled" onClick={() => navigate("/login")}>Entrar</button>
      )}

      {variant === "dash" && (
        <div className="header-user">
          <div className="header-avatar"><UserCircle size={20} /></div>
          {nomeExibido}
          <button className="btn-sair" onClick={handleLogout}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
