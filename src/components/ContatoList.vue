<template>
  <ion-list>
    <template v-if="contatos.length">
      <ion-item-sliding v-for="contato in contatos" :key="contato.id">
        <ion-item>
          <ion-label>
            <h2>{{ contato.nome }}</h2>
            <h3>{{ contato.email }}</h3>
            <h4>{{ contato.telefone }}</h4>
          </ion-label>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="primary" @click="editarContato(contato)">
            Editar</ion-item-option>
          <ion-item-option color="danger" @click="confirmarExclusao(contato)">
            Excluir</ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </template>
<ion-item v-else>
  <ion-label>Nenhum contato encontrado.</ion-label>
</ion-item>
  </ion-list>

  <ion-alert
  :is-open="editAlert.open"
  header="Editar contato"
  :message="editAlert.error"
  :inputs="editInputs"
  :buttons="[
    { text: 'Cancelar', role: 'cancel', handler:
      closeEditAlert },
      { text: 'Salvar', handler: salvarEdicao}
  ]"
  />

  <ion-alert
  :is-open="deleteAlert.open"
  header="Excluir contato"
  :message="Tem certeza que deseja excluir esse contato?"
  :buttons="[
    { text: 'Cancelar', role: 'cancel', handler:
      closeDeleteAlert },
    { text: 'Excluir', role: 'destructive', handler: 
      excluirContato }
  ]"
  />
</template>
 
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import {
  IonAlert,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonLabel,
  IonList,
} from "@ionic/vue";
import {
  listContatos,
  updateContato,
  deleteContatoById,
} from "@/services/database";
 
const contatos = ref<any[]>([]);
const editAlert = ref({
  open: false,
  error: "",
  data: { id: null as number | null, nome: "", email: "", telefone: "" },
});
const deleteAlert = ref({ open: false, contatoId: null as number | null });
 
const editInputs = computed(() => [
  {
    name: "nome",
    type: "text",
    placeholder: "Nome",
    value: editAlert.value.data.nome,
  },
  {
    name: "email",
    type: "email",
    placeholder: "Email",
    value: editAlert.value.data.email,
  },
  {
    name: "telefone",
    type: "tel",
    placeholder: "Telefone",
    value: editAlert.value.data.telefone,
  },
]);
 
async function load() {
  contatos.value = await listContatos();
}
 
function handleContatoSalvo() {
  load();
}
 
function editarContato(contato: any) {
  editAlert.value = {
    open: true,
    error: "",
    data: {
      id: contato.id,
      nome: contato.nome,
      email: contato.email,
      telefone: contato.telefone,
    },
  };
}
 
function confirmarExclusao(contato: any) {
  deleteAlert.value = { open: true, contatoId: contato.id };
}
 
function closeEditAlert() {
    editAlert.value.open = false
    editAlert.value.error = ''
}
 
async function salvarEdicao(values: any) {
 if (!editAlert.value.data.id) {
    return
 }
 
 const nome = values?.nome ?? editAlert.value.data.nome
 const email = values?.email ?? editAlert.value.data.id
 const telefone = values?.telefone ?? editAlert.value.data.telefone
 
 if (!nome || !email) {
    editAlert.value.error = 'nome e email são obrigatórios'
    return false
 }
 
 editAlert.value.error = ''
 await updateContato(editAlert.value.data.id, nome, email, telefone)
 closeEditAlert()
 load()
 return true
}
 
</script>