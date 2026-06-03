<template>
  <IonPage>

    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>👤 Perfil</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>

      <div class="container">

        <div class="avatar">
          👤
        </div>

        <IonCard class="perfil-card">

          <IonCardContent>

            <h1>
              {{ usuarioLogado?.nome || 'Usuário' }}
            </h1>

            <p class="email">
              {{ usuarioLogado?.email }}
            </p>

            <div class="estatisticas">

              <div class="stat">
                <h2>{{ coletadas.length }}</h2>
                <span>Obtidas</span>
              </div>

              <div class="stat">
                <h2>{{ lista.length }}</h2>
                <span>Total</span>
              </div>

            </div>

            <IonProgressBar
              :value="coletadas.length / lista.length"
            />

            <p class="progresso-texto">
              {{
                Math.round(
                  (coletadas.length / lista.length) * 100
                )
              }}% Completo
            </p>

            <IonButton
              expand="block"
              color="danger"
              class="logout-btn"
              @click="mostrarAlerta = true"
            >
              🚪 Sair da Conta
            </IonButton>

          </IonCardContent>

        </IonCard>

      </div>

      <IonAlert
        :is-open="mostrarAlerta"
        header="Confirmar saída"
        message="Tem certeza que deseja sair da conta?"
        :buttons="[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Sair',
            role: 'destructive',
            handler: sair
          }
        ]"
        @didDismiss="mostrarAlerta = false"
      />

    </IonContent>

  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonButton,
  IonAlert
} from '@ionic/vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { useAlbum } from '@/composables/albumTemp'

const router = useRouter()

const { usuarioLogado, logout } = useAuth()

const {
  lista,
  coletadas
} = useAlbum()

const mostrarAlerta = ref(false)

function sair() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
ion-content {
  --background: #0f172a;
}

.toolbar-premium {
  --background: #111827;
  --color: white;
}

.container {
  padding: 30px;
  max-width: 600px;
  margin: auto;
}

.avatar {
  width: 120px;
  height: 120px;

  margin: 20px auto;

  border-radius: 50%;

  background: linear-gradient(
    135deg,
    #16a34a,
    #facc15
  );

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 60px;

  box-shadow:
    0 10px 30px rgba(0,0,0,.3);
}

.perfil-card {
  background: rgba(
    255,
    255,
    255,
    .08
  );

  backdrop-filter: blur(10px);

  border-radius: 24px;

  color: white;

  text-align: center;
}

h1 {
  margin-bottom: 5px;
}

.email {
  color: #94a3b8;
  margin-bottom: 25px;
}

.estatisticas {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat h2 {
  margin: 0;
  color: #22c55e;
}

.stat span {
  color: #cbd5e1;
}

ion-progress-bar {
  height: 12px;
  border-radius: 20px;
}

.progresso-texto {
  margin-top: 10px;
  color: #cbd5e1;
}

.logout-btn {
  margin-top: 25px;
  --border-radius: 14px;
}
</style>