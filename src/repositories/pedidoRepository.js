// O repository é a única camada que conhece o banco e os comandos SQL.
// As outras camadas trabalham apenas com objetos JavaScript.
import db from "../database/conexao.js";

// Retorna os pedidos ordenados pelo id, filtrando por status quando ele for informado.
export async function listar(status) {
  if (status) {
    return db.prepare("SELECT * FROM pedidos WHERE status = ? ORDER BY id").all(status);
  }

  return db.prepare("SELECT * FROM pedidos ORDER BY id").all();
}

// Cria um pedido e retorna o resultado do banco, que contém o lastInsertRowid.
export async function cadastrarPedido(pedido) {
  const resultado = db
    .prepare(
      `
      INSERT INTO pedidos
        (cliente, total)
      VALUES (?, ?);
    `,
    )
    .run(
      pedido.cliente,
      pedido.total,
    );

  return resultado;
}

export async function cadastrarItemPedido(item) {
  const resultado = db
    .prepare(
      `
      INSERT INTO itens_pedido
        (pedidoId, produtoId, quantidade, precoUnitario)
      VALUES (?, ?, ?, ?);
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

export async function buscarPedidoPorId(pedidoId) {
  const pedido = db
    .prepare(
      `
      SELECT * FROM pedidos WHERE id = ?;
    `,
    )
    .get(pedidoId);

  return pedido;
}

// Retorna os itens de um pedido junto com o nome de cada produto.
export async function buscarItensPorPedidoId(pedidoId) {
  return db
    .prepare(
      `
      SELECT
        itens_pedido.produtoId,
        produtos.nome,
        itens_pedido.quantidade,
        itens_pedido.precoUnitario
      FROM itens_pedido
      INNER JOIN produtos ON produtos.id = itens_pedido.produtoId
      WHERE itens_pedido.pedidoId = ?
      ORDER BY itens_pedido.id;
    `,
    )
    .all(pedidoId);
}

export async function alterarStatusPedido(pedidoId, novoStatus) {
  const resultado = db
    .prepare(
      `
      UPDATE pedidos
      SET status = ?
      WHERE id = ?;
    `,
    )
    .run(novoStatus, pedidoId);

  return resultado.changes > 0;
}
