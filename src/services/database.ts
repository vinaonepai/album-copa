import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";

const dbName = "appdata";
let db: SQLiteDBConnection | null = null;
let initialized = false;
let initializationPromise: Promise<void> | null = null;
let useFallback = false;
const sqliteconnection = new SQLiteConnection(CapacitorSQLite);

type FiltroSticker = "todas" | "coletadas" | "pendentes" | "favoritas";
type OrdenacaoSticker = "cadastro" | "coleta";

type AchievementDefinition = {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  tipo: "total" | "rara" | "brilhante" | "percentual" | "colecao";
  valor: number;
  colecao?: string | null;
};

const achievementDefinitions: AchievementDefinition[] = [
  {
    codigo: "primeira-figurinha",
    nome: "Primeira Figurinha",
    descricao: "Desbloquear ao coletar a primeira figurinha.",
    icone: "medal",
    tipo: "total",
    valor: 1,
  },
  {
    codigo: "iniciante",
    nome: "Iniciante",
    descricao: "Coletar 10 figurinhas.",
    icone: "ribbon",
    tipo: "total",
    valor: 10,
  },
  {
    codigo: "colecionador",
    nome: "Colecionador",
    descricao: "Coletar 25 figurinhas.",
    icone: "albums",
    tipo: "total",
    valor: 25,
  },
  {
    codigo: "album-em-construcao",
    nome: "Album em Construcao",
    descricao: "Coletar 50 figurinhas.",
    icone: "construct",
    tipo: "total",
    valor: 50,
  },
  {
    codigo: "cacador-de-raras",
    nome: "Cacador de Raras",
    descricao: "Coletar 5 figurinhas raras.",
    icone: "sparkles",
    tipo: "rara",
    valor: 5,
  },
  {
    codigo: "especialista-em-raras",
    nome: "Especialista em Raras",
    descricao: "Coletar 15 figurinhas raras.",
    icone: "diamond",
    tipo: "rara",
    valor: 15,
  },
  {
    codigo: "brilho-inicial",
    nome: "Brilho Inicial",
    descricao: "Coletar 3 figurinhas brilhantes.",
    icone: "star",
    tipo: "brilhante",
    valor: 3,
  },
  {
    codigo: "mestre-das-brilhantes",
    nome: "Mestre das Brilhantes",
    descricao: "Coletar 10 figurinhas brilhantes.",
    icone: "trophy",
    tipo: "brilhante",
    valor: 10,
  },
  {
    codigo: "album-quase-completo",
    nome: "Album Quase Completo",
    descricao: "Completar 80% do album.",
    icone: "podium",
    tipo: "percentual",
    valor: 80,
  },
  {
    codigo: "campeao-da-copa",
    nome: "Campeao da Copa",
    descricao: "Completar 100% do album.",
    icone: "football",
    tipo: "percentual",
    valor: 100,
  },
];

