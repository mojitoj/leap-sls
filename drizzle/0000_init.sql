CREATE TABLE "code_system_aliases" (
	"system_id" integer NOT NULL,
	"alias" varchar(512) NOT NULL,
	CONSTRAINT "code_system_aliases_system_id_alias_pk" PRIMARY KEY("system_id","alias"),
	CONSTRAINT "code_system_aliases_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "code_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(64) NOT NULL,
	CONSTRAINT "code_systems_display_name_unique" UNIQUE("display_name")
);
--> statement-breakpoint
CREATE TABLE "codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_id" integer NOT NULL,
	"code" varchar(255) NOT NULL,
	"display" text,
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_id" integer NOT NULL,
	"group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"uri" text,
	"system" varchar(255),
	"code" varchar(255),
	"display" text
);
--> statement-breakpoint
CREATE TABLE "rule_metadata" (
	"rule_id" integer NOT NULL,
	"metadata_id" integer NOT NULL,
	CONSTRAINT "rule_metadata_rule_id_metadata_id_pk" PRIMARY KEY("rule_id","metadata_id")
);
--> statement-breakpoint
ALTER TABLE "code_system_aliases" ADD CONSTRAINT "code_system_aliases_system_id_code_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."code_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codes" ADD CONSTRAINT "codes_system_id_code_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."code_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_code_id_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_group_id_codes_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_metadata" ADD CONSTRAINT "rule_metadata_rule_id_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_metadata" ADD CONSTRAINT "rule_metadata_metadata_id_metadata_id_fk" FOREIGN KEY ("metadata_id") REFERENCES "public"."metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."full_codes" AS (select "codes"."id", "codes"."code", "code_system_aliases"."alias", "codes"."display", CONCAT ("code_system_aliases"."alias", '#', "codes"."code") as "system_code" from "codes" inner join "code_systems" on "codes"."system_id" = "code_systems"."id" inner join "code_system_aliases" on "code_system_aliases"."system_id" = "code_systems"."id");