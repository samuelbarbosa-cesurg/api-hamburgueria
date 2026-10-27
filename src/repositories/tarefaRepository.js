// O repository é a única camada que conhece o banco e os comandos SQL.
// As outras camadas trabalham apenas com objetos JavaScript.
import db from "../database/conexao.js";

// O SQLite guarda booleanos como 0 e 1.
// A API devolve esses valores como false e true.
function mapearTarefa(linha) {
  if (!linha) return null;

  return {
    ...linha,
    concluida: linha.concluida === 1,
  };
}

// Retorna todas as tarefas ordenadas pelo id.
export function listar() {
  const tarefas = db.prepare("SELECT * FROM tarefas ORDER BY id").all();

  return tarefas.map(mapearTarefa);
}

// Retorna uma tarefa pelo id ou null quando ela não existe.
export function buscarPorId(id) {
  // O ? mantém o valor separado do SQL e evita montar a consulta com strings.
  const tarefa = db.prepare("SELECT * FROM tarefas WHERE id = ?").get(id);

  return mapearTarefa(tarefa);
}

// Cria uma tarefa e retorna o registro completo com o id gerado pelo banco.
export function criar(tarefa) {
  const resultado = db
    .prepare(
      `
      INSERT INTO tarefas
        (titulo, descricao, prioridade, concluida)
      VALUES (?, ?, ?, ?)
    `,
    )
    .run(
      tarefa.titulo,
      tarefa.descricao ?? null,
      tarefa.prioridade ?? null,
      tarefa.concluida ? 1 : 0,
    );

  return buscarPorId(Number(resultado.lastInsertRowid));
}

// Atualiza uma tarefa e retorna o registro atualizado ou null se ela não existir.
export function atualizar(id, tarefa) {
  const tarefaAtual = buscarPorId(id);

  if (!tarefaAtual) return null;

  // O SQL é fixo: cada ? recebe um valor na mesma ordem dos campos.
  // A leitura anterior mantém compatibilidade com atualizações parciais.
  const dados = { ...tarefaAtual, ...tarefa };

  db.prepare(
    `
    UPDATE tarefas
    SET titulo = ?, descricao = ?, prioridade = ?, concluida = ?, usuarioId = ?
    WHERE id = ?
  `,
  ).run(
    dados.titulo,
    dados.descricao ?? null,
    dados.prioridade ?? null,
    dados.concluida ? 1 : 0,
    dados.usuarioId ?? null,
    id,
  );

  return buscarPorId(id);
}

// Remove uma tarefa e informa se alguma linha foi removida.
export function remover(id) {
  const resultado = db.prepare("DELETE FROM tarefas WHERE id = ?").run(id);

  return resultado.changes > 0;
}
