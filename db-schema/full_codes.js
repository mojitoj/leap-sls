const { eq } = require("drizzle-orm");
const { pgView } = require("drizzle-orm/pg-core");
const { codes } = require("./codes");
const { code_systems } = require("./code_systems");
const { code_system_aliases } = require("./code_system_aliases");

const full_codes = pgView("full_codes").as((qb) =>
  qb
    .select({
      code_id: codes.id,
      code: codes.code,
      system: code_system_aliases.alias
    })
    .from(codes)
    .innerJoin(code_systems, eq(codes.system_id, code_systems.id))
    .innerJoin(
      code_system_aliases,
      eq(code_system_aliases.system_id, code_systems.id)
    )
    .where(eq(codes.type, "code"))
);

module.exports = { full_codes };
