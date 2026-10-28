import { Pedido } from "../models/pedido.js";
import { ItemPedido } from "../models/itemPedido.js";
import * as produtoRepository from "../repositories/produtoRepository.js";
import * as pedidoRepository from "../repositories/pedidoRepository.js";

export async function cadastrarPedido(body) {
 
	let cliente = body.cliente;
	if (!cliente || cliente.trim() === '') {
		throw new Error("Para cadastrar um pedido é obrigatório informar um cliente");
	}

  let itensBodyPedido = body.itens;
  if (!Array.isArray(itensBodyPedido) && itensBodyPedido.length <= 0) {
    throw new Error("Não é possivel fazer um pedido sem itens!");
  }

  const produtos = await produtoRepository.listar();

  const valoresPedido = itensBodyPedido.map((item) => {
    const produto = produtos.find((produto) => produto.id === item.produtoId);
    return produto ? produto.preco * item.quantidade : 0;
  })

  const valorTotal = valoresPedido.reduce((acc, curr) => acc + curr, 0);

  const pedido = new Pedido({
    cliente: cliente,
    total: valorTotal
  });

  const pedidoId = await pedidoRepository.cadastrarPedido(pedido);

  

  itensBodyPedido.map(itemPedido => {
    const precoProduto = produtoRepository.pegarPreco(itemPedido.produtoId);
    throw new Error(`${precoProduto}`)
    const item = new ItemPedido({
      pedidoId: pedidoId.lastInsertRowid,
      produtoId: itemPedido.produtoId,
      quantidade: itemPedido.quantidade,
      precoUnitario: produtoRepository.pegarPreco(itemPedido.produtoId)
    })
    
   pedidoRepository.cadastrarItemPedido(item)
  });

  return pedido;


  
}
