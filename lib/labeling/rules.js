const { eq, sql, inArray } = require("drizzle-orm");
const { db } = require("../db/db");
const {
  rules,
  rule_metadata,
  metadata,
  full_codes
} = require("../../db-schema");

async function getCodeIsByCodes(clinicalCodes) {
  if (!clinicalCodes.length) {
    return [];
  }
  const systemCodes = clinicalCodes.map(
    (code) => `${code.system}#${code.code}`
  );
  const rawResults = await db
    .select()
    .from(full_codes)
    .where(inArray(full_codes.system_code, systemCodes));

  return rawResults.map((row) => row.code_id);
}

const getApplicableRulesByCodeIds = (codeIds) =>
  codeIds.length
    ? db
        .select()
        .from(rules)
        .leftJoin(rule_metadata, eq(rule_metadata.rule_id, rules.id))
        .leftJoin(metadata, eq(metadata.id, rule_metadata.metadata_id))
        .where(inArray(rules.code_id, codeIds))
        .execute()
    : [];

const getFullLabels = (codeIds) =>
  codeIds.length
    ? db.select().from(full_codes).where(inArray(full_codes.code_id, codeIds))
    : [];

async function getLabels(codes) {
  const initialCodeIds = await getCodeIsByCodes(codes);

  const firstTierRules = await getApplicableRulesByCodeIds(initialCodeIds);

  const firstTierLabelIds = firstTierRules.map((rule) => rule.rules.group_id);

  const secondTierRules = await getApplicableRulesByCodeIds(firstTierLabelIds);

  const secondtTierLabelIds = secondTierRules.map(
    (rule) => rule.rules.group_id
  );

  const thirdTierRules = await getApplicableRulesByCodeIds(secondtTierLabelIds);

  const thirdTierLabelIds = thirdTierRules.map((rule) => rule.rules.group_id);

  const fourthTierRules = await getApplicableRulesByCodeIds(thirdTierLabelIds);

  const fourthTierLabelIds = fourthTierRules.map((rule) => rule.rules.group_id);

  const fifthTierRules = await getApplicableRulesByCodeIds(fourthTierLabelIds);

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
    (soFar, thisLabel) => ({ ...soFar, [thisLabel.code_id]: thisLabel }),
    {}
  );

  const rulesWithMetadata = combineMetadata(allMatchedRules);

  const fullRules = rulesWithMetadata.map((rule) => ({
    ...rule,
    ...fullLabelsMap[rule.rules.group_id]
  }));

  return fullRules.map((rule) =>
    pickAttributes(["system", "code", "display", "metadata"], rule, [
      "system",
      "code",
      "display",
      "extension"
    ])
  );
}

const rulesWithMetadataMap = (allMatchedRules) =>
  allMatchedRules.reduce(
    (acc, thisRule) =>
      acc[thisRule.rules.id]
        ? {
            ...acc,
            [thisRule.rules.id]: {
              ...acc[thisRule.rules.id],
              metadata: Array.isArray(acc[thisRule.rules.id].metadata)
                ? acc[thisRule.rules.id].metadata.concat(
                    fhirMetadata(thisRule.metadata)
                  )
                : [fhirMetadata(thisRule.metadata)]
            }
          }
        : thisRule.metadata
          ? {
              ...acc,
              [thisRule.rules.id]: {
                ...thisRule,
                metadata: [fhirMetadata(thisRule.metadata)]
              }
            }
          : { ...acc, [thisRule.rules.id]: thisRule },
    {}
  );

const combineMetadata = (allMatchedRules) =>
  Object.values(rulesWithMetadataMap(allMatchedRules));

const pickAttribute = (attributeName, base, rule, renameTo) =>
  rule[attributeName]
    ? { ...base, [renameTo ? renameTo : attributeName]: rule[attributeName] }
    : base;

const pickAttributes = (attributeNames, object, renameTos) =>
  attributeNames.reduce(
    (prev, current, index) =>
      pickAttribute(current, prev, object, renameTos[index]),
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
    ? { url, valueCoding: filterNotNullEntries(value) }
    : value && type == "reference"
      ? { url, valueReference: filterNotNullEntries(value) }
      : null;

const filterNotNullEntries = (obj) =>
  Object.assign(
    {},
    ...Object.entries(obj).map(([k, v]) => v != null && { [k]: v })
  );

async function addRule(fromCode, toCode) {
  //validate: (code, group) (group, sensitivity) (group, confidentiality) (sensitivity, confidentiality)
}

module.exports = {
  getCodeIsByCodes,
  getApplicableRulesByCodeIds,
  getLabels
};
