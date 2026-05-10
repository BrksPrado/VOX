import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import "../styles/Breadcrumb.css";

/**
 * Uso: <Breadcrumb itens={[
 *   { label: "Início", rota: "/dashboard" },
 *   { label: "Meus Chamados", rota: "/meus-chamados" },
 *   { label: "Chamado" }, // último item não tem rota (página atual)
 * ]} />
 */
function Breadcrumb({ itens = [] }) {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumb">
      <button className="bc-item bc-link" onClick={() => navigate("/dashboard")}>
        <Home size={13} />
        <span>Início</span>
      </button>

      {itens.map((item, i) => {
        const isUltimo = i === itens.length - 1;
        return (
          <span key={i} className="bc-grupo">
            <ChevronRight size={13} className="bc-sep" />
            {item.rota && !isUltimo ? (
              <button className="bc-item bc-link" onClick={() => navigate(item.rota)}>
                {item.label}
              </button>
            ) : (
              <span className="bc-item bc-atual">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
