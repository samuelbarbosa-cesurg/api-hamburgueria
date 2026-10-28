import * as produtoLogic from "../logic/produtoLogic.js";


export async function obterProdutos(request, response) {
    try{
      const produto = await produtoLogic.obterProdutos(request.query);

      if(produto.length === 0){
          return response.status(404).json({mensagem: "Nenhum produto encontrado"})
      }

      return response.status(200).json(produto);
    } catch (error) {
      console.error(`Erro ao listar produto: ${error.message}`);
      if(error instanceof Error) {
          return response.status(400).json({
              mensagem: error.message,
          });
      }

      return response.status(500).json({
          mensagem: "Erro interno do servidor",
      });
    }
}

export async function buscarProduto(request, response){
    try{
        const id = request.params.id;
        if(typeof id !== undefined && id.trim() !== ''){
            const produto = await produtoLogic.buscarProduto(id);
            if(!produto){
                return response.status(404).json({mensagem: "Produto não encontrado"})
            }
            return response.status(200).json(produto);
        }else{
            return response.status(400).json({mensagem: "O ID é obrigatório"})
        }
    } catch (error) {
        console.error(`Erro ao listar produto: ${error.message}`);

        if(error instanceof Error) {
            return response.status(400).json({
                mensagem: error.message,
            });
        }

        return response.status(500).json({
            mensagem: "Erro interno do servidor",
        });
    }
}

export async function listarTarefas(request, response) {
  try {
    const tarefas = await produtoLogic.listarTarefas();

    return response.status(200).json(tarefas);
  } catch (error) {
    console.error(`Erro ao listar tarefas: ${error.message}`);

    return response.status(500).json({
      mensagem: "Erro interno do servidor",
    });
  }
}
