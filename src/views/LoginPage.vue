<template>
  <IonPage>
    <IonContent>

      <div class="container">

        <IonCard class="form-card">

          <div class="logo">
            <h1>🏆 Álbum da Copa</h1>
            <p>Acesse sua coleção digital</p>
          </div>

          <IonInput
            v-model="email"
            type="email"
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
            @click="entrar"
          >
            Entrar
          </IonButton>

          <div class="links">

            <IonButton
              fill="clear"
              router-link="/cadastro"
            >
              Criar Conta
            </IonButton>

            <IonButton
              fill="clear"
              router-link="/recuperar-senha"
            >
              Esqueci Minha Senha
            </IonButton>

          </div>

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

const email = ref('')
const senha = ref('')

const router = useRouter()

const { login } = useAuth()

async function entrar() {
  if (!email.value.trim() || !senha.value) {
    alert('Preencha e-mail e senha')
    return
  }

  const sucesso = await login(
    email.value.trim(),
    senha.value
  )

  if (sucesso) {
    router.push('/tabs/album')
  } else {
    alert('Login inválido')
  }
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
  backdrop-filter: blur(12px);
}

.logo {
  text-align: center;
  margin-bottom: 25px;
}

.logo h1 {
  color: white;
}

.logo p {
  color: #cbd5e1;
}

ion-input {
  margin-bottom: 15px;
}

.links {
  text-align: center;
}
</style>
