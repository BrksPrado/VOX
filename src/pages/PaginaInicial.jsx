import { FilePlus, ClipboardList, Map, UserCircle } from "lucide-react";
import Header from "../components/Header";
import "../styles/PaginaInicial.css";

function PaginaInicial() {
  const stats = [
    { label: "Chamados Abertos", value: "138", desc: "Nenhum chamado ainda" },
    { label: "Em Andamento", value: "72", desc: "Aguardando atualização" },
    { label: "Resolvidos", value: "66", desc: "Problemas solucionados" },
  ];

  const actions = [
    { icon: <FilePlus size={28} />, title: "Novo Chamado", desc: "Reporte um problema na sua cidade agora mesmo." },
    { icon: <ClipboardList size={28} />, title: "Meus Chamados", desc: "Acompanhe o status de todos os seus reportes." },
    { icon: <Map size={28} />, title: "Mapa da Cidade", desc: "Veja os problemas reportados na sua região." },
    { icon: <UserCircle size={28} />, title: "Meu Perfil", desc: "Gerencie seus dados e preferências." },
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

        <div className="dash-actions">
          {actions.map((a) => (
            <div className="action-card" key={a.title}>
              <div className="action-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PaginaInicial;
