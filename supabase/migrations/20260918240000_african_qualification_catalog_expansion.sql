-- Expand GhanaPathFinder's African secondary qualification catalog.
-- National qualifications are stored as review_required unless a University of Ghana equivalence
-- has been explicitly verified. This prevents unsupported automatic eligibility claims.

insert into public.qualification_catalog
(code,name,country_code,family,grading_scale,levels,grades,metadata,enabled)
values
('UCE','Uganda Certificate of Education','UG','national_secondary','Grades 1–9','{}','{"1","2","3","4","5","6","7","8","9"}','{"verification_status":"review_required"}',true),
('UACE','Uganda Advanced Certificate of Education','UG','national_advanced','A–E / O–F','{}','{"A","B","C","D","E","O","F"}','{"verification_status":"review_required"}',true),
('CSEE','Certificate of Secondary Education Examination','TZ','national_secondary','A–F','{}','{"A","B+","B","C","D","E","F"}','{"verification_status":"review_required"}',true),
('ACSEE','Advanced Certificate of Secondary Education Examination','TZ','national_advanced','A–F','{}','{"A","B+","B","C","D","E","F"}','{"verification_status":"review_required"}',true),
('RW_AL','Rwanda Advanced Level','RW','national_advanced','A–F / S / U','{}','{"A","B","C","D","E","F","S","U"}','{"verification_status":"review_required"}',true),
('CAM_GCE','Cameroon GCE','CM','national_secondary','A–E / U','{}','{"A","B","C","D","E","U"}','{"verification_status":"review_required"}',true),
('BGCSE','Botswana General Certificate of Secondary Education','BW','national_secondary','A*–G','{}','{"A*","A","B","C","D","E","F","G"}','{"verification_status":"review_required"}',true),
('NSSC','Namibian Senior Secondary Certificate','NA','national_secondary','A*–U','{}','{"A*","A","B","C","D","E","F","G","H","U"}','{"verification_status":"review_required"}',true),
('MSCE','Malawi School Certificate of Education','MW','national_secondary','1–9','{}','{"1","2","3","4","5","6","7","8","9"}','{"verification_status":"review_required"}',true),
('ZAMBIA_SCHOOL_CERT','Zambia School Certificate','ZM','national_secondary','1–9','{}','{"1","2","3","4","5","6","7","8","9"}','{"verification_status":"review_required"}',true),
('ZIMSEC','ZIMSEC Advanced Level','ZW','national_advanced','A–E / U','{}','{"A","B","C","D","E","U"}','{"verification_status":"review_required"}',true),
('LGCSE','Lesotho General Certificate of Secondary Education','LS','national_secondary','A*–G','{}','{"A*","A","B","C","D","E","F","G"}','{"verification_status":"review_required"}',true),
('EGCSE','Eswatini General Certificate of Secondary Education','SZ','national_secondary','A*–G','{}','{"A*","A","B","C","D","E","F","G"}','{"verification_status":"review_required"}',true),
('MOZ_HSC','Mozambique Secondary School Certificate','MZ','national_secondary','0–20','{}','{}','{"verification_status":"review_required"}',true),
('ANG_SEC','Angola Secondary School Diploma','AO','national_secondary','0–20','{}','{}','{"verification_status":"review_required"}',true),
('EGYPT_THANAWIYA','Egyptian General Secondary Education Certificate','EG','national_secondary','0–100','{}','{}','{"verification_status":"review_required"}',true),
('MOROCCO_BAC','Moroccan Baccalaureate','MA','national_secondary','0–20','{}','{}','{"verification_status":"review_required"}',true),
('ALGERIA_BAC','Algerian Baccalaureate','DZ','national_secondary','0–20','{}','{}','{"verification_status":"review_required"}',true),
('TUNISIA_BAC','Tunisian Baccalaureate','TN','national_secondary','0–20','{}','{}','{"verification_status":"review_required"}',true),
('ETHIOPIA_SECONDARY','Ethiopian Secondary School Leaving Examination','ET','national_secondary','0–100','{}','{}','{"verification_status":"review_required"}',true)
on conflict (code) do update set name=excluded.name,country_code=excluded.country_code,family=excluded.family,grading_scale=excluded.grading_scale,grades=excluded.grades,metadata=excluded.metadata,enabled=true,updated_at=now();

insert into public.country_qualification_mapping(country_code,qualification_code,notes,verification_status)
values
('UG','UCE','Uganda secondary qualification; University of Ghana equivalence requires review','review_required'),
('UG','UACE','Uganda advanced qualification; University of Ghana equivalence requires review','review_required'),
('TZ','CSEE','Tanzania secondary qualification; University of Ghana equivalence requires review','review_required'),
('TZ','ACSEE','Tanzania advanced qualification; University of Ghana equivalence requires review','review_required'),
('RW','RW_AL','Rwanda advanced qualification; University of Ghana equivalence requires review','review_required'),
('CM','CAM_GCE','Cameroon GCE route; University of Ghana equivalence requires review','review_required'),
('BW','BGCSE','Botswana secondary qualification; University of Ghana equivalence requires review','review_required'),
('NA','NSSC','Namibia secondary qualification; University of Ghana equivalence requires review','review_required'),
('MW','MSCE','Malawi secondary qualification; University of Ghana equivalence requires review','review_required'),
('ZM','ZAMBIA_SCHOOL_CERT','Zambia secondary qualification; University of Ghana equivalence requires review','review_required'),
('ZW','ZIMSEC','Zimbabwe advanced qualification; University of Ghana equivalence requires review','review_required'),
('LS','LGCSE','Lesotho secondary qualification; University of Ghana equivalence requires review','review_required'),
('SZ','EGCSE','Eswatini secondary qualification; University of Ghana equivalence requires review','review_required'),
('MZ','MOZ_HSC','Mozambique secondary qualification; University of Ghana equivalence requires review','review_required'),
('AO','ANG_SEC','Angola secondary qualification; University of Ghana equivalence requires review','review_required'),
('EG','EGYPT_THANAWIYA','Egypt secondary qualification; University of Ghana equivalence requires review','review_required'),
('MA','MOROCCO_BAC','Morocco secondary qualification; University of Ghana equivalence requires review','review_required'),
('DZ','ALGERIA_BAC','Algeria secondary qualification; University of Ghana equivalence requires review','review_required'),
('TN','TUNISIA_BAC','Tunisia secondary qualification; University of Ghana equivalence requires review','review_required'),
('ET','ETHIOPIA_SECONDARY','Ethiopia secondary qualification; University of Ghana equivalence requires review','review_required')
on conflict (country_code,qualification_code) do update set notes=excluded.notes,verification_status=excluded.verification_status;
