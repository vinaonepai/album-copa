<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initDatabase } from './services/database';
import { IonApp, IonRouterOutlet } from '@ionic/vue';

onMounted(async () => {
  await initDatabase()
})
</script>
