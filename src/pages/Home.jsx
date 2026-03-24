import { useNavigate } from "react-router-dom";
import { MapPin, Bell, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <MapPin size={28} />, title: "Reporte Problemas", desc: "Registre buracos, iluminação, segurança e muito mais com localização precisa." },
    { icon: <Bell size={28} />, title: "Acompanhe em Tempo Real", desc: "Veja o status do seu chamado: aberto, em análise ou resolvido." },
    { icon: <Building2 size={28} />, title: "Melhore sua Cidade", desc: "Sua voz chega direto à prefeitura e gera mudanças reais no bairro." },
  ];

  return (
    <div className="home-wrapper">
      <Navbar />

      <section className="home-hero">
        <span className="hero-badge">Plataforma Cidadã</span>
        <h1 className="hero-title">
          Sua voz para<br />
          <span className="highlight">melhorar a cidade</span>
        </h1>
        <p className="hero-sub">
          Reporte problemas urbanos, acompanhe chamados e veja sua cidade evoluir. Conectamos cidadãos e prefeitura de forma simples e transparente.
        </p>
        <div className="hero-actions">
          <button className="btn btn-filled" onClick={() => navigate("/login")}>Criar chamado agora</button>
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>Já tenho conta</button>
        </div>
      </section>

      <section className="home-features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}

export default Home;
