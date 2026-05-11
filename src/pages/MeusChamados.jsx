import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FilePlus, ChevronRight, Clock, CheckCircle2, Loader2, AlertCircle, XCircle } from "lucide-react";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import "../styles/MeusChamados.css";

const STATUS_CONFIG = {
  "Aberto":       { cor: "status-aberto",      icone: <AlertCircle size={14} /> },
  "Em Andamento": { cor: "status-andamento",   icone: <Loader2 size={14} /> },
  "Resolvido":    { cor: "status-resolvido",   icone: <CheckCircle2 size={14} /> },
  "Recusado":     { cor: "status-recusado",    icone: <XCircle size={14} /> },
};

function formatarData(timestamp) {
  if (!timestamp) return "—";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function MeusChamados() {
  const navigate = useNavigate();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarChamados() {
      try {
        const q = query(
          collection(db, "chamados"),
          where("id_usuario", "==", auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        const lista = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.criadoEm?.toDate?.() ?? new Date(0);
            const tb = b.criadoEm?.toDate?.() ?? new Date(0);
            return tb - ta; // mais recente primeiro
          });
        setChamados(lista);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar chamados.");
      } finally {
        setCarregando(false);
      }
    }
    buscarChamados();
  }, []);

  return (
    <div className="meus-chamados-page">
      <Header variant="dash" />

      <main className="meus-chamados-body">
        <Breadcrumb itens={[{ label: "Meus Chamados" }]} />
        <div className="meus-chamados-header">
          <div>
            <h1>Meus Chamados</h1>
            <p>Acompanhe o status de todas as suas solicitações</p>
          </div>
          <button className="btn-novo" onClick={() => navigate("/novo-chamado")}>
            <FilePlus size={17} /> Novo Chamado
          </button>
        </div>

        {carregando && (
          <div className="chamados-estado">
            <Loader2 size={32} className="spin" />
            <p>Carregando chamados...</p>
          </div>
        )}

        {erro && (
          <div className="chamados-estado erro">
            <AlertCircle size={32} />
            <p>{erro}</p>
          </div>
        )}

        {!carregando && !erro && chamados.length === 0 && (
          <div className="chamados-vazio">
            <FilePlus size={48} className="vazio-icone" />
            <h3>Nenhum chamado ainda</h3>
            <p>Reporte um problema na sua cidade agora mesmo.</p>
          </div>
        )}

        {!carregando && chamados.length > 0 && (
          <div className="chamados-lista">
            {chamados.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["Aberto"];
              return (
                <div
                  key={c.id}
                  className="chamado-item"
                  onClick={() => navigate(`/chamado/${c.id}`)}
                >
                  <div className="chamado-item-numero">#{i + 1}</div>

                  <div className="chamado-item-info">
                    <p className="chamado-item-desc">{c.descricao}</p>
                    <div className="chamado-item-meta">
                      <span className="chamado-item-local">
                        {c.localizacao?.length > 60
                          ? c.localizacao.slice(0, 60) + "..."
                          : c.localizacao}
                      </span>
                      <span className="chamado-item-data">
                        <Clock size={12} /> {formatarData(c.criadoEm)}
                      </span>
                    </div>
                  </div>

                  <div className="chamado-item-direita">
                    <span className={`chamado-status ${cfg.cor}`}>
                      {cfg.icone} {c.status}
                    </span>
                    {c.midia?.length > 0 && (
                      <span className="chamado-midia-badge">
                        {c.midia.length} midia{c.midia.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <ChevronRight size={18} className="chamado-seta" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MeusChamados;
