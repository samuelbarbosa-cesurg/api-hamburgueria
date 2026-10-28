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

// Retorna todas os pedidos ordenados pelo id.
export async function listar() {
  const pedidos = db.prepare("SELECT * FROM pedidos ORDER BY id").all();

  return pedidos.map(mapearTarefa);
}

// Retorna uma tarefa pelo id ou null quando ela não existe.
export function buscarPorId(id) {
  // O ? mantém o valor separado do SQL e evita montar a consulta com strings.
  const tarefa = db.prepare("SELECT * FROM tarefas WHERE id = ?").get(id);

  return mapearTarefa(tarefa);
}

// Cria uma tarefa e retorna o registro completo com o id gerado pelo banco.
export async function cadastrarPedido(pedido) {
  const resultado = db
    .prepare(
      `
      INSERT INTO pedidos
        (cliente, total)
      VALUES (?, ?) RETURNING id, cliente, total;
    `,
    )
    .run(
      pedido.cliente,
      pedido.total ?? 0,
    );

  return resultado;
}

export async function cadastrarItemPedido(item) {
  const resultado = db
    .prepare(
      `
      INSERT INTO itens_pedido
        (pedidoId, produtoId, quantidade, precoUnitario)
      VALUES (?, ?, ?, ?) RETURNING id;
    `,
    )
    .run(
      item.pedidoId,
      item.produtoId,
      item.quantidade,
      item.precoUnitario
    );

  return resultado;
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
