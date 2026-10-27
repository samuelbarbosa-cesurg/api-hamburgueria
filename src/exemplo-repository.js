// Demonstra o CRUD do repository sem precisar iniciar o servidor.
// Rode com: npm run exemplo
import * as tarefaRepository from "./repositories/tarefaRepository.js";

console.log("listar():", tarefaRepository.listar());

const criada = tarefaRepository.criar({
  titulo: "Tarefa de teste",
  prioridade: "alta",
});
console.log("criar():", criada);

console.log("buscarPorId():", tarefaRepository.buscarPorId(criada.id));

console.log(
  "atualizar():",
  tarefaRepository.atualizar(criada.id, {
    concluida: true,
    descricao: "Atualizada pelo exemplo",
  }),
);

console.log("remover():", tarefaRepository.remover(criada.id));
console.log("buscarPorId() depois de remover:", tarefaRepository.buscarPorId(criada.id));
