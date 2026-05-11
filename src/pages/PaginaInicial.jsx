import { useNavigate } from "react-router-dom";
import { FilePlus, ClipboardList, Map, UserCircle, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/PaginaInicial.css";

function PaginaInicial() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const stats = [
    { label: "Chamados Abertos", value: "138", desc: "Aguardando resolução" },
    { label: "Em Andamento", value: "72", desc: "Sendo tratados" },
    { label: "Resolvidos", value: "66", desc: "Problemas solucionados" },
  ];

  const actions = [
    { icon: <FilePlus size={28} />, title: "Novo Chamado", desc: "Reporte um problema na sua cidade agora mesmo.", rota: "/novo-chamado" },
    { icon: <ClipboardList size={28} />, title: "Meus Chamados", desc: "Acompanhe o status de todos os seus reportes.", rota: "/meus-chamados" },
    { icon: <Map size={28} />, title: "Mapa da Cidade", desc: "Veja os problemas reportados na sua região.", rota: "/mapa" },
    { icon: <UserCircle size={28} />, title: "Meu Perfil", desc: "Gerencie seus dados e preferências.", rota: null },
  ];

  return (
    <div className="dashboard">
      <Header variant="dash" />

      <main className="dash-body">
        <div className="dash-welcome">
          <h1>Bem-vindo ao VOX</h1>
          <p>O que você gostaria de fazer hoje?</p>
        </div>

        <div className="dash-stats">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-desc">{s.desc}</span>
            </div>
          ))}
        </div>

        {role === "admin" && (
          <div className="dash-actions" style={{ marginBottom: "1rem" }}>
            <div className="action-card admin-card clickable" onClick={() => navigate("/admin/chamados")}>
              <div className="action-icon"><ShieldCheck size={28} /></div>
              <h3>Central de Chamados</h3>
              <p>Visualize e gerencie todos os chamados da cidade.</p>
            </div>
          </div>
        )}

        <div className="dash-actions">
          {actions.map((a) => (
            <div
              className={`action-card ${a.rota ? "clickable" : "disabled"}`}
              key={a.title}
              onClick={() => a.rota && navigate(a.rota)}
            >
              <div className="action-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              {!a.rota && <span className="action-badge">Em breve</span>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PaginaInicial;
