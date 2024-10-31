INSERT INTO code_systems VALUES 
    (1, 'LOCAL'),
    (2, 'SNOMED'),
    (3, 'ICD10'),
    (4, 'RXNORM'),
    (5, 'HL7_ACT-CODE'),
    (6, 'HL7_CONFIDENTIALITY')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO code_system_aliases VALUES 
    (2, 'http://snomed.info/sct'),
    (2, '2.16.840.1.113883.6.96'),
    (3, 'http://hl7.org/fhir/sid/icd-10'),
    (3, 'urn:oid:2.16.840.1.113883.6.3'),
    (3, 'http://id.who.int/icd/release/10/2019'),
    (4, 'http://www.nlm.nih.gov/research/umls/rxnorm'),
    (4, '2.16.840.1.113883.6.88'),
    (5, 'http://terminology.hl7.org/CodeSystem/v3-ActCode'),
    (6, 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality')
ON CONFLICT ("system_id", "alias") DO NOTHING;