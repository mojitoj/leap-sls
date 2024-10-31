const {
  pgTable,
  primaryKey,
  integer,
  varchar
} = require("drizzle-orm/pg-core");

const { code_systems } = require("./code_systems.js");

const code_system_aliases = pgTable(
  "code_system_aliases",
  {
    system_id: integer("system_id")
      .references(() => code_systems.id)
      .notNull(),
    alias: varchar("alias", { length: 512 }).notNull().unique()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.system_id, table.alias] })
    };
  }
);

module.exports = { code_system_aliases };
