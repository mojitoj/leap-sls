const { knex } = require("../../lib/db/db");

it("database is connected", async () => {
  const response = await knex.raw("select 1;", []);
});
