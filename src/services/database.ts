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

type FiltroSticker = "todas" | "coletadas" | "pendentes";

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
      UNIQUE(user_id, sticker_id),
      FOREIGN KEY(user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
    );
  `);

  initialized = true;
}

function ensureFallbackTables() {
  const keys = ["contatos", "usuarios", "stickers", "user_stickers"];

  for (const key of keys) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  }
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
        };
      });

    if (filtro === "coletadas") {
      return merged.filter((sticker: any) => sticker.coletada);
    }

    if (filtro === "pendentes") {
      return merged.filter((sticker: any) => !sticker.coletada);
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

  const result = await getDb().query(
    `
      SELECT
        s.id,
        s.nome,
        s.selecao,
        s.foto,
        s.raridade,
        COALESCE(us.coletada, 0) as coletada
      FROM stickers s
      LEFT JOIN user_stickers us
        ON s.id = us.sticker_id
       AND us.user_id = ?
      ${where}
      ORDER BY s.id ASC
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
      arr[idx].coletada = arr[idx].coletada ? 0 : 1;
    } else {
      arr.push({
        id: nextFallbackId(arr),
        user_id: userId,
        sticker_id: stickerId,
        coletada: 1,
      });
    }

    localStorage.setItem("user_stickers", JSON.stringify(arr));
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

    return getDb().run(
      `
        UPDATE user_stickers
        SET coletada = ?
        WHERE user_id = ?
          AND sticker_id = ?
      `,
      [atual ? 0 : 1, userId, stickerId],
    );
  }

  return getDb().run(
    `
      INSERT INTO user_stickers (user_id, sticker_id, coletada)
      VALUES (?, ?, 1)
    `,
    [userId, stickerId],
  );
}

export async function getStickerStatsForUser(userId: number | null) {
  await ensureDatabase();

  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem("stickers") || "[]");
    const userStickers = JSON.parse(
      localStorage.getItem("user_stickers") || "[]",
    );

    const coletadas = userStickers.filter(
      (item: any) => item.user_id === userId && item.coletada === 1,
    ).length;

    return {
      total: stickers.length,
      coletadas,
    };
  }

  const result = await getDb().query(
    `
      SELECT
        COUNT(s.id) as total,
        SUM(CASE WHEN COALESCE(us.coletada, 0) = 1 THEN 1 ELSE 0 END) as coletadas
      FROM stickers s
      LEFT JOIN user_stickers us
        ON s.id = us.sticker_id
       AND us.user_id = ?
    `,
    [userId],
  );

  const row = result.values?.[0];

  return {
    total: row?.total || 0,
    coletadas: row?.coletadas || 0,
  };
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
