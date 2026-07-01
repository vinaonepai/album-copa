import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";

const dbName = "appdata";
let db: SQLiteDBConnection | null = null;
let initialized = false;
let useFallback = false;
const sqliteconnection = new SQLiteConnection(CapacitorSQLite);

async function ensureDatabase() {
  if (initialized && db) {
    return;
  }

  try {
    if (!db) {
      db = await sqliteconnection.createConnection(
        dbName,
        false,
        "no-encryption",
        1,
        false,
      );
    }

    await db.open();
  } catch (err) {
    // Capacitator web: jeep-sqlite pode não estar presente.
    console.warn('SQLite não disponível, habilitando fallback (localStorage)', err);
    useFallback = true;
    initialized = true;
    return;
  }

  // Tabela de contatos (mantida)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT
    );
  `);

  // Tabela de usuários (ajustada para usar email)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      senha TEXT
    );
  `);

  // Tabela de figurinhas
  await db.execute(`
    CREATE TABLE IF NOT EXISTS stickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      selecao TEXT,
      foto TEXT,
      raridade TEXT
    );
  `);

  // Associação usuário <-> figurinha com status
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_stickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sticker_id INTEGER NOT NULL,
      coletada INTEGER DEFAULT 0,
      UNIQUE(user_id, sticker_id)
    );
  `);

  initialized = true;
}

function getDb() {
  if (!db) {
    throw new Error("Banco de dados ainda não inicializado");
  }
  return db;
}

export async function initDatabase() {
  try {
    await ensureDatabase();
    if (useFallback) {
      const keys = ['contatos','usuarios','stickers','user_stickers'];
      for (const k of keys) {
        if (!localStorage.getItem(k)) {
          localStorage.setItem(k, JSON.stringify([]));
        }
      }
    }
    // Em ambiente de desenvolvimento, popular as figurinhas a partir dos dados locais
    try {
      // import.meta.env.DEV existe em Vite; protege com typeof para evitar erros
      if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
        // verifica se já existem figurinhas
        let count = 0;
        if (useFallback) {
          count = JSON.parse(localStorage.getItem('stickers') || '[]').length;
        } else {
          const res = await getDb().query('SELECT COUNT(*) as c FROM stickers');
          count = res.values?.[0]?.c || 0;
        }

        if (count === 0) {
          const mod = await import('@/data/stickers');
          const seed: any[] = mod.stickers || [];
          for (const s of seed) {
            // foto é um caminho resolvido pelo bundler; armazenamos a string
            await addSticker(s.nome, s.selecao, s.foto as any, s.raridade);
          }
        }
      }
    } catch (seedErr) {
      console.warn('Seed de figurinhas falhou', seedErr);
    }
  } catch (error) {
    console.error("Erro ao iniciar DB", error);
    throw error;
  }
}

// Contatos (mantido)
export async function addContato(
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();
  if (useFallback) {
    const raw = localStorage.getItem('contatos') || '[]';
    const arr = JSON.parse(raw);
    const id = (arr.map((a: any) => a.id).sort((a: number,b: number)=>b-a)[0] || 0) + 1;
    arr.push({ id, nome, email, telefone });
    localStorage.setItem('contatos', JSON.stringify(arr));
    return;
  }
  const query = "INSERT INTO contatos (nome, email, telefone) VALUES (?, ?, ?)";

  await getDb().run(query, [nome, email, telefone]);
}

export async function listContatos() {
  await ensureDatabase();
  if (useFallback) {
    return JSON.parse(localStorage.getItem('contatos') || '[]');
  }
  const result = await getDb().query("SELECT * FROM contatos");
  return result.values || [];
}

export async function deleteContatoById(id: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('contatos') || '[]').filter((c: any) => c.id !== id);
    localStorage.setItem('contatos', JSON.stringify(arr));
    return;
  }
  const query = "DELETE FROM contatos WHERE id = ?";
  return await getDb().run(query, [id]);
}

export async function updateContato(
  id: number,
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('contatos') || '[]');
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      arr[idx] = { id, nome, email, telefone };
      localStorage.setItem('contatos', JSON.stringify(arr));
    }
    return;
  }
  const query = "UPDATE contatos SET nome = ?, email = ?, telefone = ? WHERE id = ?";

  await getDb().run(query, [nome, email, telefone, id]);
}

export async function findContatoById(id: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('contatos') || '[]');
    return arr.filter((c: any) => c.id === id);
  }
  const query = "SELECT * FROM contatos WHERE id = ?";

  const result = await getDb().query(query, [id]);

  return result.values || [];
}

// Usuários
export async function addUsuario(
  nome: string,
  email: string,
  telefone: string | null,
  senha: string,
) {
  await ensureDatabase();
  if (useFallback) {
    const raw = localStorage.getItem('usuarios') || '[]';
    const arr = JSON.parse(raw);
    // checar duplicado por email
    if (arr.find((u: any) => u.email === email)) {
      const err: any = new Error('Email já cadastrado');
      err.code = 'SQLITE_CONSTRAINT';
      throw err;
    }
    const id = (arr.map((a: any) => a.id).sort((a: number,b: number)=>b-a)[0] || 0) + 1;
    arr.push({ id, nome, email, telefone, senha });
    localStorage.setItem('usuarios', JSON.stringify(arr));
    return { changes: { lastId: id } } as any;
  }
  const query = `
    INSERT INTO usuarios
    (nome, email, telefone, senha)
    VALUES (?, ?, ?, ?)
  `;

  try {
    return await getDb().run(query, [nome, email, telefone, senha]);
  } catch (err: any) {
    throw err;
  }
}

export async function realizarLogin(email: string, senha: string) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return arr.find((u: any) => u.email === email && u.senha === senha) || null;
  }
  const query = `
    SELECT *
    FROM usuarios
    WHERE email = ?
    AND senha = ?
    LIMIT 1
  `;

  const result = await getDb().query(query, [email, senha]);

  return result.values?.[0] || null;
}

export async function updateUsuario(
  id: number,
  nome: string,
  email: string,
  telefone: string,
) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const idx = arr.findIndex((u: any) => u.id === id);
    if (idx >= 0) {
      arr[idx].nome = nome;
      arr[idx].email = email;
      arr[idx].telefone = telefone;
      localStorage.setItem('usuarios', JSON.stringify(arr));
    }
    return;
  }
  const query = `
    UPDATE usuarios
    SET nome = ?,
        email = ?,
        telefone = ?
    WHERE id = ?
  `;

  return await getDb().run(query, [nome, email, telefone, id]);
}

export async function findUsuarioById(id: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return arr.find((u: any) => u.id === id) || null;
  }
  const query = `
    SELECT *
    FROM usuarios
    WHERE id = ?
  `;

  const result = await getDb().query(query, [id]);

  return result.values?.[0] || null;
}

export async function listUsuarios() {
  await ensureDatabase();
  if (useFallback) {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }
  const result = await getDb().query("SELECT * FROM usuarios");

  return result.values || [];
}

export async function deleteUsuarioById(id: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('usuarios') || '[]').filter((u: any) => u.id !== id);
    localStorage.setItem('usuarios', JSON.stringify(arr));
    return;
  }
  const query = "DELETE FROM usuarios WHERE id = ?";

  return await getDb().run(query, [id]);
}

// Figurinhas / Stickers
export async function addSticker(
  nome: string,
  selecao: string,
  foto: string | null,
  raridade: string | null,
) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('stickers') || '[]');
    const id = (arr.map((a: any) => a.id).sort((a: number,b: number)=>b-a)[0] || 0) + 1;
    arr.push({ id, nome, selecao, foto, raridade });
    localStorage.setItem('stickers', JSON.stringify(arr));
    return { changes: { lastId: id } } as any;
  }
  const query = `
    INSERT INTO stickers (nome, selecao, foto, raridade)
    VALUES (?, ?, ?, ?)
  `;

  return await getDb().run(query, [nome, selecao, foto, raridade]);
}

export async function listStickersForUser(
  userId: number | null,
  busca = "",
  filtro = "todas"
) {
  await ensureDatabase();
  if (useFallback) {
    const stickers = JSON.parse(localStorage.getItem('stickers') || '[]');
    const userStickers = JSON.parse(localStorage.getItem('user_stickers') || '[]');
    const like = busca.toLowerCase();
    let result = stickers.filter((s: any) =>
      s.nome.toLowerCase().includes(like) || (s.selecao || '').toLowerCase().includes(like)
    );

    const merged = result.map((s: any) => {
      const us = userStickers.find((u: any) => u.user_id === userId && u.sticker_id === s.id);
      return { ...s, coletada: !!(us && us.coletada) };
    });

    if (filtro === 'coletadas') return merged.filter((m: any) => m.coletada);
    if (filtro === 'pendentes') return merged.filter((m: any) => !m.coletada);
    return merged;
  }

  const like = `%${busca}%`;

  let where = "WHERE (s.nome LIKE ? OR s.selecao LIKE ?)";

  if (filtro === "coletadas") {
    where += " AND COALESCE(us.coletada,0)=1";
  }

  if (filtro === "pendentes") {
    where += " AND COALESCE(us.coletada,0)=0";
  }

  // userId is used in the LEFT JOIN to bring user's status
  const query = `
    SELECT s.id, s.nome, s.selecao, s.foto, s.raridade,
      COALESCE(us.coletada,0) as coletada
    FROM stickers s
    LEFT JOIN user_stickers us
      ON s.id = us.sticker_id AND us.user_id = ?
    ${where}
    ORDER BY s.id ASC
  `;

  const params: any[] = [userId, like, like];

  const result = await getDb().query(query, params);

  return (
    (result.values || []).map((r: any) => ({
      id: r.id,
      nome: r.nome,
      selecao: r.selecao,
      foto: r.foto,
      raridade: r.raridade,
      coletada: !!r.coletada,
    }))
  );
}

export async function toggleUserSticker(userId: number, stickerId: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('user_stickers') || '[]');
    const idx = arr.findIndex((u: any) => u.user_id === userId && u.sticker_id === stickerId);
    if (idx >= 0) {
      arr[idx].coletada = arr[idx].coletada ? 0 : 1;
    } else {
      arr.push({ id: (arr.map((a: any) => a.id).sort((a: number,b: number)=>b-a)[0] || 0) + 1, user_id: userId, sticker_id: stickerId, coletada: 1 });
    }
    localStorage.setItem('user_stickers', JSON.stringify(arr));
    return;
  }

  const select = `SELECT coletada FROM user_stickers WHERE user_id = ? AND sticker_id = ? LIMIT 1`;
  const sel = await getDb().query(select, [userId, stickerId]);

  if (sel.values && sel.values.length > 0) {
    const atual = sel.values[0].coletada ? 1 : 0;
    const novo = atual === 1 ? 0 : 1;
    const update = `UPDATE user_stickers SET coletada = ? WHERE user_id = ? AND sticker_id = ?`;
    return await getDb().run(update, [novo, userId, stickerId]);
  }

  const insert = `INSERT INTO user_stickers (user_id, sticker_id, coletada) VALUES (?, ?, 1)`;
  return await getDb().run(insert, [userId, stickerId]);
}

export async function getUserCollectedCount(userId: number) {
  await ensureDatabase();
  if (useFallback) {
    const arr = JSON.parse(localStorage.getItem('user_stickers') || '[]');
    return arr.filter((u: any) => u.user_id === userId && u.coletada === 1).length;
  }
  const query = `SELECT COUNT(*) as total FROM user_stickers WHERE user_id = ? AND coletada = 1`;
  const res = await getDb().query(query, [userId]);
  return res.values?.[0]?.total || 0;
}
 