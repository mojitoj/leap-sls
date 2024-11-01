INSERT INTO metadata VALUES 
    (1, 'why', null, 'http://terminology.hl7.org/CodeSystem/v3-ActCode', '42CFRPart2', '42 CFR Part2'),
    (2, 'who', null, null, null, 'LEAP+ Security Labeling Service')
ON CONFLICT ("id") DO NOTHING;