async function ensureDatabase() {
  if (initialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = setupDatabase();
  return initializationPromise;
}

async function setupDatabase() {
  try {
    db = await sqliteconnection.createConnection(
      dbName,
      false,
      "no-encryption",
      1,
      false,
    );

    await db.open();
  } catch (err) {
    console.warn("SQLite indisponivel, usando fallback localStorage", err);
    useFallback = true;
    initialized = true;
    ensureFallbackTables();
    return;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      senha TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS stickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      selecao TEXT NOT NULL,
      foto TEXT,
      raridade TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_stickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sticker_id INTEGER NOT NULL,
      coletada INTEGER NOT NULL DEFAULT 0,
      favorite INTEGER NOT NULL DEFAULT 0,
      collected_at TEXT,
      UNIQUE(user_id, sticker_id),
      FOREIGN KEY(user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
    );
  `);

  await ensureColumn("user_stickers", "favorite", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn("user_stickers", "collected_at", "TEXT");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      icone TEXT NOT NULL,
      tipo TEXT NOT NULL,
      valor INTEGER NOT NULL DEFAULT 0,
      colecao TEXT,
      desbloqueada INTEGER NOT NULL DEFAULT 0,
      data_desbloqueio TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      data_desbloqueio TEXT NOT NULL,
      UNIQUE(user_id, achievement_id),
      FOREIGN KEY(user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );
  `);

  await seedAchievements();

  initialized = true;
}

async function ensureColumn(table: string, column: string, definition: string) {
  const result = await getDb().query(`PRAGMA table_info(${table})`);
  const hasColumn = (result.values || []).some((row: any) => row.name === column);

  if (!hasColumn) {
    await getDb().execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function ensureFallbackTables() {
  const keys = [
    "contatos",
    "usuarios",
    "stickers",
    "user_stickers",
    "achievements",
    "user_achievements",
  ];

  for (const key of keys) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  }

  seedFallbackAchievements();
}

function getDb() {
  if (!db) {
    throw new Error("Banco de dados ainda nao inicializado");
  }

  return db;
}

function nextFallbackId(items: Array<{ id: number }>) {
  return Math.max(0, ...items.map((item) => item.id || 0)) + 1;
}

function normalizeText(value: string) {
  return value.trim();
}

function normalizeAchievementCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function seedFallbackAchievements() {
  const arr = JSON.parse(localStorage.getItem("achievements") || "[]");

  for (const achievement of achievementDefinitions) {
    const existing = arr.find((item: any) => item.codigo === achievement.codigo);

    if (existing) {
      existing.nome = achievement.nome;
      existing.descricao = achievement.descricao;
      existing.icone = achievement.icone;
      existing.tipo = achievement.tipo;
      existing.valor = achievement.valor;
      existing.colecao = achievement.colecao || null;
      continue;
    }

    arr.push({
      id: nextFallbackId(arr),
      ...achievement,
      colecao: achievement.colecao || null,
      desbloqueada: 0,
      data_desbloqueio: null,
    });
  }

  localStorage.setItem("achievements", JSON.stringify(arr));
}

async function seedAchievements() {
  for (const achievement of achievementDefinitions) {
    await getDb().run(
      `
        INSERT INTO achievements (
          codigo,
          nome,
          descricao,
          icone,
          tipo,
          valor,
          colecao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(codigo) DO UPDATE SET
          nome = excluded.nome,
          descricao = excluded.descricao,
          icone = excluded.icone,
          tipo = excluded.tipo,
          valor = excluded.valor,
          colecao = excluded.colecao
      `,
      [
        achievement.codigo,
        achievement.nome,
        achievement.descricao,
        achievement.icone,
        achievement.tipo,
        achievement.valor,
        achievement.colecao || null,
      ],
    );
  }
}

async function syncCollectionAchievements() {
  await ensureDatabase();

  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
    const collections = Array.from(
      new Set(stickers.map((sticker: any) => sticker.selecao).filter(Boolean)),
    );

    for (const collection of collections) {
      const codigo = `colecao-${normalizeAchievementCode(String(collection))}`;
      const existing = achievements.find((item: any) => item.codigo === codigo);

      if (existing) {
        existing.nome = `Colecao ${collection}`;
        existing.descricao = `Completar a colecao ${collection}.`;
        continue;
      }

      achievements.push({
        id: nextFallbackId(achievements),
        codigo,
        nome: `Colecao ${collection}`,
        descricao: `Completar a colecao ${collection}.`,
        icone: "shield-checkmark",
        tipo: "colecao",
        valor: 100,
        colecao: collection,
        desbloqueada: 0,
        data_desbloqueio: null,
      });
    }

    localStorage.setItem("achievements", JSON.stringify(achievements));
    return;
  }

  const result = await getDb().query(`
    SELECT DISTINCT selecao
    FROM stickers
    WHERE selecao IS NOT NULL
      AND TRIM(selecao) <> ''
  `);

  for (const row of result.values || []) {
    const colecao = row.selecao;
    const codigo = `colecao-${normalizeAchievementCode(String(colecao))}`;

    await getDb().run(
      `
        INSERT INTO achievements (
          codigo,
          nome,
          descricao,
          icone,
          tipo,
          valor,
          colecao
        )
        VALUES (?, ?, ?, ?, 'colecao', 100, ?)
        ON CONFLICT(codigo) DO UPDATE SET
          nome = excluded.nome,
          descricao = excluded.descricao,
          icone = excluded.icone,
          tipo = excluded.tipo,
          valor = excluded.valor,
          colecao = excluded.colecao
      `,
      [
        codigo,
        `Colecao ${colecao}`,
        `Completar a colecao ${colecao}.`,
        "shield-checkmark",
        colecao,
      ],
    );
  }
}

export async function initDatabase() {
  await ensureDatabase();
}

// Contatos
export async function addContato(
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("contatos") || "[]");
    const id = nextFallbackId(arr);
    arr.push({ id, nome, email, telefone });
    localStorage.setItem("contatos", JSON.stringify(arr));
    return;
  }

  await getDb().run(
    "INSERT INTO contatos (nome, email, telefone) VALUES (?, ?, ?)",
    [nome, email, telefone],
  );
}

