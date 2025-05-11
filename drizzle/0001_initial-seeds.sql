INSERT INTO code_systems VALUES 
    (1, 'LOCAL'),
    (2, 'SNOMED'),
    (3, 'ICD10'),
    (4, 'RXNORM'),
    (5, 'HL7_ACT-CODE'),
    (6, 'HL7_CONFIDENTIALITY'),
    (7, 'LOINC'),
    (8, 'CPT')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO code_system_aliases VALUES 
    ('http://snomed.info/sct', 2),
    ('2.16.840.1.113883.6.96', 2),
    ('http://hl7.org/fhir/sid/icd-10', 3),
    ('urn:oid:2.16.840.1.113883.6.3', 3),
    ('http://id.who.int/icd/release/10/2019', 3),
    ('http://www.nlm.nih.gov/research/umls/rxnorm', 4),
    ('2.16.840.1.113883.6.88', 4),
    ('http://terminology.hl7.org/CodeSystem/v3-ActCode', 5),
    ('http://terminology.hl7.org/CodeSystem/v3-Confidentiality', 6),
    ('http://loinc.org', 7),
    ('2.16.840.1.113883.6.1', 7),
    ('http://www.ama-assn.org/go/cpt', 8),
    ('urn:oid:2.16.840.1.113883.6.12', 8)
ON CONFLICT ("alias") DO NOTHING;

INSERT INTO codes VALUES 
    (1, 5, 'SUD', 'substance use disorder information sensitivity', 'sensitivity'),
    (2, 5, 'SEX', 'sexuality and reproductive health information sensitivity', 'sensitivity'),
    (3, 5, 'BH', 'behavioral health information sensitivity', 'sensitivity'),
    (4, 6, 'R', 'restricted', 'confidentiality'),
    (5, 6, 'V', 'very restricted', 'confidentiality')
ON CONFLICT ("id") DO NOTHING;


INSERT INTO metadata VALUES 
    (1, 'why', null, 'http://terminology.hl7.org/CodeSystem/v3-ActCode', '42CFRPart2', '42 CFR Part2'),
    (2, 'who', null, null, null, 'LEAP+ Security Labeling Service')
ON CONFLICT ("id") DO NOTHING;
