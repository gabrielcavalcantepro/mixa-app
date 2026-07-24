self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push "simples" (sem carregar o look, ver SPEC) — só abre o app na aba
// Hoje quando tocada.
self.addEventListener("push", (event) => {
  let dados = { titulo: "Mixa", corpo: "Seu look do dia chegou.", url: "/hoje" };
  try {
    if (event.data) dados = { ...dados, ...event.data.json() };
  } catch {
    // payload não é JSON válido — usa o padrão acima
  }

  event.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: "/manifest-icon?size=192",
      data: { url: dados.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/hoje";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if (janela.url.includes(url) && "focus" in janela) return janela.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
