import { computed, ref } from "vue";
import { stickers } from "@/data/stickers";

const lista = ref(stickers);

export function useAlbum() {

  const busca = ref("");

  const filtro = ref("todas");

  const marcarColetada = (id: number) => {
    const figurinha = lista.value.find(
      (f) => f.id === id
    );

    if (figurinha) {
      figurinha.coletada = !figurinha.coletada;
    }
  };

  const filtradas = computed(() => {

    let resultado = lista.value.filter(
      (item) =>
        item.nome
          .toLowerCase()
          .includes(busca.value.toLowerCase()) ||
        item.selecao
          .toLowerCase()
          .includes(busca.value.toLowerCase())
    );

    if (filtro.value === "coletadas") {
      resultado = resultado.filter(
        (f) => f.coletada
      );
    }

    if (filtro.value === "pendentes") {
      resultado = resultado.filter(
        (f) => !f.coletada
      );
    }

    return resultado;
  });

  const coletadas = computed(() =>
    lista.value.filter((f) => f.coletada)
  );

  return {
    lista,
    busca,
    filtro,
    filtradas,
    coletadas,
    marcarColetada,
  };
}