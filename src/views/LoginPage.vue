<template>
  <IonPage>
    <IonContent>
      <div class="container">
        <IonCard class="form-card">
          <div class="logo">
            <h1>Album da Copa</h1>
            <p>Acesse sua colecao digital</p>
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
  IonButton,
  IonCard,
  IonContent,
  IonInput,
  IonPage,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useAuth } from "@/composables/useAuth";

const email = ref("");
const senha = ref("");

const router = useRouter();
const { login } = useAuth();

async function entrar() {
  if (!email.value.trim() || !senha.value) {
    alert("Preencha e-mail e senha");
    return;
  }

  const sucesso = await login(email.value.trim(), senha.value);

  if (sucesso) {
    router.push("/tabs/album");
  } else {
    alert("Login invalido");
  }
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

ion-input {
  --background: #0f172a;
  --border-color: rgba(203, 213, 225, 0.48);
  --color: white;
  --highlight-color-focused: #22c55e;
  --placeholder-color: #cbd5e1;
  margin-bottom: 14px;
}

.links {
  display: grid;
  gap: 2px;
  margin-top: 10px;
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
