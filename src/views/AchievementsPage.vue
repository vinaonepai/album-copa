<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>Conquistas</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div class="hero">
        <h1>Minhas Conquistas</h1>
        <p>Insignias desbloqueadas conforme sua evolucao no album</p>
      </div>

      <div class="conteudo">
        <IonCard class="resumo-card">
          <IonCardContent>
            <div class="resumo-topo">
              <div>
                <h2>Progresso</h2>
                <p>{{ desbloqueadas }} de {{ conquistas.length }} conquistas</p>
              </div>

              <IonBadge color="success">
                {{ Math.round(progresso * 100) }}%
              </IonBadge>
            </div>

            <IonProgressBar :value="progresso" />
          </IonCardContent>
        </IonCard>

        <div class="grid">
          <IonCard
            v-for="conquista in conquistas"
            :key="conquista.id"
            class="conquista-card"
            :class="{ bloqueada: !conquista.desbloqueada }"
          >
            <IonCardContent>
              <div class="card-topo">
                <div class="icone-wrap">
                  <IonIcon :icon="iconeConquista(conquista.icone)" />
                </div>

                <IonBadge :color="conquista.desbloqueada ? 'success' : 'medium'">
                  {{ conquista.desbloqueada ? "Desbloqueada" : "Bloqueada" }}
                </IonBadge>
              </div>

              <h2>{{ conquista.nome }}</h2>
              <p>{{ conquista.descricao }}</p>

              <span class="data">
                {{ dataDesbloqueio(conquista.data_desbloqueio) }}
              </span>
            </IonCardContent>
          </IonCard>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from "@ionic/vue";
import {
  albumsOutline,
  constructOutline,
  diamondOutline,
  footballOutline,
  medalOutline,
  podiumOutline,
  ribbonOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  starOutline,
  trophyOutline,
} from "ionicons/icons";
import { computed, ref } from "vue";

import { useAuth } from "@/composables/useAuth";
import { listAchievementsForUser } from "@/services/database";

type Achievement = {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  data_desbloqueio: string | null;
};

const { usuarioLogado } = useAuth();
const conquistas = ref<Achievement[]>([]);

const icones: Record<string, string> = {
  albums: albumsOutline,
  construct: constructOutline,
  diamond: diamondOutline,
  football: footballOutline,
  medal: medalOutline,
  podium: podiumOutline,
  ribbon: ribbonOutline,
  "shield-checkmark": shieldCheckmarkOutline,
  sparkles: sparklesOutline,
  star: starOutline,
  trophy: trophyOutline,
};

const desbloqueadas = computed(
  () => conquistas.value.filter((conquista) => conquista.desbloqueada).length,
);

const progresso = computed(() => {
  if (!conquistas.value.length) return 0;
  return desbloqueadas.value / conquistas.value.length;
});

async function carregarConquistas() {
  const userId = usuarioLogado.value?.id;

  if (!userId) {
    conquistas.value = [];
    return;
  }

  conquistas.value = await listAchievementsForUser(userId);
}

function iconeConquista(nome: string) {
  return icones[nome] || medalOutline;
}

function dataDesbloqueio(data: string | null) {
  if (!data) {
    return "Ainda nao desbloqueada";
  }

  return `Desbloqueada em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data))}`;
}

onIonViewWillEnter(() => {
  carregarConquistas();
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

.hero {
  background: linear-gradient(135deg, #0ea5e9, #22c55e);
  color: white;
  padding: 30px;
  text-align: center;
}

.hero h1 {
  font-size: 32px;
  margin: 0;
}

.hero p {
  margin: 10px 0 0;
}

.conteudo {
  padding: 20px;
}

.resumo-card,
.conquista-card {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  margin-bottom: 20px;
}

.resumo-card,
.conquista-card {
  border-radius: 8px;
}

.resumo-topo,
.card-topo {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.resumo-card h2,
.conquista-card h2 {
  margin: 0;
}

.resumo-card p,
.conquista-card p {
  color: #cbd5e1;
  line-height: 1.45;
}

.grid {
  display: grid;
  gap: 16px;
}

.icone-wrap {
  align-items: center;
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid rgba(134, 239, 172, 0.35);
  border-radius: 8px;
  display: flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.icone-wrap ion-icon {
  color: #86efac;
  font-size: 28px;
}

.bloqueada {
  opacity: 0.58;
}

.bloqueada .icone-wrap {
  background: rgba(148, 163, 184, 0.16);
  border-color: rgba(203, 213, 225, 0.25);
}

.bloqueada .icone-wrap ion-icon {
  color: #cbd5e1;
}

.data {
  color: #e2e8f0;
  display: block;
  font-size: 13px;
  margin-top: 14px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
