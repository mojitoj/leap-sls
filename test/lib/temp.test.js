const { getApplicableRuleIdsByCodes, getLabels, getCodeIsByCodes } = require("../../lib/labeling/rules");

it("database is connected", async () => {
  codes = [
    { system: "x", code: "y" },
    { system: "urn:oid:2.16.840.1.113883.6.3", code: "F11.1" }
  ];
  const codeIds = await getLabels(codes);
  console.log(codeIds);
  
});
