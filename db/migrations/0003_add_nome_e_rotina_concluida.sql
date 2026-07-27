ALTER TABLE "usuario" ADD COLUMN "nome" text;--> statement-breakpoint
UPDATE "usuario" SET "nome" = split_part("email", '@', 1) WHERE "nome" IS NULL;--> statement-breakpoint
ALTER TABLE "usuario" ALTER COLUMN "nome" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usuario" ADD COLUMN "rotina_concluida_em" timestamp with time zone;--> statement-breakpoint
UPDATE "usuario" SET "rotina_concluida_em" = now() WHERE EXISTS (SELECT 1 FROM "rotina_item" WHERE "rotina_item"."usuario_id" = "usuario"."id");