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