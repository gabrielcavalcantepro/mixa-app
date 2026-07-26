CREATE TABLE "rotina_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"rotulo" text NOT NULL,
	"emoji" text,
	"ocasiao" "ocasiao" NOT NULL,
	"dias_semana" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rotina_item_avulso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"data" date NOT NULL,
	"rotulo" text NOT NULL,
	"emoji" text,
	"ocasiao" "ocasiao" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rotina_item_oculto" (
	"rotina_item_id" uuid NOT NULL,
	"data" date NOT NULL,
	CONSTRAINT "rotina_item_oculto_rotina_item_id_data_pk" PRIMARY KEY("rotina_item_id","data")
);
--> statement-breakpoint
ALTER TABLE "rotina_item" ADD CONSTRAINT "rotina_item_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotina_item_avulso" ADD CONSTRAINT "rotina_item_avulso_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotina_item_oculto" ADD CONSTRAINT "rotina_item_oculto_rotina_item_id_rotina_item_id_fk" FOREIGN KEY ("rotina_item_id") REFERENCES "public"."rotina_item"("id") ON DELETE cascade ON UPDATE no action;