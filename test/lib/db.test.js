const { db } = require("../../lib/db/db");
const { sql } = require("drizzle-orm");

it("database is connected", async () => {
  await db.execute(sql`select 1`);
});

it("tables exist is connected", async () => {
  await db.execute(sql`select 1 from codes;`);
  await db.execute(sql`select 1 from code_group_mappings;`);
  await db.execute(sql`select 1 from metadata;`);
});