export async function listContatos() {
  await ensureDatabase();

  if (useFallback) {
    return JSON.parse(localStorage.getItem("contatos") || "[]");
  }

  const result = await getDb().query("SELECT * FROM contatos");
  return result.values || [];
}

export async function deleteContatoById(id: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("contatos") || "[]").filter(
      (contato: any) => contato.id !== id,
    );
    localStorage.setItem("contatos", JSON.stringify(arr));
    return;
  }

  return getDb().run("DELETE FROM contatos WHERE id = ?", [id]);
}

export async function updateContato(
  id: number,
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("contatos") || "[]");
    const idx = arr.findIndex((contato: any) => contato.id === id);

    if (idx >= 0) {
      arr[idx] = { id, nome, email, telefone };
      localStorage.setItem("contatos", JSON.stringify(arr));
    }

    return;
  }

  await getDb().run(
    "UPDATE contatos SET nome = ?, email = ?, telefone = ? WHERE id = ?",
    [nome, email, telefone, id],
  );
}

export async function findContatoById(id: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("contatos") || "[]");
    return arr.filter((contato: any) => contato.id === id);
  }

  const result = await getDb().query("SELECT * FROM contatos WHERE id = ?", [
    id,
  ]);
  return result.values || [];
}

// Usuarios
export async function addUsuario(
  nome: string,
  email: string,
  telefone: string | null,
  senha: string,
) {
  await ensureDatabase();

  const cleanNome = normalizeText(nome);
  const cleanEmail = normalizeText(email).toLowerCase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("usuarios") || "[]");

    if (arr.some((usuario: any) => usuario.email === cleanEmail)) {
      throw new Error("Email ja cadastrado");
    }

    const id = nextFallbackId(arr);
    arr.push({
      id,
      nome: cleanNome,
      email: cleanEmail,
      telefone,
      senha,
    });
    localStorage.setItem("usuarios", JSON.stringify(arr));
    return { changes: { lastId: id } } as any;
  }

  return getDb().run(
    `
      INSERT INTO usuarios (nome, email, telefone, senha)
      VALUES (?, ?, ?, ?)
    `,
    [cleanNome, cleanEmail, telefone, senha],
  );
}

export async function realizarLogin(email: string, senha: string) {
  await ensureDatabase();

  const cleanEmail = normalizeText(email).toLowerCase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("usuarios") || "[]");
    return (
      arr.find(
        (usuario: any) =>
          usuario.email === cleanEmail && usuario.senha === senha,
      ) || null
    );
  }

  const result = await getDb().query(
    `
      SELECT id, nome, email, telefone
      FROM usuarios
      WHERE email = ?
        AND senha = ?
      LIMIT 1
    `,
    [cleanEmail, senha],
  );

  return result.values?.[0] || null;
}

