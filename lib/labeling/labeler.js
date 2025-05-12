const { getLabels } = require("./rules");
const { JSONPath } = require("jsonpath-plus");
const { LABELING_BUNDLE } = require("./labeling-bundle");
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

function uniqueLabels(resource, labels) {
  const existingLabels = resource.meta?.security || [];
  return removeRedundantCodes([...labels, ...existingLabels]);
}

const addUniqueLabelsToResource = (resource, labels) => ({
  ...resource,
  meta: {
    ...(resource.meta || {}),
    security: uniqueLabels(resource, labels)
  }
});

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

async function labelingTransactionForBundle(bundle) {
  const resources = bundle.entry.map((entry) => entry.resource);
  const resourceIds = resources.map(
    (resource) => `${resource.resourceType}/${resource.id}`
  );
  const labelsArray = await Promise.all(
    resources.map((resource) => determineLabels(resource))
  );

  return LABELING_BUNDLE(
    resourceIds,
    labelsArray.map((labels, index) => uniqueLabels(resources[index], labels))
  );
}
async function labelingTransactionForResource(resource) {
  const labels = await determineLabels(resource);
  const resourceId = `${resource.resourceType}/${resource.id}`;
  return LABELING_BUNDLE([resourceId], [uniqueLabels(resource, labels)]);
}

const labelingTransaction = async (object) =>
  object?.resourceType == "Bundle"
    ? labelingTransactionForBundle(object)
    : labelingTransactionForResource(object);

module.exports = {
  labelBundle,
  label,
  labelingTransaction
};
