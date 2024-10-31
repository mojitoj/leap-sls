const { db, pool } = require("../../lib/db/db");
const { codes, metadata, code_group_mappings } = require("../../db-schema");
const { sql } = require("drizzle-orm");

const seedData = async () => {
  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Insert data into codes table
      const codeIds = await tx
        .insert(codes)
        .values([
          {
            id: 1,
            system: "http://snomed.info/sct",
            code: "724713006",
            display: "Harmful use of ketamine (disorder)",
            type: "code"
          },
          {
            id: 2,
            system: "http://hl7.org/fhir/sid/icd-10",
            code: "F19.1",
            display: "Other psychoactive substance abuse",
            type: "code"
          },
          {
            id: 3,
            system: "http://snomed.info/sct",
            code: "145121000119106",
            display: "Intravenous nondependent opioid abuse (disorder)",
            type: "code"
          },
          {
            id: 4,
            system: "http://hl7.org/fhir/sid/icd-10",
            code: "F11.1",
            display: "Opioid abuse",
            type: "code"
          },
          {
            id: 5,
            system: "group",
            code: "ketamine",
            display: "ketamine substance use",
            type: "group"
          },
          {
            id: 6,
            system: "group",
            code: "opiod",
            display: "opiod substance use",
            type: "group"
          },
          {
            id: 7,
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "SUD",
            display: "substance use disorder information sensitivity",
            type: "sensitivity"
          },
          {
            id: 8,
            system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
            code: "R",
            display: "restricted",
            type: "confidentiality"
          }
        ])
        .onConflictDoNothing();

      // Insert data into metadata table
      const metadataIds = await tx.insert(metadata).values([
        {
          id: 1,
          type: "why",
          uri: null,
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "42CFRPart2",
          display: "42 CFR Part2"
        },
        {
          id: 2,
          type: "who",
          uri: null,
          system: null,
          code: null,
          display: "XYZ Security Labeling Service v1.0.2"
        }
      ]).onConflictDoNothing();


      // Insert data into code_group_mappings table
      await tx.insert(code_group_mappings).values([
        { code_id: 5, group_id: 7, metadata_id: 1 },
        { code_id: 6, group_id: 7, metadata_id: 1 },
        { code_id: 7, group_id: 8, metadata_id: 1 },
        { code_id: 1, group_id: 5, metadata_id: null },
        { code_id: 2, group_id: 5, metadata_id: null },
        { code_id: 3, group_id: 6, metadata_id: null },
        { code_id: 4, group_id: 6, metadata_id: null }
      ]);
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

const tearDownDB = async () => {
  await db.execute(sql`TRUNCATE code_group_mappings, metadata, codes;`);
  await pool.end();
};

module.exports = { seedData, tearDownDB };
