INSERT INTO code_system_aliases VALUES 
    ('local_code_group', 1)
ON CONFLICT ("alias") DO NOTHING;

INSERT INTO codes VALUES 
  (6, 5, 'HIV', 'HIV/AIDS information sensitivity', 'sensitivity'),
  (7, 5, 'SDV', 'Sexual assault, abuse, or domestic violence information sensitivity', 'sensitivity'),  
  -- Refined substance use categories
  (8, 5, 'OPIOIDUD', 'Opioid use disorder information sensitivity', 'sensitivity'),
  (9, 5, 'ETH', 'Substance abuse treatment information sensitivity', 'sensitivity'),
  -- Refined behavioral health categories
  (10, 5, 'PSY', 'Psychiatry information sensitivity', 'sensitivity'),
  (11, 5, 'PSYTHPN', 'Psychotherapy note information sensitivity', 'sensitivity'),
  (12, 5, 'BHDS', 'Behavioral and developmental disability information sensitivity', 'sensitivity')
ON CONFLICT ("id") DO NOTHING;


