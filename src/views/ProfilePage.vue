<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>Perfil</IonTitle>

        <IonButtons slot="end">
          <IonButton @click="abrirEdicao">
            <IonIcon
              slot="icon-only"
              :icon="createOutline"
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <main class="perfil">
        <section class="painel-usuario">
          <div class="avatar">
            {{ iniciais }}
          </div>

          <div class="identidade">
            <IonBadge color="success">Colecionador ativo</IonBadge>

            <h1>{{ usuarioLogado?.nome || "Usuario" }}</h1>

            <p>
              <IonIcon :icon="mailOutline" />
              {{ usuarioLogado?.email }}
            </p>
          </div>
        </section>

        <section class="metricas">
          <div class="metrica">
            <IonIcon :icon="imagesOutline" />
            <strong>{{ totalColetadas }}</strong>
            <span>Obtidas</span>
          </div>

          <div class="metrica">
            <IonIcon :icon="statsChartOutline" />
            <strong>{{ Math.round(progresso * 100) }}%</strong>
            <span>Album</span>
          </div>

          <div class="metrica">
            <IonIcon :icon="trophyOutline" />
            <strong>{{ conquistasDesbloqueadas }}</strong>
            <span>Conquistas</span>
          </div>
        </section>

        <IonCard class="progresso-card">
          <IonCardContent>
            <div class="card-cabecalho">
              <div>
                <h2>Progresso do album</h2>
                <p>{{ totalColetadas }} de {{ totalFigurinhas }} figurinhas</p>
              </div>

              <IonBadge color="primary">
                {{ totalPendentes }} pendentes
              </IonBadge>
            </div>

            <IonProgressBar :value="progresso" />
          </IonCardContent>
        </IonCard>

        <IonCard class="acoes-card">
          <IonCardContent>
            <IonButton
              expand="block"
              color="success"
              router-link="/tabs/conquistas"
            >
              <IonIcon
                slot="start"
                :icon="trophyOutline"
              />
              Ver conquistas
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              color="light"
              @click="abrirEdicao"
            >
              <IonIcon
                slot="start"
                :icon="personCircleOutline"
              />
              Editar perfil
            </IonButton>

            <IonButton
              expand="block"
              color="danger"
              @click="mostrarAlerta = true"
            >
              <IonIcon
                slot="start"
                :icon="logOutOutline"
              />
              Sair da conta
            </IonButton>
          </IonCardContent>
        </IonCard>
      </main>

      <IonModal :is-open="editando" @didDismiss="editando = false">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Editar perfil</IonTitle>

            <IonButtons slot="end">
              <IonButton @click="editando = false">Fechar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div class="modal-conteudo">
            <IonList inset>
              <IonItem>
                <IonInput
                  v-model="nomeEditado"
                  label="Nome"
                  label-placement="floating"
                />
              </IonItem>

              <IonItem>
                <IonInput
                  v-model="emailEditado"
                  type="email"
                  label="Email"
                  label-placement="floating"
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              color="success"
              @click="salvarPerfil"
            >
              Salvar alteracoes
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        :is-open="mostrarAlerta"
        header="Confirmar saida"
        message="Tem certeza que deseja sair da conta?"
        :buttons="[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Sair',
            role: 'destructive',
            handler: sair
          }
        ]"
        @didDismiss="mostrarAlerta = false"
      />

      <IonToast
        :is-open="mostrarToast"
        message="Perfil atualizado"
        :duration="1800"
        color="success"
        @didDismiss="mostrarToast = false"
      />
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToast,
  IonToolbar,
  onIonViewWillEnter,
} from "@ionic/vue";
import {
  createOutline,
  imagesOutline,
  logOutOutline,
  mailOutline,
  personCircleOutline,
  statsChartOutline,
  trophyOutline,
} from "ionicons/icons";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useAlbum } from "@/composables/albumTemp";
import { useAuth } from "@/composables/useAuth";
import {
  listAchievementsForUser,
  updateUsuario,
} from "@/services/database";

const router = useRouter();

