import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, MapPin, Navigation, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import "leaflet/dist/leaflet.css";
import "../styles/NovoChamado.css";

// Corrige ícone padrão do Leaflet que some com bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CLOUDINARY_CLOUD = "ddpnnsuri";
const CLOUDINARY_PRESET = "vox-projeto";

async function uploadCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Falha no upload da mídia.");
  const data = await res.json();
  return data.secure_url;
}

// Componente que move o mapa quando as coordenadas mudam
function MapaControle({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 16, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

// Componente que captura clique no mapa e move o marcador
function MarkerClicavel({ coords, setCoords, setLocalizacao }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        setLocalizacao(data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } catch {
        setLocalizacao(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });
  return coords ? <Marker position={coords} /> : null;
}

function NovoChamado() {
  const navigate = useNavigate();
  const inputMidiaRef = useRef(null);

  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [coords, setCoords] = useState(null); // [lat, lng]
  const [midias, setMidias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  // Busca coordenadas quando o usuário digita o endereço (debounce 800ms)
  const debounceRef = useRef(null);
  function handleLocalizacaoChange(valor) {
    setLocalizacao(valor);
    clearTimeout(debounceRef.current);
    if (valor.trim().length < 5) return;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(valor)}&format=json&limit=1`
        );
        const data = await res.json();
        if (data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch {
        // silencioso — usuário pode clicar no mapa
      }
    }, 800);
  }

  function usarLocalizacaoAtual() {
    if (!navigator.geolocation) {
      setErro("Geolocalização não suportada pelo navegador.");
      return;
    }
    setBuscandoLocal(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setLocalizacao(data.display_name ?? `${latitude}, ${longitude}`);
        } catch {
          setLocalizacao(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setBuscandoLocal(false);
      },
      () => {
        setErro("Não foi possível obter sua localização.");
        setBuscandoLocal(false);
      }
    );
  }

  function handleMidiaChange(e) {
    const arquivos = Array.from(e.target.files);
    const novas = arquivos.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      tipo: file.type.startsWith("video") ? "video" : "imagem",
    }));
    setMidias((prev) => [...prev, ...novas].slice(0, 5));
    e.target.value = "";
  }

  function removerMidia(index) {
    setMidias((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (!descricao.trim()) { setErro("A descrição é obrigatória."); return; }
    if (!localizacao.trim()) { setErro("A localização é obrigatória."); return; }

    setCarregando(true);
    try {
      const urlsMidia = await Promise.all(
        midias.map(({ file }) => uploadCloudinary(file))
      );
      const docRef = await addDoc(collection(db, "chamados"), {
        id_usuario: auth.currentUser.uid,
        descricao: descricao.trim(),
        localizacao: localizacao.trim(),
        coords: coords ? { lat: coords[0], lng: coords[1] } : null,
        midia: urlsMidia,
        status: "Aberto",
        criadoEm: serverTimestamp(),
      });
      navigate(`/chamado/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setErro("Erro ao enviar chamado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Centro padrão do mapa: Brasil
  const centroInicial = coords ?? [-15.7801, -47.9292];

  return (
    <div className="chamado-page">
      <Header variant="dash" />

      <main className="chamado-body">
        <Breadcrumb itens={[{ label: "Novo Chamado" }]} />
        <h1 className="chamado-titulo">Novo Chamado</h1>

        <form onSubmit={handleSubmit} className="chamado-form">

          {/* Descrição */}
          <div className="campo-grupo">
            <label className="campo-label">
              Descrição <span className="obrig">*</span>
            </label>
            <textarea
              className="chamado-textarea"
              placeholder="Descreva detalhadamente o problema ou sugestão..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
            />
          </div>

          {/* Mídia */}
          <div className="campo-grupo">
            <label className="campo-label">
              Mídia <span className="campo-opt">(opcional)</span>
            </label>
            <div className="midia-area">
              <button
                type="button"
                className="btn-adicionar-fotos"
                onClick={() => inputMidiaRef.current?.click()}
              >
                <Paperclip size={16} /> Adicionar Fotos
              </button>
              <input
                ref={inputMidiaRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={handleMidiaChange}
              />
              {midias.length === 0 ? (
                <div className="midia-drop" onClick={() => inputMidiaRef.current?.click()}>
                  <p>Arraste arquivos ou clique para adicionar</p>
                </div>
              ) : (
                <div className="midia-preview-grid">
                  {midias.map((m, i) => (
                    <div className="midia-thumb" key={i}>
                      {m.tipo === "video"
                        ? <video src={m.preview} className="midia-img" muted />
                        : <img src={m.preview} alt={`mídia ${i + 1}`} className="midia-img" />
                      }
                      <button type="button" className="midia-remove" onClick={() => removerMidia(i)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          <div className="campo-grupo">
            <label className="campo-label">
              Localização <span className="obrig">*</span>
            </label>

            <div className="local-input-wrap">
              <MapPin size={16} className="local-icon" />
              <input
                className="chamado-input"
                type="text"
                placeholder="Digite o endereço ou use sua localização atual..."
                value={localizacao}
                onChange={(e) => handleLocalizacaoChange(e.target.value)}
              />
            </div>

            {/* Mapa Leaflet */}
            <div className="mapa-container">
              <MapContainer
                center={centroInicial}
                zoom={coords ? 16 : 4}
                className="mapa-leaflet"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapaControle coords={coords} />
                <MarkerClicavel
                  coords={coords}
                  setCoords={setCoords}
                  setLocalizacao={setLocalizacao}
                />
              </MapContainer>
            </div>

            <button
              type="button"
              className="btn-gps"
              onClick={usarLocalizacaoAtual}
              disabled={buscandoLocal}
            >
              <Navigation size={15} />
              {buscandoLocal ? "Buscando localização..." : "Usar Localização Atual"}
            </button>
          </div>

          {erro && <p className="chamado-erro">{erro}</p>}

          {/* Ações */}
          <div className="chamado-acoes">
            <button type="submit" className="btn-enviar" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar Chamado"}
            </button>
            <div className="chamado-links">
              <button type="button" className="btn-secundario" onClick={() => navigate("/dashboard")}>
                Ver chamados anteriores
              </button>
              <button type="button" className="btn-cancelar" onClick={() => navigate("/dashboard")}>
                Cancelar
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}

export default NovoChamado;