export async function updateUsuario(
  id: number,
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();

  const cleanNome = normalizeText(nome);
  const cleanEmail = normalizeText(email).toLowerCase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const idx = arr.findIndex((usuario: any) => usuario.id === id);

    if (idx >= 0) {
      arr[idx].nome = cleanNome;
      arr[idx].email = cleanEmail;
      arr[idx].telefone = telefone;
      localStorage.setItem("usuarios", JSON.stringify(arr));
    }

    return;
  }

  return getDb().run(
    `
      UPDATE usuarios
      SET nome = ?,
          email = ?,
          telefone = ?
      WHERE id = ?
    `,
    [cleanNome, cleanEmail, telefone, id],
  );
}

export async function findUsuarioById(id: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuario = arr.find((item: any) => item.id === id);

    if (!usuario) {
      return null;
    }

    const { senha, ...publico } = usuario;
    return publico;
  }

  const result = await getDb().query(
    `
      SELECT id, nome, email, telefone
      FROM usuarios
      WHERE id = ?
    `,
    [id],
  );

  return result.values?.[0] || null;
}

export async function listUsuarios() {
  await ensureDatabase();

  if (useFallback) {
    return JSON.parse(localStorage.getItem("usuarios") || "[]").map(
      ({ senha, ...usuario }: any) => usuario,
    );
  }

  const result = await getDb().query(
    "SELECT id, nome, email, telefone FROM usuarios",
  );
  return result.values || [];
}

export async function deleteUsuarioById(id: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("usuarios") || "[]").filter(
      (usuario: any) => usuario.id !== id,
    );
    localStorage.setItem("usuarios", JSON.stringify(arr));
    return;
  }

  return getDb().run("DELETE FROM usuarios WHERE id = ?", [id]);
}

// Figurinhas
export async function addSticker(
  nome: string,
  selecao: string,
  foto: string | null,
  raridade: string,
) {
  await ensureDatabase();

  const cleanNome = normalizeText(nome);
  const cleanSelecao = normalizeText(selecao);
  const cleanFoto = foto ? normalizeText(foto) : null;
  const cleanRaridade = normalizeText(raridade);

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("stickers") || "[]");
    const id = nextFallbackId(arr);
    arr.push({
      id,
      nome: cleanNome,
      selecao: cleanSelecao,
      foto: cleanFoto,
      raridade: cleanRaridade,
    });
    localStorage.setItem("stickers", JSON.stringify(arr));
    return { changes: { lastId: id } } as any;
  }

  return getDb().run(
    `
      INSERT INTO stickers (nome, selecao, foto, raridade)
      VALUES (?, ?, ?, ?)
    `,
    [cleanNome, cleanSelecao, cleanFoto, cleanRaridade],
  );
}

export async function listStickersForUser(
  userId: number | null,
  busca = "",
  filtro: FiltroSticker = "todas",
  ordenacao: OrdenacaoSticker = "cadastro",
) {
  await ensureDatabase();

  const cleanBusca = normalizeText(busca).toLowerCase();

  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const userStickers = JSON.parse(
      localStorage.getItem("user_stickers") || "[]",
    );

    const merged = stickers
      .filter((sticker: any) => {
        const nome = String(sticker.nome || "").toLowerCase();
        const selecao = String(sticker.selecao || "").toLowerCase();
        return nome.includes(cleanBusca) || selecao.includes(cleanBusca);
      })
      .map((sticker: any) => {
        const status = userStickers.find(
          (item: any) =>
            item.user_id === userId && item.sticker_id === sticker.id,
        );

        return {
          ...sticker,
          coletada: Boolean(status?.coletada),
          favorite: Boolean(status?.favorite),
          collected_at: status?.collected_at || null,
        };
      });

    if (filtro === "coletadas") {
      return merged.filter((sticker: any) => sticker.coletada);
    }

    if (filtro === "pendentes") {
      return merged.filter((sticker: any) => !sticker.coletada);
    }

    if (filtro === "favoritas") {
      return merged.filter((sticker: any) => sticker.favorite);
    }

    if (ordenacao === "coleta") {
      return merged.sort((a: any, b: any) =>
        String(b.collected_at || "").localeCompare(String(a.collected_at || "")),
      );
    }

    return merged;
  }

  const params: any[] = [userId, `%${cleanBusca}%`, `%${cleanBusca}%`];
  let where = `
    WHERE (
      LOWER(s.nome) LIKE ?
      OR LOWER(s.selecao) LIKE ?
    )
  `;

  if (filtro === "coletadas") {
    where += " AND COALESCE(us.coletada, 0) = 1";
  }

  if (filtro === "pendentes") {
    where += " AND COALESCE(us.coletada, 0) = 0";
  }

  if (filtro === "favoritas") {
    where += " AND COALESCE(us.favorite, 0) = 1";
  }

  const orderBy =
    ordenacao === "coleta"
      ? "ORDER BY us.collected_at DESC, s.id ASC"
      : "ORDER BY s.id ASC";

  const result = await getDb().query(
    `
      SELECT
        s.id,
        s.nome,
        s.selecao,
        s.foto,
        s.raridade,
        COALESCE(us.coletada, 0) as coletada,
        COALESCE(us.favorite, 0) as favorite,
        us.collected_at
      FROM stickers s
      LEFT JOIN user_stickers us
        ON s.id = us.sticker_id
       AND us.user_id = ?
      ${where}
      ${orderBy}
    `,
    params,
  );

  return (result.values || []).map((row: any) => ({
    id: row.id,
    nome: row.nome,
    selecao: row.selecao,
    foto: row.foto,
    raridade: row.raridade,
    coletada: Boolean(row.coletada),
    favorite: Boolean(row.favorite),
    collected_at: row.collected_at || null,
  }));
}

