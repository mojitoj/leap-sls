DROP VIEW "public"."full_codes";--> statement-breakpoint
CREATE VIEW "public"."full_codes" AS (select "codes"."id", "codes"."code", "code_system_aliases"."alias" from "codes" inner join "code_systems" on "codes"."system_id" = "code_systems"."id" inner join "code_system_aliases" on "code_system_aliases"."system_id" = "code_systems"."id");