<template>
  <IonPage>

    <IonHeader>
      <IonToolbar class="toolbar-premium">

        <IonTitle>
          🏆 Álbum da Copa 2026
        </IonTitle>

        <IonButtons slot="end">
          <IonButton
            color="danger"
            @click="mostrarAlerta = true"
          >
            Sair
          </IonButton>
        </IonButtons>

      </IonToolbar>
    </IonHeader>

    <IonContent>

      <div class="hero">

        <h1>⚽ Álbum Oficial</h1>

        <p>
          Colecione todas as figurinhas da Copa
        </p>

      </div>

      <div class="conteudo">

        <IonCard class="estatisticas-card">

          <IonCardContent>

            <h2>Meu Álbum</h2>

            <p>
              {{ coletadas.length }}
              de
              {{ lista.length }}
              figurinhas coletadas
            </p>

            <IonProgressBar
              :value="
                coletadas.length /
                lista.length
              "
            />

          </IonCardContent>

        </IonCard>

        <IonSearchbar
          v-model="busca"
          placeholder="Pesquisar jogador ou seleção"
        />

        <IonSegment
          v-model="filtro"
          class="segmento"
        >

          <IonSegmentButton value="todas">
            <IonLabel>Todas</IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="coletadas">
            <IonLabel>Coletadas</IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="pendentes">
            <IonLabel>Pendentes</IonLabel>
          </IonSegmentButton>

        </IonSegment>

        <div class="grid">

          <StickerCard
            v-for="item in filtradas"
            :key="item.id"
            :sticker="item"
            @toggle="marcarColetada"
          />

        </div>

      </div>

      <IonAlert
        :is-open="mostrarAlerta"
        header="Confirmar saída"
        message="Tem certeza que deseja sair?"
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
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonButton,
  IonButtons,
  IonAlert,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from "@ionic/vue";

import { ref } from "vue";
import { useRouter } from "vue-router";

import StickerCard from "@/components/StickerCard.vue";

import { useAlbum } from "@/composables/albumTemp";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();

const {
  lista,
  busca,
  filtro,
  filtradas,
  coletadas,
  marcarColetada,
} = useAlbum();

const { logout } = useAuth();

const mostrarAlerta = ref(false);

function sair() {
  logout();
  router.push("/login");
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

.hero {
  background: linear-gradient(
    135deg,
    #16a34a,
    #facc15
  );

  padding: 30px;
  text-align: center;
  color: white;
}

.hero h1 {
  margin: 0;
  font-size: 32px;
}

.hero p {
  margin-top: 10px;
}

.conteudo {
  padding: 20px;
}

.estatisticas-card {
  background: rgba(
    255,
    255,
    255,
    0.08
  );

  backdrop-filter: blur(10px);

  color: white;

  border-radius: 20px;

  margin-bottom: 20px;
}

.segmento {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns:
      repeat(3, 1fr);
  }
}
</style>