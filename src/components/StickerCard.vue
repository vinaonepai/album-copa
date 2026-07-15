<template>
  <IonCard
    class="figurinha"
    :class="{
      coletada: sticker.coletada,
      favorita: sticker.favorite
    }"
  >

    <img
      v-if="sticker.foto"
      class="foto-jogador"
      :src="sticker.foto"
      alt="Jogador"
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

      <h3>
        {{ sticker.selecao }}
      </h3>

      <IonBadge
        class="raridade"
        :color="
          sticker.raridade === 'Brilhante'
            ? 'danger'
            : sticker.raridade === 'Rara'
            ? 'primary'
            : 'medium'
        "
      >
        ⭐ {{ sticker.raridade }}
      </IonBadge>

      <br><br>

      <IonBadge
        :color="
          sticker.coletada
            ? 'success'
            : 'warning'
        "
      >
        {{
          sticker.coletada
            ? 'Obtida'
            : 'Faltando'
        }}
      </IonBadge>

      <br><br>

      <IonChip
        v-if="sticker.coletada && sticker.collected_at"
        color="success"
      >
        <IonIcon :icon="calendarOutline" />
        {{ formatarData(sticker.collected_at) }}
      </IonChip>

      <br v-if="sticker.coletada && sticker.collected_at"><br v-if="sticker.coletada && sticker.collected_at">

      <IonButton
        expand="block"
        @click="$emit('toggle', sticker.id)"
      >
        {{
          sticker.coletada
            ? 'Remover do Álbum'
            : 'Adicionar ao Álbum'
        }}
      </IonButton>

    </IonCardContent>

  </IonCard>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonChip,
  IonIcon
} from '@ionic/vue'
import {
  calendarOutline,
  star,
  starOutline
} from 'ionicons/icons'

interface Sticker {
  id: number
  nome: string
  selecao: string
  foto: string | null
  raridade: string
  coletada: boolean
  favorite: boolean
  collected_at: string | null
}

defineProps<{
  sticker: Sticker
}>()

defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'favorite', id: number): void
}>()

function formatarData(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}
</script>

<style scoped>
.figurinha {
  background: #1e293b;
  border-radius: 20px;
  overflow: hidden;
  transition: .25s;
  border: 1px solid rgba(
    255,
    255,
    255,
    .08
  );
}

.figurinha:hover {
  transform: translateY(-5px);

  box-shadow:
    0 10px 25px rgba(
      0,
      0,
      0,
      .35
    );
}

.coletada {
  border: 2px solid #22c55e;
}

.favorita {
  box-shadow: inset 0 0 0 1px rgba(250, 204, 21, .45);
}

.card-topo {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 40px;
}

.favorito-botao {
  margin-left: auto;
}

.foto-jogador {
  width: 100%;
  height: 420px;
  object-fit: contain;
  background: #0f172a;
  padding: 10px;
}

.foto-placeholder {
  width: 100%;
  height: 420px;
  background: #0f172a;
  color: #facc15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  font-weight: 800;
}

ion-card-title {
  color: white;
}

h3 {
  color: #cbd5e1;
}

ion-badge {
  font-size: 13px;
}

.raridade {
  font-size: 14px;
  font-weight: bold;
}

ion-button {
  --border-radius: 12px;
}
</style>
