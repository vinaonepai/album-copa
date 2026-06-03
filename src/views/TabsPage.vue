<template>
  <IonPage>

    <IonTabs>

      <IonRouterOutlet />

      <IonTabBar slot="bottom">

        <IonTabButton
          tab="album"
          href="/tabs/album"
        >
          <IonIcon :icon="imagesOutline" />
          <IonLabel>Álbum</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="perfil"
          href="/tabs/perfil"
        >
          <IonIcon :icon="personOutline" />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>

      </IonTabBar>

    </IonTabs>

  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/vue'

import {
  imagesOutline,
  personOutline
} from 'ionicons/icons'
</script>