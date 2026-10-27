// Abre o banco SQLite e executa o script inicial das tabelas.
// O arquivo banco.db é criado automaticamente dentro de data/.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const pastaDados = path.join(process.cwd(), "data");
const caminhoBanco = path.join(pastaDados, "banco.db");
const caminhoScript = path.join(pastaDados, "banco.sql");

fs.mkdirSync(pastaDados, { recursive: true });

const db = new DatabaseSync(caminhoBanco);
db.exec(fs.readFileSync(caminhoScript, "utf-8"));

export default db;
