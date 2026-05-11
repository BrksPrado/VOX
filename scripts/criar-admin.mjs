// Script temporário para criar usuário admin de teste
// Execute: node scripts/criar-admin.mjs

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhzFdKi8ezUO9BzS19IAIafRix_PXAGtA",
  authDomain: "vox-pi-43fdd.firebaseapp.com",
  projectId: "vox-pi-43fdd",
  storageBucket: "vox-pi-43fdd.firebasestorage.app",
  messagingSenderId: "505070443335",
  appId: "1:505070443335:web:785d69b1705363dbe54a62",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@vox.app";
const ADMIN_SENHA = "admin123";

try {
  const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_SENHA);
  await setDoc(doc(db, "usuarios", cred.user.uid), {
    nome: "Administrador",
    nomeUsuario: "admin",
    emailLogin: ADMIN_EMAIL,
    emailReal: ADMIN_EMAIL,
    cep: null,
    role: "admin",
    criadoEm: new Date(),
  });
  console.log("✅ Admin criado com sucesso!");
  console.log("   Email:", ADMIN_EMAIL);
  console.log("   Senha:", ADMIN_SENHA);
} catch (err) {
  if (err.code === "auth/email-already-in-use") {
    console.log("⚠️  Admin já existe. Use as credenciais:");
    console.log("   Email:", ADMIN_EMAIL);
    console.log("   Senha:", ADMIN_SENHA);
  } else {
    console.error("❌ Erro:", err.message);
  }
}

process.exit(0);
