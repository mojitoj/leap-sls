const { db } = require("../../lib/db/db");
const { sql } = require("drizzle-orm");

it("database is connected", async () => {
  await db.execute(sql`select 1`);
});

it("tables exist is connected", async () => {
  await db.execute(sql`select * from codes;`);
  await db.execute(sql`select * from rules;`);
  await db.execute(sql`select * from metadata;`);
  await db.execute(sql`select * from full_codes;`);
});
