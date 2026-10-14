-- Current official catalogue additions for Academic City University and Ashesi University.
-- Source pages checked on 2026-10-14. These rows remain in review state until admission availability
-- and detailed award requirements are individually checked. Missing fields remain NULL intentionally.
WITH incoming(university_id,name,slug,field,qualification,degree_type,duration,source_url) AS (
  VALUES
  ('2dc0288a-665a-43d0-8ede-f9928ef25f99'::uuid, 'MPhil Material Sciences & Engineering', 'mphil-material-sciences-engineering-acity', 'Material Sciences and Engineering', 'MPhil', 'Postgraduate', NULL, 'https://acity.edu.gh/academic-city-launches-new-programmes-2026/'),
  ('2dc0288a-665a-43d0-8ede-f9928ef25f99'::uuid, 'MSc Management', 'msc-management-acity', 'Management', 'MSc', 'Postgraduate', NULL, 'https://acity.edu.gh/academic-city-launches-new-programmes-2026/'),
  ('2dc0288a-665a-43d0-8ede-f9928ef25f99'::uuid, 'MPhil Robotics Engineering', 'mphil-robotics-engineering-acity', 'Robotics Engineering', 'MPhil', 'Postgraduate', NULL, 'https://acity.edu.gh/academic-city-launches-new-programmes-2026/'),
  ('2dc0288a-665a-43d0-8ede-f9928ef25f99'::uuid, 'MSc Robotics Engineering', 'msc-robotics-engineering-acity', 'Robotics Engineering', 'MSc', 'Postgraduate', NULL, 'https://acity.edu.gh/academic-city-launches-new-programmes-2026/'),
  ('2dc0288a-665a-43d0-8ede-f9928ef25f99'::uuid, 'STEM-MBA', 'stem-mba-acity', 'Science, Technology, Engineering and Mathematics Management', 'MBA', 'Postgraduate', NULL, 'https://acity.edu.gh/academic-city-launches-new-programmes-2026/'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'BSc in Economics', 'bsc-economics-ashesi', 'Economics', 'BSc', 'Undergraduate', NULL, 'https://ashesi.edu.gh/wp-content/uploads/2025/07/Ashesi_Academic_Catalog_2024_25_compressed.pdf'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'MSc in Intelligent Computing Systems', 'msc-intelligent-computing-systems-ashesi', 'Intelligent Computing Systems', 'MSc', 'Postgraduate', '18 months', 'https://ashesi.edu.gh/masters-in-intelligent-computing-systems/'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'MPhil in Intelligent Computing Systems', 'mphil-intelligent-computing-systems-ashesi', 'Intelligent Computing Systems', 'MPhil', 'Postgraduate', '24 months', 'https://ashesi.edu.gh/masters-in-intelligent-computing-systems/'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'Ashesi MBA', 'mba-ashesi', 'Business Administration', 'MBA', 'Postgraduate', '2 years', 'https://ashesi.edu.gh/business-administration/'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'MSc in Mechatronic Engineering', 'msc-mechatronic-engineering-ashesi', 'Mechatronic Engineering', 'MSc', 'Postgraduate', '2 years', 'https://ashesi.edu.gh/master-in-mechatronic-engineering/'),
  ('78b9589b-664d-4ecb-9329-801ef504daf6'::uuid, 'MPhil in Mechatronic Engineering', 'mphil-mechatronic-engineering-ashesi', 'Mechatronic Engineering', 'MPhil', 'Postgraduate', '2 years', 'https://ashesi.edu.gh/master-in-mechatronic-engineering/')
), clean AS (
  SELECT DISTINCT ON (university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g')))
    university_id,name,slug,field,qualification,degree_type,duration,source_url
  FROM incoming
  ORDER BY university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g'))
)
INSERT INTO public.programmes
  (university_id,name,slug,field,qualification,degree_type,duration,programme_url,source_url,
   primary_source_url,source_urls,source_tier,verification_status,verified,needs_review,
   verification_method,verification_notes,notes,field_sources)
SELECT c.university_id,c.name,c.slug,c.field,c.qualification,c.degree_type,c.duration,
       c.source_url,c.source_url,c.source_url,ARRAY[c.source_url],
       'official_institution_catalogue',
       'source_linked_needs_individual_review',false,true,
       'Official institutional programme listing',
       'Programme title and award label are source-linked; current admission availability and detailed requirements still require individual confirmation.',
       'Imported from official institutional catalogue pages checked on 2026-10-14. Not individually verified for current intake.',
       jsonb_build_object('name',c.source_url,'qualification',c.source_url,'institution',c.source_url)
FROM clean c
WHERE NOT EXISTS (
  SELECT 1 FROM public.programmes existing
  WHERE existing.university_id=c.university_id
    AND lower(regexp_replace(existing.name,'[^a-zA-Z0-9]','','g')) =
        lower(regexp_replace(c.name,'[^a-zA-Z0-9]','','g'))
)
ON CONFLICT DO NOTHING;
