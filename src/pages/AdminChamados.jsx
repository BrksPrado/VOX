import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { AlertCircle, CheckCircle2, Loader2, Clock, XCircle, Check, ChevronDown, ChevronUp, MapPin, Image, PlayCircle } from "lucide-react";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import "../styles/AdminChamados.css";

const STATUS_CONFIG = {
  "Aberto":       { cor: "status-aberto",    icone: <AlertCircle size={14} /> },
  "Em Andamento": { cor: "status-andamento", icone: <Loader2 size={14} /> },
  "Resolvido":    { cor: "status-resolvido", icone: <CheckCircle2 size={14} /> },
  "Recusado":     { cor: "status-recusado",  icone: <XCircle size={14} /> },
};

function formatarData(timestamp) {
  if (!timestamp) return "—";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function AdminChamados() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [midiaAtiva, setMidiaAtiva] = useState(null);

  useEffect(() => {
    async function buscar() {
      try {
        const snap = await getDocs(query(collection(db, "chamados"), orderBy("criadoEm", "desc")));
        setChamados(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar chamados.");
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  async function atualizarStatus(id, novoStatus) {
    setAtualizando(id + novoStatus);
    try {
      await updateDoc(doc(db, "chamados", id), { status: novoStatus });
      setChamados((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar chamado.");
    } finally {
      setAtualizando(null);
    }
  }

  function toggleExpandido(id) {
    setExpandido((prev) => (prev === id ? null : id));
  }

  const finalizado = (status) => status === "Resolvido" || status === "Recusado";

  return (
    <div className="admin-page">
      <Header variant="dash" />
      <main className="admin-body">
        <Breadcrumb itens={[{ label: "Admin" }, { label: "Chamados" }]} />
        <div className="admin-header">
          <div>
            <h1>Central de Chamados</h1>
            <p>Gerencie todos os chamados enviados pelos cidadãos</p>
          </div>
          <span className="admin-badge">Administrador</span>
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
          <div className="chamados-estado">
            <p>Nenhum chamado encontrado.</p>
          </div>
        )}

        {!carregando && chamados.length > 0 && (
          <div className="admin-lista">
            {chamados.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["Aberto"];
              const aberto = expandido === c.id;
              return (
                <div key={c.id} className={`admin-item-wrap ${aberto ? "aberto" : ""}`}>

                  {/* ── Linha principal ── */}
                  <div className="admin-item">
                    <div className="admin-item-numero">#{i + 1}</div>

                    <div className="admin-item-info" onClick={() => toggleExpandido(c.id)} style={{ cursor: "pointer" }}>
                      <p className="admin-item-desc">{c.descricao}</p>
                      <div className="admin-item-meta">
                        <span className="admin-item-local">
                          {c.localizacao?.length > 60 ? c.localizacao.slice(0, 60) + "..." : c.localizacao}
                        </span>
                        <span className="admin-item-data">
                          <Clock size={12} /> {formatarData(c.criadoEm)}
                        </span>
                        {c.midia?.length > 0 && (
                          <span className="admin-item-midia-badge">
                            <Image size={12} /> {c.midia.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-item-direita">
                      <span className={`chamado-status ${cfg.cor}`}>
                        {cfg.icone} {c.status}
                      </span>

                      <div className="admin-btns">
                        <button
                          className="btn-andamento"
                          onClick={() => atualizarStatus(c.id, "Em Andamento")}
                          disabled={finalizado(c.status) || c.status === "Em Andamento" || atualizando === c.id + "Em Andamento"}
                        >
                          {atualizando === c.id + "Em Andamento" ? <Loader2 size={13} className="spin" /> : <Loader2 size={13} />}
                          Andamento
                        </button>
                        <button
                          className="btn-resolver"
                          onClick={() => atualizarStatus(c.id, "Resolvido")}
                          disabled={finalizado(c.status) || atualizando === c.id + "Resolvido"}
                        >
                          {atualizando === c.id + "Resolvido" ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                          Resolver
                        </button>
                        <button
                          className="btn-recusar"
                          onClick={() => atualizarStatus(c.id, "Recusado")}
                          disabled={finalizado(c.status) || atualizando === c.id + "Recusado"}
                        >
                          {atualizando === c.id + "Recusado" ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}
                          Recusar
                        </button>
                      </div>

                      <button className="btn-expandir" onClick={() => toggleExpandido(c.id)}>
                        {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {aberto ? "Fechar" : "Ver detalhes"}
                      </button>
                    </div>
                  </div>

                  {/* ── Painel de detalhes ── */}
                  {aberto && (
                    <div className="admin-detalhe">
                      <div className="admin-detalhe-secao">
                        <span className="admin-detalhe-label">Descrição completa</span>
                        <p className="admin-detalhe-texto">{c.descricao}</p>
                      </div>

                      {c.localizacao && (
                        <div className="admin-detalhe-secao">
                          <span className="admin-detalhe-label"><MapPin size={12} /> Localização</span>
                          <p className="admin-detalhe-texto">{c.localizacao}</p>
                        </div>
                      )}

                      {c.midia?.length > 0 && (
                        <div className="admin-detalhe-secao">
                          <span className="admin-detalhe-label"><Image size={12} /> Mídias ({c.midia.length})</span>
                          <div className="admin-midia-grid">
                            {c.midia.map((url, idx) => {
                              const isVideo = url.match(/\.(mp4|webm|mov)/i);
                              return (
                                <div key={idx} className="admin-midia-thumb" onClick={() => setMidiaAtiva(url)}>
                                  {isVideo
                                    ? <><video src={url} className="admin-midia-img" muted /><div className="admin-midia-play"><PlayCircle size={28} /></div></>
                                    : <img src={url} alt={`mídia ${idx + 1}`} className="admin-midia-img" />
                                  }
                                  <div className="admin-midia-overlay">ver</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {midiaAtiva && (
        <div className="lightbox" onClick={() => setMidiaAtiva(null)}>
          <button className="lightbox-fechar" onClick={() => setMidiaAtiva(null)}>✕</button>
          {midiaAtiva.match(/\.(mp4|webm|mov)/i)
            ? <video src={midiaAtiva} controls className="lightbox-midia" onClick={(e) => e.stopPropagation()} />
            : <img src={midiaAtiva} alt="mídia" className="lightbox-midia" onClick={(e) => e.stopPropagation()} />
          }
        </div>
      )}
    </div>
  );
}

export default AdminChamados;
