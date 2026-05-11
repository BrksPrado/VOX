import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import "leaflet/dist/leaflet.css";
import "../styles/MapaCidade.css";

const STATUS_COR = {
  "Aberto":       "#fbbf24",
  "Em Andamento": "#60a5fa",
  "Resolvido":    "#4ade80",
  "Recusado":     "#f87171",
};

function formatarData(timestamp) {
  if (!timestamp) return "—";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function MapaCidade() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscar() {
      try {
        const snap = await getDocs(collection(db, "chamados"));
        const lista = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.coords?.lat && c.coords?.lng);
        setChamados(lista);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar chamados.");
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  return (
    <div className="mapa-page">
      <Header variant="dash" />
      <main className="mapa-body">
        <Breadcrumb itens={[{ label: "Mapa da Cidade" }]} />
        <div className="mapa-header">
          <div>
            <h1>Mapa da Cidade</h1>
            <p>Visualize os problemas reportados na sua região</p>
          </div>
          <div className="mapa-legenda">
            {Object.entries(STATUS_COR).map(([status, cor]) => (
              <span key={status} className="legenda-item">
                <span className="legenda-bolinha" style={{ background: cor }} />
                {status}
              </span>
            ))}
          </div>
        </div>

        {carregando && (
          <div className="mapa-estado">
            <Loader2 size={32} className="spin" />
            <p>Carregando mapa...</p>
          </div>
        )}

        {erro && (
          <div className="mapa-estado erro">
            <AlertCircle size={32} />
            <p>{erro}</p>
          </div>
        )}

        {!carregando && !erro && (
          <>
            {chamados.length === 0 && (
              <div className="mapa-estado">
                <p>Nenhum chamado com localização encontrado.</p>
              </div>
            )}
            <div className="mapa-container">
              <MapContainer center={[-15.7801, -47.9292]} zoom={4} className="mapa-leaflet" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {chamados.map((c) => (
                  <CircleMarker
                    key={c.id}
                    center={[c.coords.lat, c.coords.lng]}
                    radius={10}
                    pathOptions={{
                      color: STATUS_COR[c.status] ?? "#fbbf24",
                      fillColor: STATUS_COR[c.status] ?? "#fbbf24",
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="popup-conteudo">
                        <span className="popup-status" style={{ color: STATUS_COR[c.status] ?? "#fbbf24" }}>
                          {c.status}
                        </span>
                        <p className="popup-desc">{c.descricao}</p>
                        <span className="popup-data">
                          <Clock size={11} /> {formatarData(c.criadoEm)}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <p className="mapa-contagem">{chamados.length} chamado{chamados.length !== 1 ? "s" : ""} no mapa</p>
          </>
        )}
      </main>
    </div>
  );
}

export default MapaCidade;
