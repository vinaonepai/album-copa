<template>
  <IonPage>

    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>ℹ️ Sobre</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>

      <div class="container">

        <div class="logo">
          🏆
        </div>

        <IonCard class="about-card">

          <IonCardContent>

            <h1>Álbum da Copa 2026</h1>

            <p>
              Aplicativo desenvolvido para
              gerenciamento de figurinhas
              da Copa do Mundo.
            </p>

            <div class="info">

              <h2>Versão</h2>
              <p>1.0.0</p>

            </div>

            <IonButton
              expand="block"
              fill="outline"
              href="https://www.termsfeed.com/live/terms-and-conditions"
              target="_blank"
            >
              📄 Termos de Uso
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              href="https://www.termsfeed.com/live/privacy-policy"
              target="_blank"
            >
              🔒 Política de Privacidade
            </IonButton>

          </IonCardContent>

        </IonCard>

      </div>

    </IonContent>

  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton
} from '@ionic/vue'
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
  max-width: 700px;
  margin: auto;
  padding: 30px;
}

.logo {
  text-align: center;
  font-size: 80px;
  margin-bottom: 20px;
}

.about-card {
  background: rgba(
    255,
    255,
    255,
    0.08
  );

  color: white;

  border-radius: 24px;

  backdrop-filter: blur(10px);
}

h1 {
  text-align: center;
}

.info {
  margin: 25px 0;
  text-align: center;
}

ion-button {
  margin-top: 10px;
}
</style>