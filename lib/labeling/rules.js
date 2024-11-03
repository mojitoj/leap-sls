const { eq, sql, inArray } = require("drizzle-orm");
const { db } = require("../db/db");
const {
  codes,
  rules,
  code_systems,
  code_system_aliases,
  rule_metadata,
  full_codes
} = require("../../db-schema");

// async function getApplicableRuleIdsByCodes(clinicalCodes) {
//   const codesSQLArray = sql.join(
//     clinicalCodes.map((code) => sql`(${code.system}, ${code.code})`),
//     sql.raw(",")
//   );

//   const sqlChunks = [];
//   sqlChunks.push(sql`SELECT rules.id, rules.group_id FROM rules`);
//   sqlChunks.push(sql`JOIN codes ON (rules.group_id=codes.id)`);
//   sqlChunks.push(sql`WHERE code_id IN`);
//   sqlChunks.push(
//     sql` (SELECT full_codes.id FROM full_codes WHERE (alias, code) IN (`
//   );
//   sqlChunks.push(codesSQLArray);
//   sqlChunks.push(sql`)`);
//   sqlChunks.push(sql`)`);

//   const finalQuery = sql.join(sqlChunks, sql.raw(" "));

//   const rawResults = await db.execute(finalQuery);
//   return rawResults.rows;
// }

async function getCodeIsByCodes(clinicalCodes) {
  const codesSQLArray = sql.join(
    clinicalCodes.map((code) => sql`(${code.system}, ${code.code})`),
    sql.raw(",")
  );

  const sqlChunks = [];
  sqlChunks.push(
    sql`SELECT full_codes.id FROM full_codes WHERE (alias, code) IN (`
  );
  sqlChunks.push(codesSQLArray);
  sqlChunks.push(sql`)`);

  const finalQuery = sql.join(sqlChunks, sql.raw(" "));

  const rawResults = await db.execute(finalQuery);
  return rawResults.rows.map((row) => row.id);
}

async function getApplicableRulesByCodeIds(codeIds) {
  return codeIds.length
    ? db.select().from(rules).where(inArray(rules.code_id, codeIds)).execute()
    : [];
}

// async function getFullLabel(label) {
//   const fullCode = await db
//     .select()
//     .from(rules)
//     .innerJoin(codes, eq(rules.group_id, codes.id))
//     .innerJoin(code_systems, eq(codes.system_id, code_systems.id))
//     .innerJoin(
//       code_system_aliases,
//       eq(code_system_aliases.system_id, code_systems.id)
//     )
//     .where(inArray(rules.id, applicableRules))
//     .execute();
//   return fullCode;
// }
async function getFullLabels(codeIds) {
  const codesIdSQLArray = sql.join(
    codeIds.map((codeId) => sql`${codeId}`),
    sql.raw(",")
  );
  const fullCodes = await db.execute(
    sql.join(
      [
        sql`SELECT code, alias, display FROM full_codes WHERE id IN (`,
        codesIdSQLArray,
        sql`)`
      ],
      sql` `
    )
  );
  return fullCodes.rows;
}

async function getLabels(codes) {
  const initialCodeIds = await getCodeIsByCodes(codes);
  console.log(initialCodeIds);
  const firstTierRules = await getApplicableRulesByCodeIds(initialCodeIds);
  const firstTierLabelIds = firstTierRules.map((rule) => rule.group_id);

  const secondTierRules = await getApplicableRulesByCodeIds(firstTierLabelIds);
  const secondtTierLabelIds = secondTierRules.map((rule) => rule.group_id);

  const thirdTierRules = await getApplicableRulesByCodeIds(secondtTierLabelIds);
  const thirdTierLabelIds = thirdTierRules.map((rule) => rule.group_id);

  const fourthTierRules = await getApplicableRulesByCodeIds(thirdTierLabelIds);
  const fourthTierLabelIds = fourthTierRules.map((rule) => rule.group_id);

  const fifthTierRules = await getApplicableRulesByCodeIds(fourthTierLabelIds);
  const fifthTierLabelIds = fifthTierRules.map((rule) => rule.group_id);

  const fullLabels = await getFullLabels(
    [
      firstTierLabelIds,
      secondtTierLabelIds,
      thirdTierLabelIds,
      fourthTierLabelIds,
      fifthTierLabelIds
    ].flat()
  );
  return fullLabels.map((label) => ({
    code: label.code,
    display: label.display,
    system: label.alias
  }));
}

module.exports = {
  getCodeIsByCodes,
  getApplicableRulesByCodeIds,
  getLabels
};
