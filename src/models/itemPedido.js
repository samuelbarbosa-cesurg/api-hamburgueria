export class ItemPedido {
  constructor({pedidoId, produtoId, quantidade, precoUnitario = 0.00 }){
    if(!Number.isInteger(pedidoId)){
      throw new Error('O ID do pedido precisa ser numérico!')
    }

    if(!Number.isInteger(produtoId)){
      throw new Error('O ID do produto precisa ser numérico!')
    }

    if(quantidade <= 0){
      throw new Error('A quantidade de produtos precisa ser maior que zero!')
    }

    if(isNaN(quantidade)){
      throw new Error('A quantidade precisa ser numérica');
    }

    if(precoUnitario <= 0){
      throw new Error('O preço unitário precisa ser maior que zero!')
    }

    if(isNaN(precoUnitario)){
      throw new Error('O preço unitário precisa ser numérico');
    }
    
    this.pedidoId = pedidoId
    this.produtoId = produtoId
    this.quantidade = quantidade
    this.precoUnitario = precoUnitario
  }
}
