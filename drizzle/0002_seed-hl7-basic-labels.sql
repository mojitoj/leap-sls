INSERT INTO codes VALUES 
    (1, 5, 'SUD', 'substance use disorder information sensitivity', 'sensitivity'),
    (2, 5, 'SEX', 'sexuality and reproductive health information sensitivity', 'sensitivity'),
    (3, 5, 'BH', 'behavioral health information sensitivity', 'sensitivity'),
    (4, 6, 'R', 'restricted', 'confidentiality'),
    (5, 6, 'V', 'very restricted', 'confidentiality')
ON CONFLICT ("id") DO NOTHING;
