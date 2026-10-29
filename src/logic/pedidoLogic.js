import { Pedido } from "../models/pedido.js";
import { ItemPedido } from "../models/itemPedido.js";
import { ErroValidacao } from "../models/erroValidacao.js";
import { ErroNaoEncontrado } from "../models/erroNaoEncontrado.js";
import { ErroConflito } from "../models/erroConflito.js";
import * as produtoRepository from "../repositories/produtoRepository.js";
import * as pedidoRepository from "../repositories/pedidoRepository.js";

export async function cadastrarPedido(body) {
  const cliente = body.cliente;
  Pedido.validarCliente(cliente);

  const itensBodyPedido = body.itens;
  if (!Array.isArray(itensBodyPedido) || itensBodyPedido.length === 0) {
    throw new ErroValidacao("Não é possivel fazer um pedido sem itens!");
  }

  const produtos = await produtoRepository.listar();

  const itensValidados = [];
  const produtosJaInformados = [];
  let valorTotal = 0;

  for (const itemBody of itensBodyPedido) {
    if (!itemBody || typeof itemBody !== "object") {
      throw new ErroValidacao("Cada item do pedido precisa ser um objeto com produtoId e quantidade!");
    }

    const produtoId = Number(itemBody.produtoId);
    const quantidade = Number(itemBody.quantidade);

    if (itemBody.produtoId === null || itemBody.produtoId === "" || !Number.isInteger(produtoId)) {
      throw new ErroValidacao("O produtoId de cada item precisa ser numérico!");
    }

    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) {
      throw new ErroValidacao("A quantidade de cada item precisa ser um número inteiro de 1 a 10!");
    }

    if (produtosJaInformados.includes(produtoId)) {
      throw new ErroValidacao(`O produto ${produtoId} foi informado mais de uma vez no pedido!`);
    }

    const produto = produtos.find((produto) => produto.id === produtoId);
    if (!produto) {
      throw new ErroNaoEncontrado(`O produto ${produtoId} não foi encontrado!`);
    }

    if (!produto.disponivel) {
      throw new ErroConflito(`O produto ${produto.nome} não está disponível!`);
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

  for (const itemValidado of itensValidados) {
    const item = new ItemPedido({
      pedidoId: pedidoId,
      produtoId: itemValidado.produtoId,
      quantidade: itemValidado.quantidade,
      precoUnitario: itemValidado.precoUnitario
    });

    await pedidoRepository.cadastrarItemPedido(item);
  }

  return {
    id: pedidoId,
    cliente: pedido.cliente,
    status: pedido.status,
    total: pedido.total
  };
}

export async function listarPedidos(status) {
    if (status !== undefined && !Pedido.STATUS.includes(status)) {
        throw new ErroValidacao("Status inválido. Os status válidos são: " + Pedido.STATUS.join(", "));
    }

    return await pedidoRepository.listar(status);
}

export async function buscarPedido(pedidoId) {
    const pedido = await pedidoRepository.buscarPedidoPorId(pedidoId);

    if (!pedido) {
        return null;
    }

    const itens = await pedidoRepository.buscarItensPorPedidoId(pedidoId);

    return {
        id: pedido.id,
        cliente: pedido.cliente,
        status: pedido.status,
        total: pedido.total,
        itens: itens
    };
}

export async function alterarStatusPedido(pedidoId, novoStatus) {
    if (!Pedido.STATUS.includes(novoStatus)) {
        throw new ErroValidacao("Status inválido. Os status válidos são: " + Pedido.STATUS.join(", "));
    }

    const pedido = await pedidoRepository.buscarPedidoPorId(pedidoId);

    if (!pedido) {
        return false;
    }

    if (!Pedido.podeMudarStatus(pedido.status, novoStatus)) {
        throw new ErroConflito(`Não é possível mudar o pedido de ${pedido.status} para ${novoStatus}`);
    }

    await pedidoRepository.alterarStatusPedido(pedidoId, novoStatus);
    return true;
}
