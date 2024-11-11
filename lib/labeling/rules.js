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

const getApplicableRulesByCodeIds = async (codeIds) =>
  codeIds.length
    ? db
        .select()
        .from(rules)
        .leftJoin(rule_metadata, eq(rule_metadata.rule_id, rules.id))
        .leftJoin(metadata, eq(metadata.id, rule_metadata.metadata_id))
        .where(inArray(rules.code_id, codeIds))
        .execute()
    : [];

async function getFullLabels(codeIds) {
  const codesIdSQLArray = sql.join(
    codeIds.map((codeId) => sql`${codeId}`),
    sql.raw(",")
  );
  const fullCodes = await db.execute(
    sql.join(
      [
        sql`SELECT id, code, alias as system, display FROM full_codes WHERE id IN (`,
        codesIdSQLArray,
        sql`)`
      ],
      sql` `
    )
  );
  return fullCodes.rows;
}

async function getLabels(codes) {
  console.log(codes);
  const initialCodeIds = await getCodeIsByCodes(codes);
  console.log(initialCodeIds);


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


  const allMatchedRules = [
    firstTierRules,
    secondTierRules,
    thirdTierRules,
    fourthTierRules,
    fifthTierRules
  ].flat();

  return prepareLabels(allMatchedRules, fullLabels);
}

function prepareLabels(allMatchedRules, fullLabels) {
  const fullLabelsMap = fullLabels.reduce(
    (soFar, thisLabel) => ({ ...soFar, [thisLabel.id]: thisLabel }),
    {}
  );

  const rulesWithMetadata = combineMetadata(allMatchedRules);

  const fullRules = rulesWithMetadata.map((rule) => ({
    ...rule,
    ...fullLabelsMap[rule.rules.group_id]
  }));

  return fullRules.map((rule) =>
    pickAttributes(["system", "code", "display", "metadata"], rule)
  );
}

const combineMetadata = (allMatchedRules) =>
  Object.values(
    allMatchedRules.reduce(
      (sofar, thisOne) =>
        sofar[thisOne.rules.id]
          ? {
              ...sofar,
              [thisOne.rules.id]: {
                ...sofar[thisOne.rules.id],
                metadata: Array.isArray(sofar[thisOne.rules.id].metadata)
                  ? sofar[thisOne.rules.id].metadata.concat(thisOne.metadata)
                  : [
                      fhirMetadata(sofar[thisOne.rules.id].metadata),
                      fhirMetadata(thisOne.metadata)
                    ]
              }
            }
          : { ...sofar, [thisOne.rules.id]: thisOne },
      {}
    )
  );

const pickAttribute = (attributeName, base, rule) =>
  rule[attributeName]
    ? { ...base, [attributeName]: rule[attributeName] }
    : base;

const pickAttributes = (attributeNames, object) =>
  attributeNames.reduce(
    (prev, current) => pickAttribute(current, prev, object),
    {}
  );

const fhirMetadata = ({ type, code, system, display }) =>
  type == "why"
    ? extension(SEC_LABEL_BASIS_URL, { code, system, display }, "coding")
    : type == "who"
      ? extension(SEC_LABEL_CLASSIFIER_URL, { display }, "reference")
      : null;

const SEC_LABEL_BASIS_URL =
  "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-sec-label-basis";

const SEC_LABEL_CLASSIFIER_URL =
  "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-sec-label-classifier";

const extension = (url, value, type) =>
  value && type == "coding"
    ? { url, valueCoding: value }
    : value && type == "reference"
      ? { url, valueReference: value }
      : null;

module.exports = {
  getCodeIsByCodes,
  getApplicableRulesByCodeIds,
  getLabels
};
