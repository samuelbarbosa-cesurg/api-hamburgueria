export class ErroNaoEncontrado extends Error {
  constructor(mensagem) {
    super(mensagem)
    this.name = 'ErroNaoEncontrado'
  }
}
