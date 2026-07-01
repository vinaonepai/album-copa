<template>
<ion-list>
    <ion-item>
            <ion-label>
                Cadastro de Contato
            </ion-label>
    </ion-item>
 
    <ion-item>
        <Ion-label position="stacked">Nome</Ion-label>
        <ion-input v-model="form.nome" required />
    </ion-item>
    <ion-note color="danger" v-if="errors.nome">{{ errors.nome }}</ion-note>
   
    <ion-item>
        <Ion-label position="stacked">Email</Ion-label>
        <ion-input type="email" v-model="form.email" required />
    </ion-item>
    <ion-note color="danger" v-if="errors.email">{{ errors.email }}</ion-note>
 
    <ion-item>
        <ion-label position="stacked">Telefone</ion-label>
        <Ion-input type="tel" v-model="form.telefone" />
    </ion-item>
 
    <ion-button expand="block" type="button" @click="salvarContato">Salvar</ion-button>
 
    <ion-toast :is-open="toast.show" :message="toast.message" duration="2000" @ionDismiss="toast.show = false" />
</ion-list>
</template>
 
<script setup lang="ts">
import { IonList, IonItem, IonLabel, IonInput, IonButton, IonToast } from '@ionic/vue';
import { reactive } from 'vue'
import { addContato } from '@/services/database'
 
const form = reactive({nome: '', email: '', telefone: ''})
const toast = reactive({show: false, message: ''})
const errors = reactive({nome: '', email: ''})
 
function clearErrors() {
    errors.nome = ''
    errors.email = ''
}
 
async function salvarContato() {
    clearErrors()
 
    if (!form.nome || !form.email) {
        if (!form.nome) {
            errors.nome = 'Nome é obrigatório.'
        }
        if (!form.email) {
            errors.email = 'Preencha os campos obrigatórios.'
        }
        toast.show = true
        toast.message = 'Preencha os campos obrigatórios.'
        return
    }
        await addContato(form.nome, form.email, form.telefone)
 
        form.nome = ''
        form.email = ''
        form.telefone = ''
        toast.show = true
        toast.message = 'Contato salvo com sucesso.'
        window.dispatchEvent(new CustomEvent('contato-salvo'))
    }
</script>