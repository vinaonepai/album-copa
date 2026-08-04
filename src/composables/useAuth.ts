import { ref } from "vue";
import {
  initDatabase,
  addUsuario,
  realizarLogin,
} from "@/services/database";

interface Usuario {
  id?: number;
  nome: string;
  email: string;
}

const usuarioLogado = ref<Usuario | null>(null);

export const authReady = initDatabase().then(async () => {
  localStorage.removeItem("usuarioId");
  usuarioLogado.value = null;
});

export function useAuth() {
  const login = async (email: string, senha: string) => {
    await authReady;

    const usuario = await realizarLogin(email, senha);

    if (!usuario) {
      return false;
    }

    usuarioLogado.value = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    localStorage.setItem("usuarioId", String(usuario.id));
    return true;
  };

  const cadastrar = async (nome: string, email: string, senha: string) => {
    await authReady;
    await addUsuario(nome, email, null, senha);
  };

  const logout = () => {
    usuarioLogado.value = null;
    localStorage.removeItem("usuarioId");
  };

  const resetarSenha = (email: string) => {
    return `Email enviado para ${email}`;
  };

  return {
    usuarioLogado,
    login,
    cadastrar,
    logout,
    resetarSenha,
  };
}
