const { cloneDeep } = require("../../lib/helpers");
const request = require("supertest");
const { app } = require("../../app");

const BUNDLE = require("../fixtures/empty-bundle.json");
const OBSERVATION = require("../fixtures/observations/observations-ketamine.json");
const NON_SENSITIVE_OBSERVATION = require("../fixtures/observations/observation-bacteria.json");

const SLS_ENDPOINT = "/fhir/sls/label";

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

  const labels = res.body.entry[0].resource.meta?.security;
  expect(labels).toMatchObject(
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

  expect(res.body?.meta?.security).toMatchObject(
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
