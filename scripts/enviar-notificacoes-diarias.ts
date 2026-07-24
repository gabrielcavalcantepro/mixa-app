/**
 * Scheduler local pra desenvolvimento — chama o cron endpoint uma vez.
 * Em produção, qualquer scheduler externo (não amarrado a um provedor
 * de hospedagem específico) pode chamar POST /api/cron/notificacoes-diarias
 * a cada ~15min com o mesmo header.
 */
async function main() {
  const url = process.env.CRON_URL ?? "http://localhost:3000/api/cron/notificacoes-diarias";
  const segredo = process.env.CRON_SECRET;
  if (!segredo) throw new Error("CRON_SECRET não definido — copie .env.example para .env");

  const resposta = await fetch(url, { method: "POST", headers: { "x-cron-secret": segredo } });
  const corpo = await resposta.json();
  console.log(resposta.status, corpo);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
