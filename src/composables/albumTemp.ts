import { computed, ref, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import {
  addSticker,
  getStickerStatsForUser,
  listStickersForUser,
  toggleUserSticker,
} from "@/services/database";

const lista = ref<any[]>([]);
const totalFigurinhas = ref(0);
const totalColetadas = ref(0);

export function useAlbum() {
  const { usuarioLogado } = useAuth();

  const busca = ref("");

  const filtro = ref<"todas" | "coletadas" | "pendentes">("todas");

  async function load() {
    const userId = usuarioLogado.value?.id || null;
    const items = await listStickersForUser(userId, busca.value, filtro.value);
    const stats = await getStickerStatsForUser(userId);

    lista.value = items;
    totalFigurinhas.value = stats.total;
    totalColetadas.value = stats.coletadas;
  }

  // recarrega quando busca/filtro mudam
  watch([busca, filtro], () => {
    load();
  });

  // recarrega quando usuário muda (login/logout)
  watch(
    () => usuarioLogado.value && usuarioLogado.value.id,
    () => {
      load();
    }
  );

  const marcarColetada = async (id: number) => {
    const userId = usuarioLogado.value?.id;
    if (!userId) return;

    await toggleUserSticker(userId, id);
    await load();
  };

  const cadastrarSticker = async (
    nome: string,
    selecao: string,
    foto: string | null,
    raridade: string,
  ) => {
    await addSticker(nome, selecao, foto, raridade);
    await load();
  };

  const filtradas = computed(() => lista.value);

  const coletadas = computed(() => lista.value.filter((f) => f.coletada));

  const progresso = computed(() => {
    if (!totalFigurinhas.value) return 0;
    return totalColetadas.value / totalFigurinhas.value;
  });

  // carregamento inicial
  load();

  return {
    lista,
    busca,
    filtro,
    filtradas,
    coletadas,
    totalFigurinhas,
    totalColetadas,
    progresso,
    marcarColetada,
    cadastrarSticker,
    recarregar: load,
  };
}
