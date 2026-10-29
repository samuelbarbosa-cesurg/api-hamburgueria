import { ErroValidacao } from './erroValidacao.js'

export class Pedido {
	static STATUS = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado']

	static TRANSICOES = {
		recebido: ['preparando', 'cancelado'],
		preparando: ['pronto'],
		pronto: ['entregue'],
		entregue: [],
		cancelado: []
	}

	constructor({ cliente, status = "recebido", total = 0.00 }) {
		Pedido.validarCliente(cliente)

		if (!Pedido.STATUS.includes(status)) {
			throw new ErroValidacao('status inválido')
		}

		if (total <= 0) {
			throw new ErroValidacao('O valor do pedido precisa ser maior que 0')
		}

		this.cliente = cliente
		this.status = status
		this.total = total
	}

	static validarCliente(cliente) {
		if (typeof cliente !== 'string' || cliente.trim() === '') {
			throw new ErroValidacao('O cliente é obrigatório')
		}

		if (cliente !== cliente.trim()) {
			throw new ErroValidacao('O cliente não pode ter espaços no início ou no fim')
		}

		if (cliente.length < 2 || cliente.length > 60) {
			throw new ErroValidacao('O cliente deve ter entre 2 e 60 caracteres')
		}
	}

	static podeMudarStatus(statusAtual, novoStatus) {
		return Pedido.TRANSICOES[statusAtual].includes(novoStatus)
	}
}
