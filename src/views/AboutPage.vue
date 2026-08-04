<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>Sobre</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div class="container">
        <IonCard class="about-card">
          <IonCardContent>
            <h1>Album da Copa 2026</h1>

            <p>
              Aplicativo desenvolvido para gerenciamento de figurinhas da Copa
              do Mundo.
            </p>

            <div class="info">
              <h2>Versao</h2>
              <p>1.0.0</p>
            </div>

            <IonButton
              expand="block"
              fill="outline"
              href="https://www.termsfeed.com/live/terms-and-conditions"
              target="_blank"
            >
              Termos de Uso
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              href="https://www.termsfeed.com/live/privacy-policy"
              target="_blank"
            >
              Politica de Privacidade
            </IonButton>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
</script>

<style scoped>
ion-content {
  --background: #0f172a;
}

.toolbar-premium {
  --background: #111827;
  --color: white;
}

.container {
  box-sizing: border-box;
  margin: auto;
  max-width: 700px;
  padding: 20px 16px calc(env(safe-area-inset-bottom) + 82px);
}

.about-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
}

h1 {
  font-size: 26px;
  margin-top: 0;
  text-align: center;
}

p {
  color: #cbd5e1;
  line-height: 1.45;
}

.info {
  margin: 24px 0;
  text-align: center;
}

.info h2 {
  margin-bottom: 6px;
}

ion-button {
  margin-top: 10px;
}
</style>
