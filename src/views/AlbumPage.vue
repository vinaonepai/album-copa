<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>Album da Copa 2026</IonTitle>

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
        <h1>Album Oficial</h1>
        <p>Colecione todas as figurinhas da Copa</p>
      </div>

      <div class="conteudo">
        <IonCard class="estatisticas-card">
          <IonCardContent>
            <h2>Meu Album</h2>

            <p>
              {{ totalColetadas }}
              de
              {{ totalFigurinhas }}
              figurinhas coletadas
            </p>

            <IonProgressBar :value="progresso" />
          </IonCardContent>
        </IonCard>

        <IonCard class="cadastro-card">
          <IonCardContent>
            <h2>Cadastrar figurinha</h2>

            <IonInput
              v-model="novoNome"
              label="Nome do jogador"
              label-placement="floating"
              fill="outline"
            />

            <IonInput
              v-model="novaSelecao"
              label="Selecao"
              label-placement="floating"
              fill="outline"
            />

            <IonInput
              v-model="novaFoto"
              label="URL da foto"
              label-placement="floating"
              fill="outline"
            />

            <IonSelect
              v-model="novaRaridade"
              label="Raridade"
              label-placement="floating"
              fill="outline"
            >
              <IonSelectOption value="Comum">Comum</IonSelectOption>
              <IonSelectOption value="Rara">Rara</IonSelectOption>
              <IonSelectOption value="Brilhante">Brilhante</IonSelectOption>
            </IonSelect>

            <IonButton
              expand="block"
              color="success"
              @click="salvarFigurinha"
            >
              Salvar figurinha
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonSearchbar
          v-model="busca"
          placeholder="Pesquisar jogador ou selecao"
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

          <IonSegmentButton value="favoritas">
            <IonLabel>Favoritas</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonSelect
          v-model="ordenacao"
          class="ordenacao"
          label="Ordenar"
          label-placement="floating"
          fill="outline"
        >
          <IonSelectOption value="cadastro">Cadastro</IonSelectOption>
          <IonSelectOption value="coleta">Data de coleta</IonSelectOption>
        </IonSelect>

        <div class="grid">
          <StickerCard
            v-for="item in filtradas"
            :key="item.id"
            :sticker="item"
            @toggle="marcarColetada"
            @favorite="marcarFavorita"
          />
        </div>

        <IonCard
          v-if="filtradas.length === 0"
          class="vazio-card"
        >
          <IonCardContent>
            Nenhuma figurinha encontrada.
          </IonCardContent>
        </IonCard>
      </div>

      <IonAlert
        :is-open="mostrarAlerta"
        header="Confirmar saida"
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
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";

import { ref } from "vue";
import { useRouter } from "vue-router";

import StickerCard from "@/components/StickerCard.vue";

import { useAlbum } from "@/composables/albumTemp";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();

const {
  busca,
  filtro,
  ordenacao,
  filtradas,
  totalFigurinhas,
  totalColetadas,
  progresso,
  marcarColetada,
  marcarFavorita,
  cadastrarSticker,
} = useAlbum();

const { logout } = useAuth();

const mostrarAlerta = ref(false);
const novoNome = ref("");
const novaSelecao = ref("");
const novaFoto = ref("");
const novaRaridade = ref("Comum");

async function salvarFigurinha() {
  if (!novoNome.value.trim() || !novaSelecao.value.trim()) {
    alert("Informe nome e selecao da figurinha");
    return;
  }

  await cadastrarSticker(
    novoNome.value,
    novaSelecao.value,
    novaFoto.value || null,
    novaRaridade.value,
  );

  novoNome.value = "";
  novaSelecao.value = "";
  novaFoto.value = "";
  novaRaridade.value = "Comum";
}

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

.estatisticas-card,
.cadastro-card,
.vazio-card {
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

.cadastro-card h2 {
  margin-top: 0;
}

.cadastro-card ion-input,
.cadastro-card ion-select {
  margin-bottom: 12px;
}

.segmento,
.ordenacao {
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
