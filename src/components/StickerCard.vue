<template>
  <IonCard
    class="figurinha"
    :class="{
      coletada: sticker.coletada
    }"
  >

    <img
      class="foto-jogador"
      :src="sticker.foto"
      alt="Jogador"
    />

    <IonCardHeader>

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
  IonButton
} from '@ionic/vue'

interface Sticker {
  id: number
  nome: string
  selecao: string
  foto: string
  raridade: string
  coletada: boolean
}

defineProps<{
  sticker: Sticker
}>()

defineEmits<{
  (e: 'toggle', id: number): void
}>()
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

.foto-jogador {
  width: 100%;
  height: 420px;
  object-fit: contain;
  background: #0f172a;
  padding: 10px;
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