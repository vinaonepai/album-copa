<template>
  <IonPage>
    <IonContent>

      <div class="container">

        <IonCard class="form-card">

          <div class="logo">
            <h1>⚽ Criar Conta</h1>
            <p>Comece sua coleção digital</p>
          </div>

          <IonInput
            v-model="nome"
            label="Nome Completo"
            label-placement="floating"
            fill="outline"
          />

          <IonInput
            v-model="email"
            label="E-mail"
            label-placement="floating"
            fill="outline"
          />

          <IonInput
            v-model="senha"
            type="password"
            label="Senha"
            label-placement="floating"
            fill="outline"
          />

          <IonButton
            expand="block"
            color="success"
            @click="criarConta"
          >
            Cadastrar
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            router-link="/login"
          >
            Voltar para Login
          </IonButton>

        </IonCard>

      </div>

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonInput,
  IonButton
} from '@ionic/vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const nome = ref('')
const email = ref('')
const senha = ref('')

const router = useRouter()

const { cadastrar } = useAuth()

async function criarConta() {

  if (
    !nome.value ||
    !email.value ||
    !senha.value
  ) {
    alert('Preencha todos os campos')
    return
  }

  if (senha.value.length < 6) {
    alert('Senha muito fraca. Use pelo menos 6 caracteres.')
    return
  }

  try {
    await cadastrar(
      nome.value,
      email.value,
      senha.value
    )
  } catch (err: any) {
    alert(err?.message || 'Erro ao criar conta')
    return
  }

  alert('Conta criada com sucesso!')

  router.push('/login')
}
</script>

<style scoped>
ion-content {
  --background: linear-gradient(
    135deg,
    #0f172a,
    #1e293b
  );
}

.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-card {
  width: 100%;
  max-width: 450px;
  padding: 25px;
  border-radius: 28px;
}

.logo {
  text-align: center;
  margin-bottom: 25px;
}

.logo h1 {
  color: white;
  margin-bottom: 10px;
}

.logo p {
  color: #cbd5e1;
}

ion-input {
  margin-bottom: 15px;
}
</style>