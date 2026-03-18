import "./styles/App.css";
import React, { useState } from "react";
import Login from "./pages/Login";
import PaginaInicial from "./pages/PaginaInicial";

function App() {
  const [logado, setLogado] = useState(false);

  return (
    <div>
      {logado ? (<PaginaInicial />) : (<Login onLogin={() => setLogado(true)} /> )}
    </div>
  );
}

export default App;