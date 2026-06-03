import { ref } from 'vue'

interface Usuario {
  nome: string
  email: string
  senha: string
}

const usuarioLogado = ref<Usuario | null>(null)

const usuarios = ref<Usuario[]>([
  {
    nome: 'Admin',
    email: 'admin@email.com',
    senha: '123456'
  }
])

export function useAuth() {
  const login = (email: string, senha: string) => {
    const usuario = usuarios.value.find(
      (u) => u.email === email && u.senha === senha
    )

    if (usuario) {
      usuarioLogado.value = usuario
      return true
    }

    return false
  }

  const cadastrar = (
    nome: string,
    email: string,
    senha: string
  ) => {
    usuarios.value.push({
      nome,
      email,
      senha
    })
  }

  const logout = () => {
    usuarioLogado.value = null
  }

  const resetarSenha = (email: string) => {
    return `Email enviado para ${email}`
  }

  return {
    usuarioLogado,
    login,
    cadastrar,
    logout,
    resetarSenha
  }
}