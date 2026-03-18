import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function envioDadosLogin(parametro) {
    parametro.preventDefault();
    
    if (email.trim() === "" || senha.trim() === "") {
      return;
    }
    
    navigate("/dashboard");
  }

  return (
    <div className="login-container">
      <h2 className="login-title">LOGIN VOX</h2>

      <form onSubmit={envioDadosLogin} className="login-form">
        <input className="login-input" type="email" placeholder="Email" value={email} onChange={(parametro) => setEmail(parametro.target.value)} />
        <input className="login-input" type="password" placeholder="Senha" value={senha} onChange={(parametro) => setSenha(parametro.target.value)} />

        <button className="login-button" type="submit" disabled={email.trim() === "" || senha.trim() === ""}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;