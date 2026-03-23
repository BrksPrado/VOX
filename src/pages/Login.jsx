import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function envioDadosLogin(e) {
    e.preventDefault();
    if (email.trim() === "" || senha.trim() === "") return;
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">VOX</div>
        <p className="login-tagline">Sua voz para melhorar a cidade</p>

        <h2>Acessar conta</h2>

        <form onSubmit={envioDadosLogin} className="login-form">
          <div className="input-group">
            <label>E-mail</label>
            <input
              className="login-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <button
            className="login-button"
            type="submit"
            disabled={email.trim() === "" || senha.trim() === ""}
          >
            Entrar
          </button>
        </form>

        <button className="login-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Voltar para o início
          </button>
      </div>
    </div>
  );
}

export default Login;
