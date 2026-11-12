import express from "express";
import { fileURLToPath } from "node:url";
import * as produtoController from "./controllers/produtoController.js";
import * as pedidoController from "./controllers/pedidoController.js";
import { autenticar } from "./middlewares/autenticar.js";
import * as funcionarioController from "./controllers/funcionarioController.js";



if (!process.env.JWT_SECRET) {
  console.error("Falta o JWT_SECRET no arquivo .env");
  process.exit(1);
}

const app = express();
app.use("/app", express.static("public"));

const PORTA = Number(process.env.PORT || 3000);



app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PATCH,DELETE");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});
app.use(express.json());


app.get("/produtos",autenticar, produtoController.obterProdutos);
app.get("/produtos/:id",autenticar, produtoController.buscarProduto);
app.get("/pedidos",autenticar, pedidoController.listarPedidos);
app.get("/pedidos/:id",autenticar, pedidoController.buscarPedido);
app.post("/pedidos",autenticar, pedidoController.cadastrarPedido);
app.patch("/pedidos/:id/status",autenticar, pedidoController.alterarStatusPedido);
app.post("/funcionarios", funcionarioController.cadastrar);
app.post("/login", funcionarioController.login);

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