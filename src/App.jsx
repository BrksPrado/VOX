import "./App.css";
import React, { useState } from "react";
import Login from "./components/Login";
import PaginaInicial from "./components/PaginaInicial";

function App() {
  const [logado, setLogado] = useState(false);

  return (
    <div>
      {logado ? (<PaginaInicial />) : (<Login onLogin={() => setLogado(true)} /> )}
    </div>
  );
}

export default App;