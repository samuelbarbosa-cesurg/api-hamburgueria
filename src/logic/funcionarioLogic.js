import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { novoFuncionario } from "../models/funcionario.js";
import * as funcionarioRepository from "../repositories/funcionarioRepository.js";

export async function cadastrar(body) {
  const funcionario = new novoFuncionario(body);

  if (funcionarioRepository.buscarPorEmail(funcionario.email)) {
    const erro = new Error("Já existe um usuário com esse email");
    erro.status = 409;
    throw erro;
  }

 
  const senhaHash = await bcrypt.hash(funcionario.senha, 10);

  return funcionarioRepository.criar({ nome: funcionario.nome, email: funcionario.email, senhaHash });
}

export async function login({ email, senha } = {}) {
  const funcionario = funcionarioRepository.buscarPorEmail(String(email ?? "").trim().toLowerCase());
  const senhaConfere = funcionario && (await bcrypt.compare(String(senha ?? ""), funcionario.senhaHash));


  if (!senhaConfere) {
    const erro = new Error("Email ou senha inválidos");
    erro.status = 401;
    throw erro;
  }

  const token = jwt.sign(
    { id: funcionario.id, nome: funcionario.nome },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { token };
}