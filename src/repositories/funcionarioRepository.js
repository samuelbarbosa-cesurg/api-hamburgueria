import db from "../database/conexao.js";

export function criar({ nome, email, senhaHash }) {
  const resultado = db
    .prepare("INSERT INTO funcionarios (nome, email, senhaHash) VALUES (?, ?, ?)")
    .run(nome, email, senhaHash);

  return { id: Number(resultado.lastInsertRowid), nome, email };
}

export function buscarPorEmail(email) {
  return db.prepare("SELECT * FROM funcionarios WHERE email = ?").get(email) ?? null;
}