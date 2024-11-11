const { getLabels } = require("../../lib/labeling/rules");
const { JSONPath } = require("jsonpath-plus");

const OBSERVATION = require("../fixtures/observations/observations-ketamine.json");

it("database is connected", async () => {
  const labels = await label(OBSERVATION);
  console.log(JSON.stringify(labels, null, 2));
});

const label = (object) =>
  object?.resourceType == "Bundle"
    ? labelBundle(object)
    : labelResource(object);

function labelResource(object) {
  const clinicalCodes = JSONPath({
    path: "$..coding",
    json: object
  }).flat();

  return getLabels(clinicalCodes);
}

async function labelBundle(bundle) {
  const labeledResource = await labelResource(entry.resource);
  return {
    ...bundle,
    entry: bundle.entry.map((entry) => ({
      ...entry,
      resource: sanitizeResource(labeledResource)
    }))
  };
}

/**
 * remove the 'updated' attribute used to track which resources were update in the course of labeling.
 */
function sanitizeResource(resource) {
  const { updated, ...rest } = resource;
  return rest;
}