export async function toggleUserSticker(userId: number, stickerId: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("user_stickers") || "[]");
    const idx = arr.findIndex(
      (item: any) => item.user_id === userId && item.sticker_id === stickerId,
    );

    if (idx >= 0) {
      const coletada = arr[idx].coletada ? 0 : 1;
      arr[idx].coletada = coletada;
      arr[idx].collected_at = coletada ? new Date().toISOString() : null;
    } else {
      arr.push({
        id: nextFallbackId(arr),
        user_id: userId,
        sticker_id: stickerId,
        coletada: 1,
        favorite: 0,
        collected_at: new Date().toISOString(),
      });
    }

    localStorage.setItem("user_stickers", JSON.stringify(arr));
    await recalculateAchievementsForUser(userId);
    return;
  }

  const existing = await getDb().query(
    `
      SELECT coletada
      FROM user_stickers
      WHERE user_id = ?
        AND sticker_id = ?
      LIMIT 1
    `,
    [userId, stickerId],
  );

  if (existing.values?.length) {
    const atual = existing.values[0].coletada ? 1 : 0;
    const novaColeta = atual ? 0 : 1;

    await getDb().run(
      `
        UPDATE user_stickers
        SET coletada = ?,
            collected_at = ?
        WHERE user_id = ?
          AND sticker_id = ?
      `,
      [novaColeta, novaColeta ? new Date().toISOString() : null, userId, stickerId],
    );
    await recalculateAchievementsForUser(userId);
    return;
  }

  await getDb().run(
    `
      INSERT INTO user_stickers (user_id, sticker_id, coletada, favorite, collected_at)
      VALUES (?, ?, 1, 0, ?)
    `,
    [userId, stickerId, new Date().toISOString()],
  );
  await recalculateAchievementsForUser(userId);
}

export async function toggleFavoriteSticker(userId: number, stickerId: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("user_stickers") || "[]");
    const idx = arr.findIndex(
      (item: any) => item.user_id === userId && item.sticker_id === stickerId,
    );

    if (idx >= 0) {
      arr[idx].favorite = arr[idx].favorite ? 0 : 1;
    } else {
      arr.push({
        id: nextFallbackId(arr),
        user_id: userId,
        sticker_id: stickerId,
        coletada: 0,
        favorite: 1,
        collected_at: null,
      });
    }

    localStorage.setItem("user_stickers", JSON.stringify(arr));
    return;
  }

  const existing = await getDb().query(
    `
      SELECT favorite
      FROM user_stickers
      WHERE user_id = ?
        AND sticker_id = ?
      LIMIT 1
    `,
    [userId, stickerId],
  );

  if (existing.values?.length) {
    await getDb().run(
      `
        UPDATE user_stickers
        SET favorite = ?
        WHERE user_id = ?
          AND sticker_id = ?
      `,
      [existing.values[0].favorite ? 0 : 1, userId, stickerId],
    );
    return;
  }

  await getDb().run(
    `
      INSERT INTO user_stickers (user_id, sticker_id, coletada, favorite, collected_at)
      VALUES (?, ?, 0, 1, NULL)
    `,
    [userId, stickerId],
  );
}

