import * as pedidoLogic from "../logic/pedidoLogic.js";
import { ErroValidacao } from "../models/erroValidacao.js";
import { ErroNaoEncontrado } from "../models/erroNaoEncontrado.js";
import { ErroConflito } from "../models/erroConflito.js";


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

        if(error instanceof ErroValidacao){
            return response.status(400).json({
                mensagem: error.message,
            });
        }

        if(error instanceof ErroNaoEncontrado){
            return response.status(404).json({
                mensagem: error.message,
            });
        }

        if(error instanceof ErroConflito){
            return response.status(409).json({
                mensagem: error.message,
            });
        }

        return response.status(500).json({
            mensagem: "Erro interno do servidor",
        });
    }
}

export async function listarPedidos(request, response) {
    try {
        const pedidos = await pedidoLogic.listarPedidos(request.query.status);
        return response.status(200).json(pedidos);
    } catch (error) {
        console.error(`Erro ao listar pedidos: ${error.message}`);

        if(error instanceof ErroValidacao){
            return response.status(400).json({
                mensagem: error.message,
            });
        }

        return response.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

export async function alterarStatusPedido(request, response) {
    try {
        const pedidoId = Number(request.params.id);
        const novoStatus = request.body?.status;

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return response.status(400).json({ mensagem: "ID do pedido inválido" });
        }

        const resultado = await pedidoLogic.alterarStatusPedido(pedidoId, novoStatus);

        if (resultado) {
            return response.status(200).json({ mensagem: "Status do pedido alterado com sucesso" });
        } else {
            return response.status(404).json({ mensagem: "Pedido não encontrado" });
        }
    } catch (error) {
        console.error(`Erro ao alterar status do pedido: ${error.message}`);

        if(error instanceof ErroValidacao){
            return response.status(400).json({
                mensagem: error.message,
            });
        }

        if(error instanceof ErroConflito){
            return response.status(409).json({
                mensagem: error.message,
            });
        }
        
        return response.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}
