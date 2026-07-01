<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cadastrar Contato</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Cadastrar Contato</ion-title>
        </ion-toolbar>
      </ion-header>

      <ContatoForm />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/vue';

import ContatoForm from '@/components/ContatoForm.vue';
</script>Implementar o cadastro e login, com persistência em banco de dados.
Implementar  as figurinhas em banco de dados que os status coletados e não coletados sejam persistidos em banco de dados. os Filtros, busquem pelo banco de dados.
Não pode ter dados fixos no banco de dados.