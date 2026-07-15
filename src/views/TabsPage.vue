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
          tab="conquistas"
          href="/tabs/conquistas"
        >
          <IonIcon :icon="trophyOutline" />
          <IonLabel>Conquistas</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="estatisticas"
          href="/tabs/estatisticas"
        >
          <IonIcon :icon="statsChartOutline" />
          <IonLabel>Estatisticas</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="perfil"
          href="/tabs/perfil"
        >
          <IonIcon :icon="personOutline" />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="sobre"
          href="/tabs/sobre"
        >
          <IonIcon :icon="informationCircleOutline" />
          <IonLabel>Sobre</IonLabel>
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
  personOutline,
  informationCircleOutline,
  statsChartOutline,
  trophyOutline
} from 'ionicons/icons'
</script>
