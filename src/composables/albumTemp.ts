import { computed, ref, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import {
  listStickersForUser,
  toggleUserSticker,
} from "@/services/database";

const lista = ref<any[]>([]);

export function useAlbum() {
  const { usuarioLogado } = useAuth();

  const busca = ref("");

  const filtro = ref("todas");

  async function load() {
    const userId = usuarioLogado.value?.id || null;
    const items = await listStickersForUser(userId, busca.value, filtro.value);
    lista.value = items;
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
    // Atualiza localmente
    const item = lista.value.find((f) => f.id === id);
    if (item) item.coletada = !item.coletada;
  };

  const filtradas = computed(() => lista.value);

  const coletadas = computed(() => lista.value.filter((f) => f.coletada));

  // carregamento inicial
  load();

  return {
    lista,
    busca,
    filtro,
    filtradas,
    coletadas,
    marcarColetada,
  };
}