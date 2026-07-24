import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { climaCache } from "@/db/schema";
import type { ClimaDoDia } from "./tipos";

/** 1 chamada à API de clima por cidade/dia — a spec pede esse cache explicitamente. */
export async function buscarClimaCache(cidade: string, data: string): Promise<ClimaDoDia | null> {
  const [linha] = await db
    .select()
    .from(climaCache)
    .where(and(eq(climaCache.cidade, cidade), eq(climaCache.data, data)))
    .limit(1);
  return linha?.payload ?? null;
}

export async function salvarClimaCache(cidade: string, data: string, payload: ClimaDoDia): Promise<void> {
  await db
    .insert(climaCache)
    .values({ cidade, data, payload })
    .onConflictDoUpdate({
      target: [climaCache.cidade, climaCache.data],
      set: { payload },
    });
}
