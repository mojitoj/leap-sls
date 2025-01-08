const { getLabels } = require("./rules");
const { JSONPath } = require("jsonpath-plus");
const { removeRedundantCodes } = require("../codes");

const labelBundle = async (bundle) => {
  const labeledResources = await Promise.all(
    bundle.entry.map((entry) => labelResource(entry.resource))
  );

  const labeledBundle = {
    ...bundle,
    entry: bundle.entry.map((entry, index) => ({
      ...entry,
      resource: labeledResources[index]
    }))
  };

  return labeledBundle;
};

function addUniqueLabelsToResource(resource, labels) {
  const existingLabels = resource.meta?.security || [];
  const allLabels = removeRedundantCodes([...labels, ...existingLabels]);
  return {
    ...resource,
    meta: {
      ...(resource.meta || {}),
      security: allLabels
    }
  };
}

const determineLabels = async (resource) =>
  getLabels(JSONPath({ path: "$..coding", json: resource }).flat());

async function labelResource(resource) {
  const labels = await determineLabels(resource);
  return addUniqueLabelsToResource(
    { ...resource, updated: labels.length > 0 },
    labels
  );
}

const label = async (object) =>
  object?.resourceType == "Bundle"
    ? labelBundle(object)
    : labelResource(object);

module.exports = {
  labelBundle,
  label
};
