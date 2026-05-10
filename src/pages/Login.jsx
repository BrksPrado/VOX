import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, MapPin } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState("login");

  // Cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Login
  const [identificador, setIdentificador] = useState(""); // email ou nome de usuário

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function limpar() {
    setNome(""); setEmail(""); setCep("");
    setSenha(""); setConfirmarSenha("");
    setIdentificador(""); setErro("");
  }

  function alternarModo(novoModo) { setModo(novoModo); limpar(); }

  function formatarCep(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);
    return numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
  }

  // Busca email no Firestore pelo nome de usuário
  async function buscarEmailPorUsuario(nomeUsuario) {
    const q = query(
      collection(db, "usuarios"),
      where("nomeUsuario", "==", nomeUsuario.toLowerCase().trim())
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data().emailLogin;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    // ── CADASTRO ──────────────────────────────────────────
    if (modo === "cadastro") {
      if (!nome.trim()) { setErro("Informe seu nome de usuário."); return; }
      if (senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
      if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

      setCarregando(true);
      try {
        const nomeUsuario = nome.trim().split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

        // Se não informou email, gera um baseado no nome + timestamp curto
        const emailLogin = email.trim()
          ? email.trim()
          : `${nomeUsuario}_${Date.now().toString(36)}@vox.app`;

        // Cria a conta já com o email definitivo
        const cred = await createUserWithEmailAndPassword(auth, emailLogin, senha);
        const uid = cred.user.uid;

        await setDoc(doc(db, "usuarios", uid), {
          nome: nome.trim(),
          nomeUsuario,
          emailLogin,
          emailReal: email.trim() || null,
          cep: cep.trim() || null,
          criadoEm: new Date(),
        });

        navigate("/dashboard");
      } catch (err) {
        setErro(traduzirErro(err.code));
      } finally {
        setCarregando(false);
      }
      return;
    }

    // ── LOGIN ─────────────────────────────────────────────
    if (!identificador.trim()) { setErro("Informe seu e-mail ou nome de usuário."); return; }
    if (!senha.trim()) { setErro("Informe sua senha."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    setCarregando(true);
    try {
      let emailParaLogin = identificador.trim();

      // Se não contém @, é um nome de usuário — busca o email no Firestore
      if (!emailParaLogin.includes("@")) {
        // Pega só a primeira palavra e normaliza (igual ao cadastro)
        const nomeNormalizado = emailParaLogin.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        const emailEncontrado = await buscarEmailPorUsuario(nomeNormalizado);
        if (!emailEncontrado) {
          setErro("Usuário não encontrado.");
          setCarregando(false);
          return;
        }
        emailParaLogin = emailEncontrado;
      }

      await signInWithEmailAndPassword(auth, emailParaLogin, senha);
      navigate("/dashboard");
    } catch (err) {
      setErro(traduzirErro(err.code));
    } finally {
      setCarregando(false);
    }
  }

  function traduzirErro(code) {
    const map = {
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/invalid-email": "E-mail inválido.",
      "auth/user-not-found": "Usuário ou e-mail não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-credential": "Credenciais incorretas. Verifique e tente novamente.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
      "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
    };
    return map[code] ?? "Ocorreu um erro. Tente novamente.";
  }

  const validoCadastro = nome.trim() && senha.trim() && confirmarSenha.trim();
  const validoLogin = identificador.trim() && senha.trim();

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="VOX" className="login-logo" />
        <p className="login-tagline">Sua voz para melhorar a cidade</p>

        <div className="login-toggle">
          <button className={`toggle-btn ${modo === "login" ? "active" : ""}`}
            onClick={() => alternarModo("login")} type="button">Entrar</button>
          <button className={`toggle-btn ${modo === "cadastro" ? "active" : ""}`}
            onClick={() => alternarModo("cadastro")} type="button">Criar conta</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {/* ── CADASTRO ── */}
          {modo === "cadastro" && (
            <>
              <div className="input-group">
                <label>Usuário <span className="label-obrig">*</span></label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input className="login-input has-icon" type="text"
                    placeholder="Seu nome completo ou apelido" value={nome}
                    onChange={(e) => setNome(e.target.value)} autoComplete="name" />
                </div>
              </div>

              <div className="input-group">
                <label>E-mail <span className="label-opt">(opcional)</span></label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input className="login-input has-icon" type="email"
                    placeholder="seu e-mail" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>

              <div className="input-group">
                <label>CEP <span className="label-opt">(opcional)</span></label>
                <div className="input-icon-wrap">
                  <MapPin size={16} className="input-icon" />
                  <input className="login-input has-icon" type="text"
                    placeholder="00000-000" value={cep}
                    onChange={(e) => setCep(formatarCep(e.target.value))} />
                </div>
              </div>

              <div className="input-group">
                <label>Senha <span className="label-obrig">*</span></label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="login-input has-icon" type="password"
                    placeholder="••••••••" value={senha}
                    onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" />
                </div>
              </div>

              <div className="input-group">
                <label>Confirmar senha <span className="label-obrig">*</span></label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="login-input has-icon" type="password"
                    placeholder="••••••••" value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" />
                </div>
              </div>
            </>
          )}

          {/* ── LOGIN ── */}
          {modo === "login" && (
            <>
              <div className="input-group">
                <label>E-mail ou usuário <span className="label-obrig">*</span></label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input className="login-input has-icon" type="text"
                    placeholder="seu e-mail ou usuário"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    autoComplete="username" />
                </div>
              </div>

              <div className="input-group">
                <label>Senha <span className="label-obrig">*</span></label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="login-input has-icon" type="password"
                    placeholder="••••••••" value={senha}
                    onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
                </div>
              </div>
            </>
          )}

          {erro && <p className="login-erro">{erro}</p>}

          <button className="login-button" type="submit"
            disabled={!(modo === "cadastro" ? validoCadastro : validoLogin) || carregando}>
            {carregando ? "Aguarde..." : modo === "cadastro" ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button className="login-back" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Voltar para o início
        </button>
      </div>
    </div>
  );
}

export default Login;
