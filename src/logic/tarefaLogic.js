import { Tarefa } from "../models/tarefa.js";
import * as tarefaRepository from "../repositories/tarefaRepository.js";

// Mantém a rota inicial GET / retornando a primeira tarefa do banco.
export function obterTarefa() {
  return tarefaRepository.buscarPorId(1);
}

// A logic coordena a consulta; somente o repository conhece o SQL.
export function listarTarefas() {
  return tarefaRepository.listar();
}
export function cadastrarTarefa(body) {
  const novaTarefa = new Tarefa(body)
  return tarefaRepository.criar(novaTarefa);
}