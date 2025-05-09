const { eq, inArray } = require("drizzle-orm");
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

function prepareGroupMap(allMatchedRules) {
  return allMatchedRules.reduce((groupMap, rule) => {
    const groupId = rule.rules.group_id;
    if (!groupMap[groupId]) {
      groupMap[groupId] = { children: [], metadata: [] };
    }

    groupMap[groupId].children.push({
      code_id: rule.rules.code_id,
      rule_id: rule.rules.id
    });

    if (rule.metadata) {
      const metas = Array.isArray(rule.metadata)
        ? rule.metadata
        : [rule.metadata];
      for (const meta of metas) {
        if (
          meta &&
          !groupMap[groupId].metadata.some(
            (m) => m && m.id === meta.id && m.type === meta.type
          )
        ) {
          groupMap[groupId].metadata.push(meta);
        }
      }
    }

    return groupMap;
  }, {});
}

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

  // fourth and fifth tiers seem of no use
  const fourthTierRules = await getApplicableRulesByCodeIds(thirdTierLabelIds);
  const fourthTierLabelIds = fourthTierRules.map((rule) => rule.rules.group_id);
  const fifthTierRules = await getApplicableRulesByCodeIds(fourthTierLabelIds);

  const allMatchedRules = [
    firstTierRules,
    secondTierRules,
    thirdTierRules,
    fourthTierRules,
    fifthTierRules
  ].flat();

  const groupMap = prepareGroupMap(allMatchedRules);
  return await prepareLabels(groupMap);
}

async function prepareLabels(groupMap) {
  const groupIds = Object.keys(groupMap).map((id) => parseInt(id, 10));
  const rawLabels = await getFullLabels(groupIds);

  return rawLabels.map((label) => {
    const entry = groupMap[label.code_id] || { metadata: [] };
    const extensions = (entry.metadata || []).map(fhirMetadata).filter(Boolean);
    const labelObj = {
      system: label.system,
      code: label.code,
      display: label.display
    };
    if (extensions.length) {
      labelObj.extension = extensions;
    }
    return labelObj;
  });
}

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
  getLabels,
  prepareGroupMap,
  prepareLabels
};
