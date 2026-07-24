import { relations } from "drizzle-orm";
import { usuarios } from "./usuario";
import { usuarioPerfisComplementares } from "./usuario-perfil-complementar";
import { rotinaDias } from "./rotina-dia";
import { ajustesDiarios } from "./ajuste-diario";
import { favoritos } from "./favorito";
import { looksExibidos } from "./look-exibido";
import { pushSubscriptions } from "./push-subscription";
import { notificacoesEnviadas } from "./notificacao-enviada";

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  perfisComplementares: many(usuarioPerfisComplementares),
  rotinaDias: many(rotinaDias),
  ajustesDiarios: many(ajustesDiarios),
  favoritos: many(favoritos),
  looksExibidos: many(looksExibidos),
  pushSubscriptions: many(pushSubscriptions),
  notificacoesEnviadas: many(notificacoesEnviadas),
}));

export const usuarioPerfisComplementaresRelations = relations(
  usuarioPerfisComplementares,
  ({ one }) => ({
    usuario: one(usuarios, {
      fields: [usuarioPerfisComplementares.usuarioId],
      references: [usuarios.id],
    }),
  }),
);

export const rotinaDiasRelations = relations(rotinaDias, ({ one }) => ({
  usuario: one(usuarios, { fields: [rotinaDias.usuarioId], references: [usuarios.id] }),
}));

export const ajustesDiariosRelations = relations(ajustesDiarios, ({ one }) => ({
  usuario: one(usuarios, { fields: [ajustesDiarios.usuarioId], references: [usuarios.id] }),
}));

export const favoritosRelations = relations(favoritos, ({ one }) => ({
  usuario: one(usuarios, { fields: [favoritos.usuarioId], references: [usuarios.id] }),
}));

export const looksExibidosRelations = relations(looksExibidos, ({ one }) => ({
  usuario: one(usuarios, { fields: [looksExibidos.usuarioId], references: [usuarios.id] }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  usuario: one(usuarios, { fields: [pushSubscriptions.usuarioId], references: [usuarios.id] }),
}));

export const notificacoesEnviadasRelations = relations(notificacoesEnviadas, ({ one }) => ({
  usuario: one(usuarios, { fields: [notificacoesEnviadas.usuarioId], references: [usuarios.id] }),
}));
