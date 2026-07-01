import { ref } from 'vue'
import {
  initDatabase,
  addUsuario,
  realizarLogin,
  findUsuarioById,
} from '@/services/database'

interface Usuario {
  id?: number
  nome: string
  email: string
  senha?: string
}

const usuarioLogado = ref<Usuario | null>(null)

// Inicializa o DB e tenta restaurar sessão
initDatabase().then(async () => {
  const stored = localStorage.getItem('usuarioId')
  if (stored) {
    const id = Number(stored)
    const u = await findUsuarioById(id)
    if (u) {
      usuarioLogado.value = {
        id: u.id,
        nome: u.nome,
        email: u.email,
      }
    }
  }
})

export function useAuth() {
  const login = async (email: string, senha: string) => {
    const usuario = await realizarLogin(email, senha)

    if (usuario) {
      usuarioLogado.value = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      }

      try {
        localStorage.setItem('usuarioId', String(usuario.id))
      } catch {}

      return true
    }

    return false
  }

  const cadastrar = async (nome: string, email: string, senha: string) => {
    // telefone deixado nulo por enquanto
    await addUsuario(nome, email, null, senha)
  }

  const logout = () => {
    usuarioLogado.value = null
    try {
      localStorage.removeItem('usuarioId')
    } catch {}
  }

  const resetarSenha = (email: string) => {
    return `Email enviado para ${email}`
  }

  return {
    usuarioLogado,
    login,
    cadastrar,
    logout,
    resetarSenha,
  }
}