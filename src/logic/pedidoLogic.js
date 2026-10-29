import { Pedido } from "../models/pedido.js";
import { ItemPedido } from "../models/itemPedido.js";
import { ErroValidacao } from "../models/erroValidacao.js";
import * as produtoRepository from "../repositories/produtoRepository.js";
import * as pedidoRepository from "../repositories/pedidoRepository.js";

export async function cadastrarPedido(body) {
  const cliente = body.cliente;
  if (typeof cliente !== "string" || cliente.trim() === "") {
    throw new ErroValidacao("Para cadastrar um pedido é obrigatório informar um cliente");
  }

  const itensBodyPedido = body.itens;
  if (!Array.isArray(itensBodyPedido) || itensBodyPedido.length === 0) {
    throw new ErroValidacao("Não é possivel fazer um pedido sem itens!");
  }

  const produtos = await produtoRepository.listar();

  const itensValidados = [];
  const produtosJaInformados = [];
  let valorTotal = 0;

  for (const itemBody of itensBodyPedido) {
    const produtoId = Number(itemBody.produtoId);
    const quantidade = Number(itemBody.quantidade);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new ErroValidacao("A quantidade de cada item precisa ser um número inteiro maior que zero!");
    }

    if (produtosJaInformados.includes(produtoId)) {
      throw new ErroValidacao(`O produto ${produtoId} foi informado mais de uma vez no pedido!`);
    }

    const produto = produtos.find((produto) => produto.id === produtoId);
    if (!produto) {
      throw new ErroValidacao(`O produto ${itemBody.produtoId} não foi encontrado!`);
    }

    if (!produto.disponivel) {
      throw new ErroValidacao(`O produto ${produto.nome} não está disponível!`);
    }

    produtosJaInformados.push(produtoId);
    itensValidados.push({
      produtoId: produtoId,
      quantidade: quantidade,
      precoUnitario: produto.preco
    });
    valorTotal += produto.preco * quantidade;
  }

  const pedido = new Pedido({
    cliente: cliente,
    total: valorTotal
  });

  const resultadoPedido = await pedidoRepository.cadastrarPedido(pedido);
  const pedidoId = Number(resultadoPedido.lastInsertRowid);

  const itens = [];
  for (const itemValidado of itensValidados) {
    const item = new ItemPedido({
      pedidoId: pedidoId,
      produtoId: itemValidado.produtoId,
      quantidade: itemValidado.quantidade,
      precoUnitario: itemValidado.precoUnitario
    });

    await pedidoRepository.cadastrarItemPedido(item);
    itens.push(item);
  }

  return {
    id: pedidoId,
    cliente: pedido.cliente,
    status: pedido.status,
    total: pedido.total,
    itens: itens
  };
}
