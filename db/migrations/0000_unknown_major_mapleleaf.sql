CREATE TYPE "public"."ocasiao" AS ENUM('trabalho', 'lazer', 'casa', 'treino', 'evento');--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"cidade" text,
	"cidade_lat" text,
	"cidade_lon" text,
	"perfil_dominante_id" text,
	"notificacao_horario" time DEFAULT '07:00:00' NOT NULL,
	"trial_iniciado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"tutorial_instalacao_visto_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "usuario_perfil_complementar" (
	"usuario_id" uuid NOT NULL,
	"perfil_estilo_id" text NOT NULL,
	CONSTRAINT "usuario_perfil_complementar_usuario_id_perfil_estilo_id_pk" PRIMARY KEY("usuario_id","perfil_estilo_id")
);
--> statement-breakpoint
CREATE TABLE "rotina_dia" (
	"usuario_id" uuid NOT NULL,
	"dia_semana" integer NOT NULL,
	"ocasiao" "ocasiao" NOT NULL,
	CONSTRAINT "rotina_dia_usuario_id_dia_semana_pk" PRIMARY KEY("usuario_id","dia_semana")
);
--> statement-breakpoint
CREATE TABLE "ajuste_diario" (
	"usuario_id" uuid NOT NULL,
	"data" date NOT NULL,
	"ocasiao" "ocasiao" NOT NULL,
	CONSTRAINT "ajuste_diario_usuario_id_data_pk" PRIMARY KEY("usuario_id","data")
);
--> statement-breakpoint
CREATE TABLE "favorito" (
	"usuario_id" uuid NOT NULL,
	"look_id" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorito_usuario_id_look_id_pk" PRIMARY KEY("usuario_id","look_id")
);
--> statement-breakpoint
CREATE TABLE "look_exibido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"look_id" text NOT NULL,
	"exibido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clima_cache" (
	"cidade" text NOT NULL,
	"data" date NOT NULL,
	"payload" jsonb NOT NULL,
	CONSTRAINT "clima_cache_cidade_data_pk" PRIMARY KEY("cidade","data")
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscription_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "notificacao_enviada" (
	"usuario_id" uuid NOT NULL,
	"data" date NOT NULL,
	"enviado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notificacao_enviada_usuario_id_data_pk" PRIMARY KEY("usuario_id","data")
);
--> statement-breakpoint
ALTER TABLE "usuario_perfil_complementar" ADD CONSTRAINT "usuario_perfil_complementar_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotina_dia" ADD CONSTRAINT "rotina_dia_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajuste_diario" ADD CONSTRAINT "ajuste_diario_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "look_exibido" ADD CONSTRAINT "look_exibido_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacao_enviada" ADD CONSTRAINT "notificacao_enviada_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;