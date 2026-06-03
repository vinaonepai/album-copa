<template>
  <IonPage>

    <IonContent>

      <div class="container">

        <IonCard class="form-card">

          <div class="logo">
            <h1>🔐 Recuperar Senha</h1>
            <p>Receba um e-mail de recuperação</p>
          </div>

          <ResetPasswordForm
            @enviado="recuperar"
          />

          <p
            class="mensagem"
            v-if="mensagem"
          >
            {{ mensagem }}
          </p>

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
  IonButton
} from '@ionic/vue'

import { ref } from 'vue'

import ResetPasswordForm from '@/components/ResetPasswordForm.vue'
import { useAuth } from '@/composables/useAuth'

const mensagem = ref('')

const { resetarSenha } = useAuth()

function recuperar(email: string) {
  mensagem.value = resetarSenha(email)
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

.mensagem {
  text-align: center;
  color: #22c55e;
  margin: 15px 0;
}
</style>