import webPush from "web-push";

let configurado = false;

function garantirConfigurado() {
  if (configurado) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT não configurados — gerar com: npm run push:vapid",
    );
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  configurado = true;
}

export interface InscricaoPush {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Envia 1 notificação. A spec pede um push "simples" (não carrega o
 * look) — só precisa abrir o app direto na aba Hoje ao ser tocada, ver
 * `data.url` consumido em public/sw.js.
 */
export async function enviarPush(
  inscricao: InscricaoPush,
  conteudo: { titulo: string; corpo: string; url: string },
): Promise<void> {
  garantirConfigurado();

  await webPush.sendNotification(
    {
      endpoint: inscricao.endpoint,
      keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
    },
    JSON.stringify({ titulo: conteudo.titulo, corpo: conteudo.corpo, url: conteudo.url }),
  );
}
