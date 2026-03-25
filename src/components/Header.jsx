import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/Header.css";

function Header({ variant = "public" }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <img src={logo} alt="VOX" className="header-logo" onClick={() => navigate("/")} />

      {variant === "public" && (
        <button className="btn btn-filled" onClick={() => navigate("/login")}>Entrar</button>
      )}

      {variant === "dash" && (
        <div className="header-user">
          <div className="header-avatar"><UserCircle size={20} /></div>
          Cidadão
          <button className="btn-sair" onClick={() => navigate("/")}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