export async function recalculateAchievementsForUser(userId: number) {
  await ensureDatabase();
  await syncCollectionAchievements();

  if (useFallback) {
    const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
    const userAchievements = JSON.parse(
      localStorage.getItem("user_achievements") || "[]",
    );
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const userStickers = JSON.parse(
      localStorage.getItem("user_stickers") || "[]",
    );
    const collectedIds = new Set(
      userStickers
        .filter((item: any) => item.user_id === userId && item.coletada === 1)
        .map((item: any) => item.sticker_id),
    );
    const collectedStickers = stickers.filter((sticker: any) =>
      collectedIds.has(sticker.id),
    );
    const total = stickers.length;
    const collectedTotal = collectedStickers.length;
    const rareTotal = collectedStickers.filter(
      (sticker: any) => String(sticker.raridade).toLowerCase() === "rara",
    ).length;
    const shinyTotal = collectedStickers.filter(
      (sticker: any) => String(sticker.raridade).toLowerCase() === "brilhante",
    ).length;
    const completion = total ? (collectedTotal / total) * 100 : 0;
    let changed = false;

    for (const achievement of achievements) {
      const alreadyUnlocked = userAchievements.some(
        (item: any) =>
          item.user_id === userId && item.achievement_id === achievement.id,
      );

      if (alreadyUnlocked) {
        continue;
      }

      let shouldUnlock = false;

      if (achievement.tipo === "total") {
        shouldUnlock = collectedTotal >= achievement.valor;
      } else if (achievement.tipo === "rara") {
        shouldUnlock = rareTotal >= achievement.valor;
      } else if (achievement.tipo === "brilhante") {
        shouldUnlock = shinyTotal >= achievement.valor;
      } else if (achievement.tipo === "percentual") {
        shouldUnlock = completion >= achievement.valor;
      } else if (achievement.tipo === "colecao" && achievement.colecao) {
        const collectionStickers = stickers.filter(
          (sticker: any) => sticker.selecao === achievement.colecao,
        );
        shouldUnlock =
          collectionStickers.length > 0 &&
          collectionStickers.every((sticker: any) => collectedIds.has(sticker.id));
      }

      if (shouldUnlock) {
        userAchievements.push({
          id: nextFallbackId(userAchievements),
          user_id: userId,
          achievement_id: achievement.id,
          data_desbloqueio: new Date().toISOString(),
        });
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(
        "user_achievements",
        JSON.stringify(userAchievements),
      );
    }

    return;
  }

  const statsResult = await getDb().query(
    `
      SELECT
        COUNT(s.id) as total,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 THEN 1 ELSE 0 END) as coletadas,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 AND LOWER(s.raridade) = 'rara' THEN 1 ELSE 0 END) as raras,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 AND LOWER(s.raridade) = 'brilhante' THEN 1 ELSE 0 END) as brilhantes
      FROM stickers s
      LEFT JOIN user_stickers us
        ON s.id = us.sticker_id
       AND us.user_id = ?
    `,
    [userId],
  );
  const stats = statsResult.values?.[0] || {};
  const total = Number(stats.total || 0);
  const coletadas = Number(stats.coletadas || 0);
  const raras = Number(stats.raras || 0);
  const brilhantes = Number(stats.brilhantes || 0);
  const percentual = total ? (coletadas / total) * 100 : 0;

  const achievementsResult = await getDb().query(`
    SELECT *
    FROM achievements
    ORDER BY id ASC
  `);

  for (const achievement of achievementsResult.values || []) {
    const unlockedResult = await getDb().query(
      `
        SELECT id
        FROM user_achievements
        WHERE user_id = ?
          AND achievement_id = ?
        LIMIT 1
      `,
      [userId, achievement.id],
    );

    if (unlockedResult.values?.length) {
      continue;
    }

    let shouldUnlock = false;

    if (achievement.tipo === "total") {
      shouldUnlock = coletadas >= achievement.valor;
    } else if (achievement.tipo === "rara") {
      shouldUnlock = raras >= achievement.valor;
    } else if (achievement.tipo === "brilhante") {
      shouldUnlock = brilhantes >= achievement.valor;
    } else if (achievement.tipo === "percentual") {
      shouldUnlock = percentual >= achievement.valor;
    } else if (achievement.tipo === "colecao" && achievement.colecao) {
      const collectionResult = await getDb().query(
        `
          SELECT
            COUNT(s.id) as total,
            SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 THEN 1 ELSE 0 END) as coletadas
          FROM stickers s
          LEFT JOIN user_stickers us
            ON s.id = us.sticker_id
           AND us.user_id = ?
          WHERE s.selecao = ?
        `,
        [userId, achievement.colecao],
      );
      const collectionStats = collectionResult.values?.[0] || {};
      const collectionTotal = Number(collectionStats.total || 0);
      const collectionCollected = Number(collectionStats.coletadas || 0);
      shouldUnlock =
        collectionTotal > 0 && collectionCollected >= collectionTotal;
    }

    if (shouldUnlock) {
      await getDb().run(
        `
          INSERT OR IGNORE INTO user_achievements (
            user_id,
            achievement_id,
            data_desbloqueio
          )
          VALUES (?, ?, ?)
        `,
        [userId, achievement.id, new Date().toISOString()],
      );
    }
  }
}

export async function listAchievementsForUser(userId: number) {
  await ensureDatabase();
  await syncCollectionAchievements();
  await recalculateAchievementsForUser(userId);

  if (useFallback) {
    const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
    const userAchievements = JSON.parse(
      localStorage.getItem("user_achievements") || "[]",
    );

    return achievements
      .map((achievement: any) => {
        const unlocked = userAchievements.find(
          (item: any) =>
            item.user_id === userId && item.achievement_id === achievement.id,
        );

        return {
          id: achievement.id,
          nome: achievement.nome,
          descricao: achievement.descricao,
          icone: achievement.icone,
          desbloqueada: Boolean(unlocked),
          data_desbloqueio: unlocked?.data_desbloqueio || null,
        };
      })
      .sort((a: any, b: any) => Number(b.desbloqueada) - Number(a.desbloqueada));
  }

  const result = await getDb().query(
    `
      SELECT
        a.id,
        a.nome,
        a.descricao,
        a.icone,
        CASE WHEN ua.id IS NULL THEN 0 ELSE 1 END as desbloqueada,
        ua.data_desbloqueio
      FROM achievements a
      LEFT JOIN user_achievements ua
        ON a.id = ua.achievement_id
       AND ua.user_id = ?
      ORDER BY desbloqueada DESC, a.id ASC
    `,
    [userId],
  );

  return (result.values || []).map((achievement: any) => ({
    id: achievement.id,
    nome: achievement.nome,
    descricao: achievement.descricao,
    icone: achievement.icone,
    desbloqueada: Boolean(achievement.desbloqueada),
    data_desbloqueio: achievement.data_desbloqueio || null,
  }));
}

export async function getStickerStatsForUser(userId: number | null) {
  await ensureDatabase();

  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const userStickers = JSON.parse(
      localStorage.getItem("user_stickers") || "[]",
    );

    const coletadasItems = userStickers.filter(
      (item: any) => item.user_id === userId && item.coletada === 1,
    );
    const coletadasIds = new Set(coletadasItems.map((item: any) => item.sticker_id));
    const coletadas = coletadasItems.length;
    const rarasColetadas = stickers.filter(
      (sticker: any) =>
        coletadasIds.has(sticker.id) &&
        String(sticker.raridade).toLowerCase() === "rara",
    ).length;
    const brilhantesColetadas = stickers.filter(
      (sticker: any) =>
        coletadasIds.has(sticker.id) &&
        String(sticker.raridade).toLowerCase() === "brilhante",
    ).length;

    return buildStats(stickers.length, coletadas, rarasColetadas, brilhantesColetadas);
  }

  const result = await getDb().query(
    `
      SELECT
        COUNT(s.id) as total,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 THEN 1 ELSE 0 END) as coletadas,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 AND LOWER(s.raridade) = 'rara' THEN 1 ELSE 0 END) as rarasColetadas,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 AND LOWER(s.raridade) = 'brilhante' THEN 1 ELSE 0 END) as brilhantesColetadas
      FROM stickers s
      LEFT JOIN user_stickers us
        ON s.id = us.sticker_id
       AND us.user_id = ?
    `,
    [userId],
  );

  const row = result.values?.[0];

  return buildStats(
    Number(row?.total || 0),
    Number(row?.coletadas || 0),
    Number(row?.rarasColetadas || 0),
    Number(row?.brilhantesColetadas || 0),
  );
}

