import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import logo from "../assets/logo.png";

function DashHeader() {
  const navigate = useNavigate();

  return (
    <header className="dash-header">
      <img src={logo} alt="VOX" className="dash-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", height: "40px" }} />
      <div className="dash-user">
        <div className="dash-avatar"><UserCircle size={20} /></div>
        Cidadão
        <button className="btn-sair" onClick={() => navigate("/")}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  );
}

export default DashHeader;
