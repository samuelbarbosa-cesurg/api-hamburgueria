export class novoFuncionario {
  constructor({ nome, email, senha }) {
    if (typeof nome !== "string" || nome.trim().length < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres");
    }
    if (typeof email !== "string" || !email.includes("@")) {
      throw new Error("Informe um email válido");
    }
    if (typeof senha !== "string" || senha.length < 8) {
      throw new Error("A senha deve ter pelo menos 8 caracteres");
    }

    this.nome = nome.trim();
    this.email = email.trim().toLowerCase();
    this.senha = senha;
  }
}