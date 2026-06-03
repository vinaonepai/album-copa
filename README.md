# 🏆 Álbum Digital da Copa 2026

## 📖 Sobre o Projeto

Este projeto foi desenvolvido utilizando **Vue 3**, **Ionic Framework** e **TypeScript** com o objetivo de simular um álbum digital de figurinhas da Copa do Mundo.

A aplicação permite que o usuário realize cadastro, login, recuperação de senha e gerencie suas figurinhas, marcando quais já foram coletadas e acompanhando seu progresso no álbum.

---

## 🚀 Funcionalidades

### 🔐 Autenticação

* Login com e-mail e senha
* Cadastro de novos usuários
* Validação de campos obrigatórios
* Recuperação de senha por e-mail (simulada)
* Logout com confirmação

### ⚽ Álbum de Figurinhas

* Visualização das figurinhas
* Busca por nome do jogador
* Busca por seleção
* Marcar figurinha como coletada
* Remover figurinha do álbum
* Contador de figurinhas coletadas
* Barra de progresso do álbum

### 🔎 Pesquisa e Filtros

* Pesquisa por nome do jogador
* Pesquisa por seleção
* Filtro para exibir:

  * Todas as figurinhas
  * Apenas coletadas
  * Apenas pendentes

### 👤 Perfil

* Visualização dos dados do usuário
* Estatísticas do álbum
* Percentual de conclusão
* Logout da aplicação

### 📱 Navegação

* Navegação entre telas utilizando Vue Router
* Menu inferior (Tabs)
* Interface responsiva para celular e computador

---

## 🛠️ Tecnologias Utilizadas

* Vue 3
* Ionic Framework
* TypeScript
* Vue Router
* Composition API
* Vite

---

## 📂 Estrutura do Projeto

src/

├── components/

│ ├── StickerCard.vue

│ └── ResetPasswordForm.vue

│

├── composables/

│ ├── useAuth.ts

│ └── albumTemp.ts

│

├── data/

│ └── stickers.ts

│

├── views/

│ ├── LoginPage.vue

│ ├── RegisterPage.vue

│ ├── ForgotPasswordPage.vue

│ ├── AlbumPage.vue

│ └── ProfilePage.vue

│

└── router/

└── index.ts

---

## ▶️ Como Executar

Instalar as dependências:

```bash
npm install
```

Executar o projeto:

```bash
ionic serve
```

O aplicativo será aberto automaticamente no navegador.

---

## 🎯 Objetivo da Atividade

Desenvolver uma aplicação mobile utilizando Ionic e Vue, aplicando conceitos de:

* Componentização
* Composables
* Gerenciamento de estado
* Navegação entre telas
* Autenticação de usuários
* Interface responsiva
* Organização de código

---

## 👨‍💻 Integrantes

* Vinícius Cavilha
* (Adicionar integrantes do grupo)

---

## 📸 Demonstração

O sistema apresenta um álbum digital de figurinhas da Copa com autenticação, filtros, busca e acompanhamento do progresso do usuário.
