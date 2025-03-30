const {
  pgTable,
  integer,
  varchar
} = require("drizzle-orm/pg-core");

const { code_systems } = require("./code_systems.js");

const code_system_aliases = pgTable("code_system_aliases", {
  alias: varchar("alias", { length: 512 }).primaryKey(),
  system_id: integer("system_id")
    .references(() => code_systems.id)
    .notNull()
});

module.exports = { code_system_aliases };
