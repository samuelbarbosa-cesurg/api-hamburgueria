export class ErroConflito extends Error {
  constructor(mensagem) {
    super(mensagem)
    this.name = 'ErroConflito'
  }
}
