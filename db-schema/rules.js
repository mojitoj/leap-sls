const { pgTable, integer, serial } = require("drizzle-orm/pg-core");
const { codes } = require("./codes.js");
const { metadata } = require("./metadata.js");

const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  code_id: integer("code_id")
    .references(() => codes.id)
    .notNull(),
  group_id: integer("group_id")
    .references(() => codes.id)
    .notNull()
});

module.exports = { rules };
