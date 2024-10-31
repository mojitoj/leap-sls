const {
  pgTable,
  serial,
  varchar,
} = require("drizzle-orm/pg-core");

const code_systems = pgTable("code_systems", {
  id: serial("id").primaryKey(),
  display_name: varchar("display_name", { length: 64 }).notNull().unique()
});

module.exports = { code_systems };
