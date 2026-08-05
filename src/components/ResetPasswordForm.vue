<template>

  <IonInput
    v-model="email"
    label="E-mail"
    label-placement="floating"
    fill="outline"
  />

  <IonButton
    expand="block"
    color="success"
    @click="enviar"
  >
    Enviar E-mail
  </IonButton>

</template>

<script setup lang="ts">
import {
  IonInput,
  IonButton
} from '@ionic/vue'

import { ref } from 'vue'

const email = ref('')

const emit = defineEmits<{
  (e: 'enviado', email: string): void
}>()

function enviar() {
  emit('enviado', email.value)
}
</script>

<style scoped>
ion-input {
  --background: #0f172a;
  --border-color: rgba(203, 213, 225, 0.48);
  --color: white;
  --highlight-color-focused: #22c55e;
  --placeholder-color: #cbd5e1;
  margin-bottom: 14px;
}

ion-button {
  --border-radius: 8px;
}
</style>
