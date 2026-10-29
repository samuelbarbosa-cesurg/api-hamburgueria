// Testa a API da hamburgueria com os 19 casos do enunciado.
//
// Coloque este arquivo na raiz do projeto (ao lado do package.json) e rode:
// node testar-api.mjs
//
// O script apaga data/banco.db, sobe a API com "npm start", roda os casos
// em ordem e desliga a API no final. Não precisa deixar a API rodando antes.
import { spawn } from "node:child_process";
import fs from "node:fs";

const PORTA = 3000;
const BASE = `http://localhost:${PORTA}`;

const casos = [
  {
    n: 1,
    metodo: "GET",
    caminho: "/produtos",
    status: 200,
    confere: (r) => Array.isArray(r) && r.length === 7,
    esperado: "lista com 7 produtos",
  },
  {
    n: 2,
    metodo: "GET",
    caminho: "/produtos/2",
    status: 200,
    confere: (r) => r?.nome === "X-Bacon",
    esperado: "o X-Bacon",
  },
  { n: 3, metodo: "GET", caminho: "/produtos/99", status: 404 },
  { n: 4, metodo: "GET", caminho: "/produtos/abc", status: 400 },
  {
    n: 5,
    metodo: "POST",
    caminho: "/pedidos",
    status: 201,
    body: {
      cliente: "Ana",
      itens: [
        { produtoId: 1, quantidade: 2 },
        { produtoId: 6, quantidade: 2 },
      ],
    },
    confere: (r) =>
      r?.id === 1 && r?.status === "recebido" && Number(r?.total) === 63,
    esperado: 'id 1, status "recebido" e total 63',
  },
  {
    n: 6,
    metodo: "POST",
    caminho: "/pedidos",
    status: 400,
    body: { cliente: "Ana", itens: [] },
  },
  {
    n: 7,
    metodo: "POST",
    caminho: "/pedidos",
    status: 400,
    body: { itens: [{ produtoId: 1, quantidade: 1 }] },
  },
  {
    n: 8,
    metodo: "POST",
    caminho: "/pedidos",
    status: 400,
    body: { cliente: "Ana", itens: [{ produtoId: 1, quantidade: 0 }] },
  },
  {
    n: 9,
    metodo: "POST",
    caminho: "/pedidos",
    status: 404,
    body: { cliente: "Ana", itens: [{ produtoId: 99, quantidade: 1 }] },
  },
  {
    n: 10,
    metodo: "POST",
    caminho: "/pedidos",
    status: 409,
    body: { cliente: "Ana", itens: [{ produtoId: 5, quantidade: 1 }] },
  },
  {
    n: 11,
    metodo: "POST",
    caminho: "/pedidos",
    status: 201,
    body: {
      cliente: "Bruno",
      itens: [{ produtoId: 2, quantidade: 1 }],
      total: 1,
    },
    confere: (r) => r?.id === 2 && Number(r?.total) === 29.9,
    esperado: "id 2 e total 29.9 (o total enviado deve ser ignorado)",
  },
  {
    n: 12,
    metodo: "GET",
    caminho: "/pedidos/1",
    status: 200,
    confere: (r) =>
      Array.isArray(r?.itens) &&
      r.itens.length === 2 &&
      r.itens.every((i) => typeof i.nome === "string"),
    esperado: 'o pedido com "itens": 2 itens, cada um com o nome do produto',
  },
  {
    n: 13,
    metodo: "PATCH",
    caminho: "/pedidos/1/status",
    status: 409,
    body: { status: "pronto" },
  },
  {
    n: 14,
    metodo: "PATCH",
    caminho: "/pedidos/1/status",
    status: 200,
    body: { status: "preparando" },
    confere: (r) => r?.status === "preparando",
    esperado: 'status "preparando"',
  },
  {
    n: 15,
    metodo: "PATCH",
    caminho: "/pedidos/1/status",
    status: 409,
    body: { status: "cancelado" },
  },
  {
    n: 16,
    metodo: "PATCH",
    caminho: "/pedidos/2/status",
    status: 200,
    body: { status: "cancelado" },
    confere: (r) => r?.status === "cancelado",
    esperado: 'status "cancelado"',
  },
  {
    n: 17,
    metodo: "PATCH",
    caminho: "/pedidos/1/status",
    status: 400,
    body: { status: "voando" },
  },
  {
    n: 18,
    metodo: "PATCH",
    caminho: "/pedidos/99/status",
    status: 404,
    body: { status: "preparando" },
  },
  {
    n: 19,
    metodo: "GET",
    caminho: "/pedidos?status=preparando",
    status: 200,
    extra: true,
    confere: (r) => Array.isArray(r) && r.length === 1 && r[0].id === 1,
    esperado: "só o pedido 1",
  },
];