const { usuarioLogado, logout } = useAuth();

const { totalFigurinhas, totalColetadas, progresso, recarregar } = useAlbum();

const conquistasDesbloqueadas = ref(0);
const editando = ref(false);
const emailEditado = ref("");
const mostrarAlerta = ref(false);
const mostrarToast = ref(false);
const nomeEditado = ref("");

const iniciais = computed(() => {
  const nome = usuarioLogado.value?.nome || "Usuario";
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
});

const totalPendentes = computed(() =>
  Math.max(0, totalFigurinhas.value - totalColetadas.value),
);

async function carregarResumo() {
  await recarregar();

  const userId = usuarioLogado.value?.id;

  if (!userId) {
    conquistasDesbloqueadas.value = 0;
    return;
  }

  const conquistas = await listAchievementsForUser(userId);
  conquistasDesbloqueadas.value = conquistas.filter(
    (conquista: { desbloqueada: boolean }) => conquista.desbloqueada,
  ).length;
}

function abrirEdicao() {
  nomeEditado.value = usuarioLogado.value?.nome || "";
  emailEditado.value = usuarioLogado.value?.email || "";
  editando.value = true;
}

async function salvarPerfil() {
  const userId = usuarioLogado.value?.id;

  if (!userId || !nomeEditado.value.trim() || !emailEditado.value.trim()) {
    return;
  }

  await updateUsuario(
    userId,
    nomeEditado.value,
    emailEditado.value,
    "",
  );

  usuarioLogado.value = {
    ...usuarioLogado.value,
    id: userId,
    nome: nomeEditado.value.trim(),
    email: emailEditado.value.trim().toLowerCase(),
  };

  editando.value = false;
  mostrarToast.value = true;
}

function sair() {
  logout();
  router.push("/login");
}

onIonViewWillEnter(() => {
  carregarResumo();
});
</script>

<style scoped>
ion-content {
  --background: #0f172a;
}

.toolbar-premium {
  --background: #111827;
  --color: white;
}

.perfil {
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 980px;
  padding: 22px;
}

.painel-usuario {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(14, 165, 233, 0.24), rgba(34, 197, 94, 0.2)),
    #111827;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  color: white;
  display: grid;
  gap: 18px;
  grid-template-columns: 96px 1fr;
  padding: 22px;
}

.avatar {
  align-items: center;
  background: linear-gradient(135deg, #22c55e, #38bdf8);
  border-radius: 50%;
  box-shadow: 0 16px 38px rgba(2, 6, 23, 0.34);
  color: #052e16;
  display: flex;
  font-size: 32px;
  font-weight: 800;
  height: 96px;
  justify-content: center;
  width: 96px;
}

.identidade {
  min-width: 0;
}

.identidade h1 {
  font-size: 30px;
  margin: 12px 0 8px;
  overflow-wrap: anywhere;
}

.identidade p {
  align-items: center;
  color: #dbeafe;
  display: flex;
  gap: 8px;
  margin: 0;
  overflow-wrap: anywhere;
}

.metricas {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}

.metrica {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  color: white;
  display: grid;
  gap: 6px;
  min-height: 118px;
  padding: 16px;
}

.metrica ion-icon {
  color: #86efac;
  font-size: 24px;
}

.metrica strong {
  font-size: 28px;
}

.metrica span {
  color: #cbd5e1;
  font-size: 13px;
}

.progresso-card,
.acoes-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
}

.card-cabecalho {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.card-cabecalho h2 {
  margin: 0;
}

.card-cabecalho p {
  color: #cbd5e1;
  margin: 8px 0 18px;
}

ion-progress-bar {
  height: 12px;
}

.acoes-card ion-button + ion-button {
  margin-top: 10px;
}

.modal-conteudo {
  padding: 18px;
}

@media (max-width: 640px) {
  .perfil {
    padding: 16px;
  }

  .painel-usuario {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .identidade p {
    justify-content: center;
  }

  .metricas {
    grid-template-columns: 1fr;
  }

  .card-cabecalho {
    display: grid;
  }
}
</style>
