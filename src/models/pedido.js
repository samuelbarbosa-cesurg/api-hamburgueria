import { ErroValidacao } from './erroValidacao.js'

export class Pedido {
  static STATUS = ['recebido', 'preparando', 'pronto', 'entregue','cancelado']
  constructor({cliente, status = "recebido", total = 0.00}){
    if(typeof cliente !== 'string' || cliente.trim() === ''){
      throw new ErroValidacao('O cliente é obrigatório')
    }

    if(cliente.length < 3 || cliente.length > 50){
      throw new ErroValidacao('O cliente deve ter entre 3 e 50 caracteres')
    }

    if(!Pedido.STATUS.includes(status)){
      throw new ErroValidacao('status inválido')
    }

    if (total <= 0) {
      throw new ErroValidacao('O valor do pedido precisa ser maior que 0')
    }
    
    this.cliente = cliente
    this.status = status
    this.total = total
  }
}
