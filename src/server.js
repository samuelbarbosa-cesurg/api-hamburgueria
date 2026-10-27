import express from "express";
import { fileURLToPath } from "node:url";
import * as produtoController from "./controllers/produtoController.js";

const app = express();
const PORTA = Number(process.env.PORT || 3000);

// Permite que o SimuladorRequest.html seja aberto fora deste projeto.
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (request.method === "OPTIONS") {
    return response.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/produtos", produtoController.obterProdutos);
app.get("/produtos/:id", produtoController.buscarProduto);
app.post("/tarefas", produtoController.cadastrarTarefa);

app.use((req, res, next) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    status: 404
  });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORTA, () => {
    console.log(`API disponível em http://localhost:${PORTA}`);
  });
}

export default app;
