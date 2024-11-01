const { pgTable, primaryKey, integer } = require("drizzle-orm/pg-core");

const { rules } = require("./rules.js");
const { metadata } = require("./metadata.js");

const rule_metadata = pgTable(
  "rule_metadata",
  {
    rule_id: integer("rule_id")
      .references(() => rules.id)
      .notNull(),
    metadata_id: integer("metadata_id")
      .references(() => metadata.id)
      .notNull()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.rule_id, table.metadata_id] })
    };
  }
);

module.exports = { rule_metadata };