function buildStats(
  total: number,
  coletadas: number,
  rarasColetadas: number,
  brilhantesColetadas: number,
) {
  const faltantes = Math.max(0, total - coletadas);
  const comunsColetadas = Math.max(0, coletadas - rarasColetadas - brilhantesColetadas);
  const pontuacao =
    comunsColetadas + rarasColetadas * 5 + brilhantesColetadas * 10;
  const percentual = total ? coletadas / total : 0;
  const ranking = getRanking(pontuacao);

  return {
    total,
    coletadas,
    faltantes,
    rarasColetadas,
    brilhantesColetadas,
    percentual,
    pontuacao,
    ...ranking,
  };
}

function getRanking(pontuacao: number) {
  if (pontuacao > 500) {
    return {
      nivel: "Diamante",
      proximoNivel: "Maximo",
      pontosProximoNivel: pontuacao,
      progressoNivel: 1,
    };
  }

  if (pontuacao >= 251) {
    return {
      nivel: "Ouro",
      proximoNivel: "Diamante",
      pontosProximoNivel: 501,
      progressoNivel: (pontuacao - 251) / 250,
    };
  }

  if (pontuacao >= 101) {
    return {
      nivel: "Prata",
      proximoNivel: "Ouro",
      pontosProximoNivel: 251,
      progressoNivel: (pontuacao - 101) / 150,
    };
  }

  return {
    nivel: "Bronze",
    proximoNivel: "Prata",
    pontosProximoNivel: 101,
    progressoNivel: pontuacao / 101,
  };
}

