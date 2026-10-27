import { Tarefa } from "../models/tarefa.js";
import * as produtoRepository from "../repositories/produtoRepository.js";

// Mantém a rota inicial GET / retornando a primeira tarefa do banco.
export async function obterProdutos() {
  return await produtoRepository.listar();
}

// A logic coordena a consulta; somente o repository conhece o SQL.
export function listarTarefas() {
  return produtoRepository.listar();
}
export function cadastrarTarefa(body) {
  const novaTarefa = new Tarefa(body)
  return produtoRepository.criar(novaTarefa);
}
export async function buscarProduto(id) {
 	const idFiltrado = Number(id);
	const produtos = await produtoRepository.listar();
	
	if (!isNaN(idFiltrado)) {
		const produtoFiltrado = produtos.find((produto) => produto.id === idFiltrado)
		return produtoFiltrado
	}

	return null;
}
