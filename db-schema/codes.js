const {
  pgTable,
  text,
  serial,
  integer,
  varchar,
  uniqueIndex
} = require("drizzle-orm/pg-core");

const { code_systems } = require("./code_systems.js");

const codes = pgTable(
  "codes",
  {
    id: serial("id").primaryKey(),
    system_id: integer("system_id")
      .references(() => code_systems.id)
      .notNull(),
    code: varchar("code", { length: 255 }).notNull(),
    display: text("display"),
    type: varchar("type", { length: 255 }).notNull()
  },
  (table) => {
    return {
      systemCodeUniqueIdx: uniqueIndex("system_code_unique_idx").on(
        table.system_id,
        table.code
      )
    };
  }
);

module.exports = { codes };