export async function listRecentCollectedStickers(userId: number, limit = 10) {
  await ensureDatabase();

  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const userStickers = JSON.parse(
      localStorage.getItem("user_stickers") || "[]",
    );

    return userStickers
      .filter((item: any) => item.user_id === userId && item.coletada === 1)
      .sort((a: any, b: any) =>
        String(b.collected_at || "").localeCompare(String(a.collected_at || "")),
      )
      .slice(0, limit)
      .map((item: any) => ({
        ...stickers.find((sticker: any) => sticker.id === item.sticker_id),
        collected_at: item.collected_at || null,
      }))
      .filter((item: any) => item.id);
  }

  const result = await getDb().query(
    `
      SELECT
        s.id,
        s.nome,
        s.selecao,
        s.raridade,
        s.foto,
        us.collected_at
      FROM user_stickers us
      INNER JOIN stickers s
        ON s.id = us.sticker_id
      WHERE us.user_id = ?
        AND us.coletada = 1
      ORDER BY us.collected_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );

  return result.values || [];
}

export async function getUserCollectedCount(userId: number) {
  await ensureDatabase();

  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem("user_stickers") || "[]");
    return arr.filter(
      (item: any) => item.user_id === userId && item.coletada === 1,
    ).length;
  }

  const result = await getDb().query(
    `
      SELECT COUNT(*) as total
      FROM user_stickers
      WHERE user_id = ?
        AND coletada = 1
    `,
    [userId],
  );

  return result.values?.[0]?.total || 0;
}
