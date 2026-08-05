<template>
  <IonPage>
    <IonContent>
      <div class="container">
        <IonCard class="form-card">
          <div class="logo">
            <h1>Recuperar Senha</h1>
            <p>Receba um e-mail de recuperacao</p>
          </div>

          <ResetPasswordForm @enviado="recuperar" />

          <p
            v-if="mensagem"
            class="mensagem"
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
  IonButton,
  IonCard,
  IonContent,
  IonPage,
} from "@ionic/vue";
import { ref } from "vue";

import ResetPasswordForm from "@/components/ResetPasswordForm.vue";
import { useAuth } from "@/composables/useAuth";

const mensagem = ref("");
const { resetarSenha } = useAuth();

function recuperar(email: string) {
  mensagem.value = resetarSenha(email);
}
</script>

<style scoped>
ion-content {
  --background: linear-gradient(135deg, #0f172a, #1e293b);
}

.container {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px);
}

.form-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  color: white;
  margin: 0;
  max-width: 450px;
  padding: 22px;
  width: 100%;
}

.logo {
  margin-bottom: 24px;
  text-align: center;
}

.logo h1 {
  color: white;
  font-size: 28px;
  margin: 0;
}

.logo p {
  color: #cbd5e1;
  margin-bottom: 0;
}

.mensagem {
  color: #22c55e;
  margin: 15px 0;
  overflow-wrap: anywhere;
  text-align: center;
}

@media (max-width: 420px) {
  .form-card {
    padding: 18px;
  }

  .logo h1 {
    font-size: 24px;
  }
}
</style>
