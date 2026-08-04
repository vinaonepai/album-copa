<template>
  <IonPage>
    <IonContent>
      <div class="container">
        <IonCard class="form-card">
          <div class="logo">
            <h1>Criar Conta</h1>
            <p>Comece sua colecao digital</p>
          </div>

          <IonInput
            v-model="nome"
            label="Nome Completo"
            label-placement="floating"
            fill="outline"
          />

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
  IonButton,
  IonCard,
  IonContent,
  IonInput,
  IonPage,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useAuth } from "@/composables/useAuth";

const nome = ref("");
const email = ref("");
const senha = ref("");

const router = useRouter();
const { cadastrar } = useAuth();

async function criarConta() {
  if (!nome.value.trim() || !email.value.trim() || !senha.value) {
    alert("Preencha todos os campos");
    return;
  }

  if (senha.value.length < 6) {
    alert("Senha muito fraca. Use pelo menos 6 caracteres.");
    return;
  }

  try {
    await cadastrar(nome.value.trim(), email.value.trim(), senha.value);
  } catch (err: any) {
    alert(err?.message || "Erro ao criar conta");
    return;
  }

  alert("Conta criada com sucesso!");
  router.push("/login");
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
  border-radius: 8px;
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
  margin-bottom: 14px;
}

ion-button + ion-button {
  margin-top: 10px;
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
