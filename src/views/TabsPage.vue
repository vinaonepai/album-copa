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
          <IonLabel>Album</IonLabel>
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
          <IonLabel>Stats</IonLabel>
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
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/vue";
import {
  imagesOutline,
  informationCircleOutline,
  personOutline,
  statsChartOutline,
  trophyOutline,
} from "ionicons/icons";
</script>

<style scoped>
ion-tab-bar {
  --background: #111827;
  --border: 1px solid rgba(148, 163, 184, 0.18);
  padding-bottom: env(safe-area-inset-bottom);
}

ion-tab-button {
  --color: #cbd5e1;
  --color-selected: #22c55e;
  min-width: 0;
}

ion-tab-button ion-label {
  font-size: 11px;
  line-height: 1.1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
