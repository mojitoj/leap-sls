const LABELING_BUNDLE = (resourceIds, labelArrays) => ({
  resourceType: "Bundle",
  type: "transaction",
  entry: resourceIds
    .map((resourceId, index) => ({
      fullUrl: `${resourceId}/$meta-add`,
      resource: {
        resourceType: "Parameters",
        parameter: [
          {
            name: "meta",
            valueMeta: {
              security: labelArrays[index]
            }
          }
        ]
      },
      request: {
        method: "POST",
        url: `${resourceId}/$meta-add`
      }
    }))
    .filter((entry) => entry.resource.parameter[0].valueMeta.security.length)
});

module.exports = { LABELING_BUNDLE };
