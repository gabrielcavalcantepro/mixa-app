import { relations } from "drizzle-orm";
import { usuarios } from "./usuario";
import { usuarioPerfisComplementares } from "./usuario-perfil-complementar";
import { rotinaItens } from "./rotina-item";
import { rotinaItensAvulsos } from "./rotina-item-avulso";
import { rotinaItensOcultos } from "./rotina-item-oculto";
import { favoritos } from "./favorito";
import { looksExibidos } from "./look-exibido";
import { pushSubscriptions } from "./push-subscription";
import { notificacoesEnviadas } from "./notificacao-enviada";

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  perfisComplementares: many(usuarioPerfisComplementares),
  rotinaItens: many(rotinaItens),
  rotinaItensAvulsos: many(rotinaItensAvulsos),
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

export const rotinaItensRelations = relations(rotinaItens, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [rotinaItens.usuarioId], references: [usuarios.id] }),
  ocultacoes: many(rotinaItensOcultos),
}));

export const rotinaItensAvulsosRelations = relations(rotinaItensAvulsos, ({ one }) => ({
  usuario: one(usuarios, { fields: [rotinaItensAvulsos.usuarioId], references: [usuarios.id] }),
}));

export const rotinaItensOcultosRelations = relations(rotinaItensOcultos, ({ one }) => ({
  item: one(rotinaItens, { fields: [rotinaItensOcultos.rotinaItemId], references: [rotinaItens.id] }),
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
