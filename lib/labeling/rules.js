const { eq, sql, inArray } = require("drizzle-orm");
const { db } = require("../db/db");
const { rules, rule_metadata, metadata } = require("../../db-schema");

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
    ? db
        .select()
        .from(rules)
        .leftJoin(rule_metadata, eq(rule_metadata.rule_id, rules.id))
        .leftJoin(metadata, eq(metadata.id, rule_metadata.metadata_id))
        .where(inArray(rules.code_id, codeIds))
        .execute()
    : [];
}

async function getFullLabels(codeIds) {
  const codesIdSQLArray = sql.join(
    codeIds.map((codeId) => sql`${codeId}`),
    sql.raw(",")
  );
  const fullCodes = await db.execute(
    sql.join(
      [
        sql`SELECT id, code, alias, display FROM full_codes WHERE id IN (`,
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

  const firstTierRules = await getApplicableRulesByCodeIds(initialCodeIds);
  console.log(firstTierRules);
  const firstTierLabelIds = firstTierRules.map((rule) => rule.rules.group_id);

  const secondTierRules = await getApplicableRulesByCodeIds(firstTierLabelIds);
  console.log(secondTierRules);
  const secondtTierLabelIds = secondTierRules.map(
    (rule) => rule.rules.group_id
  );

  const thirdTierRules = await getApplicableRulesByCodeIds(secondtTierLabelIds);
  console.log(thirdTierRules);
  const thirdTierLabelIds = thirdTierRules.map((rule) => rule.rules.group_id);

  const fourthTierRules = await getApplicableRulesByCodeIds(thirdTierLabelIds);
  console.log(fourthTierRules);
  const fourthTierLabelIds = fourthTierRules.map((rule) => rule.rules.group_id);

  const fifthTierRules = await getApplicableRulesByCodeIds(fourthTierLabelIds);
  console.log(fifthTierRules);
  const fifthTierLabelIds = fifthTierRules.map((rule) => rule.rules.group_id);

  const fullLabels = await getFullLabels(
    [
      firstTierLabelIds,
      secondtTierLabelIds,
      thirdTierLabelIds,
      fourthTierLabelIds,
      fifthTierLabelIds
    ].flat()
  );

  const fullLabelsMap = fullLabels.reduce(
    (soFar, thisLabel) => ({ ...soFar, [thisLabel.id]: thisLabel }),
    {}
  );

  const allMatchedRules = [
    firstTierRules,
    secondTierRules,
    thirdTierRules,
    fourthTierRules,
    fifthTierRules
  ]
    .flat()
    .map((rule) => ({ ...rule, ...fullLabelsMap[rule.rules.group_id] }))
    .map(
      ({
        code,
        display,
        system,
        metadata
      }) => ({
        code,
        display,
        system,
        metadata
      })
    );

  console.log(fullLabelsMap);
  console.log(allMatchedRules);
  // return fullLabels.map((label) => ({
  //   code: label.code,
  //   display: label.display,
  //   system: label.alias
  // }));
}

module.exports = {
  getCodeIsByCodes,
  getApplicableRulesByCodeIds,
  getLabels
};