// Desliga a API e o que o npm start abriu junto (o node com o server.js).
function desligar(servidor) {
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(servidor.pid), "/T", "/F"]);
    } else {
      process.kill(-servidor.pid);
    }
  } catch {
    servidor.kill();
  }
}

function cor(codigo, texto) {
  return process.stdout.isTTY ? `\x1b[${codigo}m${texto}\x1b[0m` : texto;
}

const verde = (t) => cor(32, t);
const vermelho = (t) => cor(31, t);
const cinza = (t) => cor(90, t);

async function esperarApi(servidor) {
  for (let tentativa = 0; tentativa < 50; tentativa += 1) {
    if (servidor.exitCode !== null) return false;
    try {
      await fetch(`${BASE}/produtos`, { signal: AbortSignal.timeout(500) });
      return true;
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 200));
    }
  }
  return false;
}

async function rodarCaso(caso) {
  const opcoes = { method: caso.metodo, headers: {} };
  if (caso.body !== undefined) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(caso.body);
  }

  const resposta = await fetch(BASE + caso.caminho, opcoes);
  const texto = await resposta.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    json = undefined;
  }

  const problemas = [];
  if (resposta.status !== caso.status) {
    problemas.push(`esperado status ${caso.status}, veio ${resposta.status}`);
  }
  if (resposta.status === caso.status && caso.confere && !caso.confere(json)) {
    problemas.push(`esperado ${caso.esperado}`);
  }
  if (
    resposta.status >= 400 &&
    resposta.status === caso.status &&
    typeof json?.mensagem !== "string"
  ) {
    problemas.push('o erro deveria vir em JSON com { "mensagem": "..." }');
  }

  const recebido = texto.length > 160 ? `${texto.slice(0, 160)}...` : texto;
  return { problemas, recebido };
}

async function main() {
  if (!fs.existsSync("package.json")) {
    console.log(
      vermelho("Rode este script na raiz do projeto, ao lado do package.json."),
    );
    process.exit(1);
  }

  try {
    await fetch(`${BASE}/`, { signal: AbortSignal.timeout(500) });
    console.log(
      vermelho(
        `Já tem uma API rodando em ${BASE}. Pare ela (Ctrl+C no terminal dela) e rode o teste de novo.`,
      ),
    );
    process.exit(1);
  } catch {
    // porta livre: segue
  }

  fs.rmSync("data/banco.db", { force: true });
  console.log(
    cinza("Banco zerado (data/banco.db apagado). Subindo a API com npm start...\n"),
  );

  const servidor = spawn("npm", ["start"], {
    shell: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  servidor.stdout.on("data", (d) => (logs += d));
  servidor.stderr.on("data", (d) => (logs += d));

  const subiu = await esperarApi(servidor);
  if (!subiu) {
    console.log(
      vermelho(`A API não respondeu em ${BASE}. O que o npm start mostrou:\n`),
    );
    console.log(logs || "(nada)");
    desligar(servidor);
    process.exit(1);
  }

  let passaram = 0;
  for (const caso of casos) {
    const rotulo = `${String(caso.n).padStart(2)}. ${caso.metodo} ${caso.caminho}${caso.extra ? " (extra)" : ""}`;
    try {
      const { problemas, recebido } = await rodarCaso(caso);
      if (problemas.length === 0) {
        passaram += 1;
        console.log(`${verde("✔")} ${rotulo}`);
      } else {
        console.log(`${vermelho("✘")} ${rotulo}`);
        for (const problema of problemas) console.log(`   ${problema}`);
        console.log(cinza(`   resposta: ${recebido || "(vazia)"}`));
      }
    } catch (error) {
      console.log(`${vermelho("✘")} ${rotulo}`);
      console.log(`   a requisição falhou: ${error.message}`);
    }
  }

  console.log(`\n${passaram} de ${casos.length} casos passaram.`);
  if (passaram < casos.length) {
    console.log(
      cinza(
        "Os casos rodam em ordem e usam o mesmo banco: se um falhar, os seguintes podem falhar por causa dele.",
      ),
    );
  }

  desligar(servidor);
  process.exit(0);
}

main();
