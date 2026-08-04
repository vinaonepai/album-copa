<template>
  <IonCard
    class="figurinha"
    :class="{
      coletada: sticker.coletada,
      favorita: sticker.favorite,
    }"
  >
    <img
      v-if="sticker.foto"
      class="foto-jogador"
      :src="sticker.foto"
      :alt="sticker.nome"
    />

    <div
      v-else
      class="foto-placeholder"
    >
      {{ sticker.nome.slice(0, 1).toUpperCase() }}
    </div>

    <IonCardHeader>
      <div class="card-topo">
        <IonChip
          v-if="sticker.favorite"
          color="warning"
        >
          <IonIcon :icon="star" />
          Favorita
        </IonChip>

        <IonButton
          fill="clear"
          class="favorito-botao"
          :color="sticker.favorite ? 'warning' : 'medium'"
          @click="$emit('favorite', sticker.id)"
        >
          <IonIcon
            slot="icon-only"
            :icon="sticker.favorite ? star : starOutline"
          />
        </IonButton>
      </div>

      <IonCardTitle>
        {{ sticker.nome }}
      </IonCardTitle>
    </IonCardHeader>

    <IonCardContent>
      <h3>{{ sticker.selecao }}</h3>

      <div class="badges">
        <IonBadge
          class="raridade"
          :color="raridadeColor"
        >
          {{ sticker.raridade }}
        </IonBadge>

        <IonBadge :color="sticker.coletada ? 'success' : 'warning'">
          {{ sticker.coletada ? "Obtida" : "Faltando" }}
        </IonBadge>

        <IonChip
          v-if="sticker.coletada && sticker.collected_at"
          color="success"
        >
          <IonIcon :icon="calendarOutline" />
          {{ formatarData(sticker.collected_at) }}
        </IonChip>
      </div>

      <IonButton
        expand="block"
        @click="$emit('toggle', sticker.id)"
      >
        {{ sticker.coletada ? "Remover do Album" : "Adicionar ao Album" }}
      </IonButton>
    </IonCardContent>
  </IonCard>
</template>

<script setup lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
} from "@ionic/vue";
import {
  calendarOutline,
  star,
  starOutline,
} from "ionicons/icons";
import { computed } from "vue";

interface Sticker {
  id: number;
  nome: string;
  selecao: string;
  foto: string | null;
  raridade: string;
  coletada: boolean;
  favorite: boolean;
  collected_at: string | null;
}

const props = defineProps<{
  sticker: Sticker;
}>();

defineEmits<{
  (e: "toggle", id: number): void;
  (e: "favorite", id: number): void;
}>();

const raridadeColor = computed(() => {
  if (props.sticker.raridade === "Brilhante") {
    return "danger";
  }

  if (props.sticker.raridade === "Rara") {
    return "primary";
  }

  return "medium";
});

function formatarData(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
</script>

<style scoped>
.figurinha {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
  overflow: hidden;
}

.coletada {
  border-color: #22c55e;
}

.favorita {
  box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.45);
}

.foto-jogador,
.foto-placeholder {
  aspect-ratio: 4 / 3;
  background: #0f172a;
  max-height: 280px;
  width: 100%;
}

.foto-jogador {
  object-fit: contain;
  padding: 10px;
}

.foto-placeholder {
  align-items: center;
  color: #facc15;
  display: flex;
  font-size: 88px;
  font-weight: 800;
  justify-content: center;
}

.card-topo {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  min-height: 40px;
}

.favorito-botao {
  margin-left: auto;
}

ion-card-title {
  color: white;
  overflow-wrap: anywhere;
}

h3 {
  color: #cbd5e1;
  margin-top: 0;
  overflow-wrap: anywhere;
}

.badges {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

ion-badge {
  font-size: 13px;
}

.raridade {
  font-size: 14px;
  font-weight: bold;
}

ion-button {
  --border-radius: 8px;
}

@media (max-width: 420px) {
  .foto-jogador,
  .foto-placeholder {
    max-height: 220px;
  }

  .foto-placeholder {
    font-size: 68px;
  }
}
</style>
