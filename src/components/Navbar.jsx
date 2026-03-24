import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="home-nav">
      <img
        src={logo}
        alt="VOX"
        className="home-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", height: "50px" }}
      />
      <button className="btn btn-filled" onClick={() => navigate("/login")}>
        Entrar
      </button>
    </nav>
  );
}

export default Navbar;
