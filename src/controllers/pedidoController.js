import * as pedidoLogic from "../logic/pedidoLogic.js";


export async function cadastrarPedido(request, response) {
   try{
        const pedido = request.body;

        if(pedido && Object.keys(pedido).length > 0){
            const novoPedido = await pedidoLogic.cadastrarPedido(pedido);
            return response.status(201).json(novoPedido);

        }else{
            return response.status(400).json({mensagem: "O corpo da requisição é obrigatório"})
        }
    } catch (error) {
        console.error(`Erro ao cadastrar pedido: ${error.message}`);

        if(error instanceof Error){
            return response.status(400).json({
                mensagem: error.message,
            });
        }

        return response.status(500).json({
            mensagem: "Erro interno do servidor",
        });
    }
}
