PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('lanche', 'acompanhamento',
  'bebida')),
  preco REAL NOT NULL CHECK (preco > 0),
  disponivel INTEGER NOT NULL DEFAULT 1 CHECK (disponivel IN (0, 1))
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'recebido'
  CHECK (status IN ('recebido', 'preparando', 'pronto', 'entregue',
  'cancelado')),
  total REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedidoId INTEGER NOT NULL REFERENCES pedidos (id),
  produtoId INTEGER NOT NULL REFERENCES produtos (id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  precoUnitario REAL NOT NULL
);

INSERT OR IGNORE INTO produtos (id, nome, categoria, preco, disponivel)
  VALUES
  (1, 'X-Burger', 'lanche', 25.0, 1),
  (2, 'X-Bacon', 'lanche', 29.9, 1),
  (3, 'X-Salada', 'lanche', 27.5, 1),
  (4, 'Batata frita', 'acompanhamento', 15.0, 1),
  (5, 'Onion rings', 'acompanhamento', 18.0, 0),
  (6, 'Refrigerante lata', 'bebida', 6.5, 1),
  (7, 'Suco natural', 'bebida', 9.0, 1);