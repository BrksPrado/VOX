import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, MapPin, Clock, CheckCircle2, Loader2, AlertCircle, Image, ListOrdered, XCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import "leaflet/dist/leaflet.css";
import "../styles/DetalheChamado.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_CONFIG = {
  "Aberto":       { cor: "status-aberto",    icone: <AlertCircle size={15} />,  label: "Aberto" },
  "Em Andamento": { cor: "status-andamento", icone: <Loader2 size={15} />,      label: "Em Andamento" },
  "Resolvido":    { cor: "status-resolvido", icone: <CheckCircle2 size={15} />, label: "Resolvido" },
  "Recusado":     { cor: "status-recusado",  icone: <XCircle size={15} />,      label: "Recusado" },
};

function formatarData(timestamp) {
  if (!timestamp) return "—";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chamado, setChamado] = useState(null);
  const [posicaoFila, setPosicaoFila] = useState(null); // { posicao, total }
  const [carregando, setCarregando] = useState(true);
  const [midiaAtiva, setMidiaAtiva] = useState(null);

  useEffect(() => {
    async function buscar() {
      try {
        // Busca o chamado
        const snap = await getDoc(doc(db, "chamados", id));
        if (!snap.exists()) { setCarregando(false); return; }
        const dados = { id: snap.id, ...snap.data() };
        setChamado(dados);

        // Só calcula fila se não estiver resolvido
        if (dados.status !== "Resolvido") {
          const q = query(
            collection(db, "chamados"),
            where("status", "in", ["Aberto", "Em Andamento"])
          );
          const filaSnap = await getDocs(q);
          // Ordena por data no frontend
          const fila = filaSnap.docs
            .map((d) => ({ id: d.id, criadoEm: d.data().criadoEm }))
            .sort((a, b) => {
              const ta = a.criadoEm?.toDate?.() ?? new Date(0);
              const tb = b.criadoEm?.toDate?.() ?? new Date(0);
              return ta - tb; // mais antigo primeiro
            })
            .map((d) => d.id);
          const posicao = fila.indexOf(id) + 1;
          setPosicaoFila({ posicao, total: fila.length });
        }
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, [id]);

  if (carregando) return (
    <div className="detalhe-page">
      <Header variant="dash" />
      <div className="detalhe-estado"><Loader2 size={32} className="spin" /><p>Carregando...</p></div>
    </div>
  );

  if (!chamado) return (
    <div className="detalhe-page">
      <Header variant="dash" />
      <div className="detalhe-estado erro"><AlertCircle size={32} /><p>Chamado não encontrado.</p></div>
    </div>
  );

  const cfg = STATUS_CONFIG[chamado.status] ?? STATUS_CONFIG["Aberto"];
  const coords = chamado.coords ? [chamado.coords.lat, chamado.coords.lng] : null;

  return (
    <div className="detalhe-page">
      <Header variant="dash" />

      <main className="detalhe-body">

        {/* Breadcrumb */}
        <Breadcrumb itens={[
          { label: "Meus Chamados", rota: "/meus-chamados" },
          { label: "Chamado" },
        ]} />

        {/* Topo */}
        <div className="detalhe-topo">
          <button className="btn-voltar" onClick={() => navigate("/meus-chamados")}>
            <ArrowLeft size={17} /> Meus Chamados
          </button>
          <span className={`chamado-status ${cfg.cor}`}>
            {cfg.icone} {cfg.label}
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="detalhe-cabecalho">
          <h1 className="detalhe-titulo">Chamado</h1>
          <span className="detalhe-data">
            <Clock size={14} /> {formatarData(chamado.criadoEm)}
          </span>
        </div>

        {/* Card de posição na fila */}
        {posicaoFila && chamado.status !== "Resolvido" && (
          <div className={`fila-card ${chamado.status === "Em Andamento" ? "fila-andamento" : ""}`}>
            <div className="fila-icone">
              <ListOrdered size={22} />
            </div>
            <div className="fila-info">
              <span className="fila-label">Posição na fila</span>
              <div className="fila-posicao">
                <span className="fila-numero">{posicaoFila.posicao}º</span>
                <span className="fila-total">de {posicaoFila.total} chamado{posicaoFila.total !== 1 ? "s" : ""} aguardando</span>
              </div>
              {chamado.status === "Em Andamento" && (
                <span className="fila-aviso">Seu chamado está sendo atendido</span>
              )}
              {chamado.status === "Aberto" && posicaoFila.posicao === 1 && (
                <span className="fila-aviso">Voce e o proximo da fila</span>
              )}
            </div>

            {/* Barra de progresso */}
            <div className="fila-barra-wrap">
              <div
                className="fila-barra"
                style={{ width: `${Math.max(5, 100 - ((posicaoFila.posicao - 1) / posicaoFila.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {chamado.status === "Resolvido" && (
          <div className="fila-card fila-resolvido">
            <div className="fila-icone"><CheckCircle2 size={22} /></div>
            <div className="fila-info">
              <span className="fila-label">Status do chamado</span>
              <span className="fila-aviso">Chamado resolvido com sucesso</span>
            </div>
          </div>
        )}

        {/* Descrição */}
        <section className="detalhe-secao">
          <h2 className="detalhe-secao-titulo">Descrição</h2>
          <p className="detalhe-descricao">{chamado.descricao}</p>
        </section>

        {/* Localização */}
        <section className="detalhe-secao">
          <h2 className="detalhe-secao-titulo"><MapPin size={15} /> Localização</h2>
          <p className="detalhe-local-texto">{chamado.localizacao}</p>
          {coords && (
            <div className="detalhe-mapa">
              <MapContainer center={coords} zoom={16} className="mapa-leaflet" scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords} />
              </MapContainer>
            </div>
          )}
        </section>

        {/* Mídias */}
        {chamado.midia?.length > 0 && (
          <section className="detalhe-secao">
            <h2 className="detalhe-secao-titulo"><Image size={15} /> Mídias ({chamado.midia.length})</h2>
            <div className="detalhe-midia-grid">
              {chamado.midia.map((url, i) => {
                const isVideo = url.match(/\.(mp4|webm|mov)/i);
                return (
                  <div key={i} className="detalhe-midia-thumb" onClick={() => setMidiaAtiva(url)}>
                    {isVideo
                      ? <video src={url} className="detalhe-midia-img" muted />
                      : <img src={url} alt={`mídia ${i + 1}`} className="detalhe-midia-img" />
                    }
                    <div className="detalhe-midia-overlay">ver</div>
                  </div>
                );
              })}
            </div>
          </section>
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

export default DetalheChamado;
