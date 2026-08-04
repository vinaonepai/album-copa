<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="toolbar-premium">
        <IonTitle>Estatisticas</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <main class="estatisticas">
        <section class="metricas">
          <IonCard
            v-for="metrica in metricas"
            :key="metrica.rotulo"
            class="metrica-card"
          >
            <IonCardContent>
              <IonBadge :color="metrica.cor">
                {{ metrica.rotulo }}
              </IonBadge>

              <strong>{{ metrica.valor }}</strong>
            </IonCardContent>
          </IonCard>
        </section>

        <IonCard class="painel-card">
          <IonCardContent>
            <div class="card-cabecalho">
              <div>
                <h2>Conclusao do album</h2>
                <p>{{ Math.round(stats.percentual * 100) }}% completo</p>
              </div>

              <IonBadge color="success">
                {{ stats.coletadas }} / {{ stats.total }}
              </IonBadge>
            </div>

            <IonProgressBar :value="stats.percentual" />
          </IonCardContent>
        </IonCard>

        <IonCard class="painel-card">
          <IonCardContent>
            <div class="card-cabecalho">
              <div>
                <h2>Ranking de colecionador</h2>
                <p>{{ stats.pontuacao }} pontos</p>
              </div>

              <IonBadge color="warning">
                {{ stats.nivel }}
              </IonBadge>
            </div>

            <IonProgressBar :value="stats.progressoNivel" />

            <p class="proximo-nivel">
              Proximo nivel: {{ stats.proximoNivel }}
              <span v-if="stats.proximoNivel !== 'Maximo'">
                com {{ stats.pontosProximoNivel }} pontos
              </span>
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard class="painel-card">
          <IonCardContent>
            <h2>Ultimas coletas</h2>

            <IonList
              v-if="ultimas.length"
              lines="full"
            >
              <IonItem
                v-for="item in ultimas"
                :key="item.id"
              >
                <IonLabel>
                  <h3>{{ item.nome }}</h3>
                  <p>{{ item.selecao }} - {{ item.raridade }}</p>
                  <p>{{ formatarData(item.collected_at) }}</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <p
              v-else
              class="vazio"
            >
              Nenhuma coleta registrada ainda.
            </p>
          </IonCardContent>
        </IonCard>
      </main>
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
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from "@ionic/vue";
import { computed, ref } from "vue";

import { useAuth } from "@/composables/useAuth";
import {
  getStickerStatsForUser,
  listRecentCollectedStickers,
} from "@/services/database";

type Stats = Awaited<ReturnType<typeof getStickerStatsForUser>>;

const { usuarioLogado } = useAuth();

const stats = ref<Stats>({
  total: 0,
  coletadas: 0,
  faltantes: 0,
  rarasColetadas: 0,
  brilhantesColetadas: 0,
  percentual: 0,
  pontuacao: 0,
  nivel: "Bronze",
  proximoNivel: "Prata",
  pontosProximoNivel: 101,
  progressoNivel: 0,
});
const ultimas = ref<any[]>([]);

const metricas = computed(() => [
  { rotulo: "Total", valor: stats.value.total, cor: "primary" },
  { rotulo: "Coletadas", valor: stats.value.coletadas, cor: "success" },
  { rotulo: "Faltantes", valor: stats.value.faltantes, cor: "warning" },
  { rotulo: "Raras", valor: stats.value.rarasColetadas, cor: "tertiary" },
  { rotulo: "Brilhantes", valor: stats.value.brilhantesColetadas, cor: "danger" },
  { rotulo: "Pontos", valor: stats.value.pontuacao, cor: "medium" },
]);

async function carregar() {
  const userId = usuarioLogado.value?.id;

  if (!userId) {
    return;
  }

  stats.value = await getStickerStatsForUser(userId);
  ultimas.value = await listRecentCollectedStickers(userId, 10);
}

function formatarData(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

onIonViewWillEnter(() => {
  carregar();
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

.estatisticas {
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 1100px;
  padding: 18px 16px calc(env(safe-area-inset-bottom) + 82px);
}

.metricas {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}

.metrica-card,
.painel-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  color: white;
}

.metrica-card ion-card-content {
  display: grid;
  gap: 12px;
}

.metrica-card strong {
  font-size: 30px;
}

.card-cabecalho {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.card-cabecalho h2,
.painel-card h2 {
  margin: 0;
}

.card-cabecalho p,
.proximo-nivel,
.vazio {
  color: #cbd5e1;
}

ion-progress-bar {
  height: 12px;
}

ion-list {
  background: transparent;
}

ion-item {
  --background: transparent;
  --color: white;
}

ion-item p {
  color: #cbd5e1;
}

@media (max-width: 760px) {
  .estatisticas {
    padding: 16px;
  }

  .metricas {
    grid-template-columns: 1fr 1fr;
  }

  .card-cabecalho {
    display: grid;
  }
}
</style>
