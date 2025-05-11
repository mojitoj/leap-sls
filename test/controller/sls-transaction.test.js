const { cloneDeep } = require("../../lib/helpers");
const request = require("supertest");
const { app } = require("../../app");

const BUNDLE = require("../fixtures/empty-bundle.json");
const OBSERVATION = require("../fixtures/observations/observations-ketamine.json");
const NON_SENSITIVE_OBSERVATION = require("../fixtures/observations/observation-bacteria.json");

const SLS_ENDPOINT = "/fhir/sls/transaction";

it("should return 200 and a labeled bundle", async () => {
  const bundleOfObservations = cloneDeep(BUNDLE);
  bundleOfObservations.entry = [
    { fullUrl: "1", resource: OBSERVATION },
    { fullUrl: "2", resource: NON_SENSITIVE_OBSERVATION }
  ];
  bundleOfObservations.total = 2;

  const res = await request(app)
    .post(SLS_ENDPOINT)
    .set("Accept", "application/json")
    .send(bundleOfObservations);

  expect(res.status).toEqual(200);
  const transaction = res.body;
  expect(transaction.type).toEqual("transaction");
  expect(transaction.entry.length).toEqual(1);
  expect(transaction.entry[0].fullUrl).toEqual(
    `Observation/${OBSERVATION.id}/$meta-add`
  );
  const labels = transaction.entry[0].resource.parameter[0].valueMeta.security;
  expect(labels.length).toEqual(5);
  expect(
    transaction.entry[0].resource.parameter[0].valueMeta.security
  ).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "SUD"
      }),
      expect.objectContaining({
        system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
        code: "R"
      })
    ])
  );
});

it("should return 200 and a labeled resource", async () => {
  const res = await request(app)
    .post(SLS_ENDPOINT)
    .set("Accept", "application/json")
    .send(OBSERVATION);

  expect(res.status).toEqual(200);
  const transaction = res.body;
  expect(transaction.type).toEqual("transaction");
  expect(transaction.entry.length).toEqual(1);
  expect(transaction.entry[0].fullUrl).toEqual(
    `Observation/${OBSERVATION.id}/$meta-add`
  );
  expect(
    transaction.entry[0].resource.parameter[0].valueMeta.security
  ).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "SUD"
      }),
      expect.objectContaining({
        system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
        code: "R"
      })
    ])
  );
});
