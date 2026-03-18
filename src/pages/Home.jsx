import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/login");
  };


    return (
        <div className="app-container">
            <h1 className="welcome-text">Bem-vindo ao VOX, para iniciar clique no botão abaixo</h1>
            <br />
            <button onClick={() => {redirectToLogin()}}>Entrar</button>
        </div>
    );
}

export default Home;