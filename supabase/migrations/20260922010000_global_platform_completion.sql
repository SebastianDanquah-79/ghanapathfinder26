-- Global platform completion migration.
-- Preserves the existing africa_leaders schema and profile bundle behavior.

ALTER FUNCTION public.save_profile_bundle(text,text,text,text,text,text,text[],text[],text,text,text,text,jsonb,jsonb,jsonb,text,text,text)
  SECURITY INVOKER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='africa_leaders' AND policyname='Public can read Africa leaders'
  ) THEN
    CREATE POLICY "Public can read Africa leaders"
      ON public.africa_leaders FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

INSERT INTO public.africa_leaders
  (country_code,country_name,country_code_alpha2,name,role,title,took_office,is_current,official_source_url,biography)
SELECT
  v.iso3,v.country,v.iso2,v.leader,v.role,v.title,v.started,true,
  'https://www.un.org/dgacm/en/node/4316',
  v.leader || ' serves as ' || v.title || ' of ' || v.country || '.'
FROM (VALUES
('DZA','Algeria','DZ','Abdelmadjid Tebboune','President','President','2019-12-19'::date),
('AGO','Angola','AO','João Lourenço','President','President','2017-09-26'::date),
('BEN','Benin','BJ','Patrice Talon','President','President','2016-04-06'::date),
('BWA','Botswana','BW','Duma Boko','President','President','2024-11-08'::date),
('BFA','Burkina Faso','BF','Ibrahim Traoré','President','President','2022-10-06'::date),
('BDI','Burundi','BI','Évariste Ndayishimiye','President','President','2020-06-18'::date),
('CPV','Cabo Verde','CV','Ulisses Correia e Silva','Prime Minister','Prime Minister','2016-04-22'::date),
('CMR','Cameroon','CM','Paul Biya','President','President','1982-11-06'::date),
('CAF','Central African Republic','CF','Faustin-Archange Touadéra','President','President','2016-03-30'::date),
('TCD','Chad','TD','Mahamat Idriss Déby','President','President','2021-04-20'::date),
('COM','Comoros','KM','Azali Assoumani','President','President','2016-05-26'::date),
('COG','Republic of the Congo','CG','Denis Sassou Nguesso','President','President','1997-10-25'::date),
('COD','Democratic Republic of the Congo','CD','Félix Tshisekedi','President','President','2019-01-24'::date),
('CIV','Côte d’Ivoire','CI','Alassane Ouattara','President','President','2010-12-04'::date),
('DJI','Djibouti','DJ','Ismaïl Omar Guelleh','President','President','1999-05-08'::date),
('EGY','Egypt','EG','Abdel Fattah el-Sisi','President','President','2014-06-08'::date),
('GNQ','Equatorial Guinea','GQ','Teodoro Obiang Nguema Mbasogo','President','President','1979-08-03'::date),
('ERI','Eritrea','ER','Isaias Afwerki','President','President','1993-05-24'::date),
('SWZ','Eswatini','SZ','Mswati III','King','King','1986-04-25'::date),
('ETH','Ethiopia','ET','Abiy Ahmed','Prime Minister','Prime Minister','2018-04-02'::date),
('GAB','Gabon','GA','Brice Oligui Nguema','President','President','2023-09-04'::date),
('GMB','Gambia','GM','Adama Barrow','President','President','2017-01-19'::date),
('GHA','Ghana','GH','John Mahama','President','President','2025-01-07'::date),
('GIN','Guinea','GN','Mamadi Doumbouya','President','President','2021-09-17'::date),
('GNB','Guinea-Bissau','GW','Umaro Sissoco Embaló','President','President','2020-02-27'::date),
('KEN','Kenya','KE','William Ruto','President','President','2022-09-13'::date),
('LSO','Lesotho','LS','Sam Matekane','Prime Minister','Prime Minister','2022-10-28'::date),
('LBR','Liberia','LR','Joseph Boakai','President','President','2024-01-22'::date),
('LBY','Libya','LY','Abdul Hamid Dbeibeh','Prime Minister','Prime Minister','2021-03-15'::date),
('MDG','Madagascar','MG','Michael Randrianirina','President','President','2025-10-14'::date),
('MWI','Malawi','MW','Lazarus Chakwera','President','President','2020-06-28'::date),
('MLI','Mali','ML','Assimi Goïta','President','President','2021-06-07'::date),
('MRT','Mauritania','MR','Mohamed Ould Ghazouani','President','President','2019-08-01'::date),
('MUS','Mauritius','MU','Navin Ramgoolam','Prime Minister','Prime Minister','2024-11-13'::date),
('MAR','Morocco','MA','Mohammed VI','King','King','1999-07-23'::date),
('MOZ','Mozambique','MZ','Daniel Chapo','President','President','2025-01-15'::date),
('NAM','Namibia','NA','Netumbo Nandi-Ndaitwah','President','President','2025-03-21'::date),
('NER','Niger','NE','Abdourahamane Tchiani','President','President','2023-07-28'::date),
('NGA','Nigeria','NG','Bola Tinubu','President','President','2023-05-29'::date),
('RWA','Rwanda','RW','Paul Kagame','President','President','2000-04-22'::date),
('STP','São Tomé and Príncipe','ST','Patrice Trovoada','Prime Minister','Prime Minister','2022-11-11'::date),
('SEN','Senegal','SN','Bassirou Diomaye Faye','President','President','2024-04-02'::date),
('SYC','Seychelles','SC','Patrick Herminie','President','President','2025-10-26'::date),
('SLE','Sierra Leone','SL','Julius Maada Bio','President','President','2018-04-04'::date),
('SOM','Somalia','SO','Hassan Sheikh Mohamud','President','President','2022-05-23'::date),
('ZAF','South Africa','ZA','Cyril Ramaphosa','President','President','2018-02-15'::date),
('SSD','South Sudan','SS','Salva Kiir Mayardit','President','President','2005-07-30'::date),
('SDN','Sudan','SD','Abdel Fattah al-Burhan','President of the Transitional Sovereignty Council','President of the Transitional Sovereignty Council','2019-08-21'::date),
('TZA','Tanzania','TZ','Samia Suluhu Hassan','President','President','2021-03-19'::date),
('TGO','Togo','TG','Jean-Lucien Savi de Tové','President','President','2025-05-03'::date),
('TUN','Tunisia','TN','Kais Saied','President','President','2019-10-23'::date),
('UGA','Uganda','UG','Yoweri Museveni','President','President','1986-01-29'::date),
('ZMB','Zambia','ZM','Hakainde Hichilema','President','President','2021-08-24'::date),
('ZWE','Zimbabwe','ZW','Emmerson Mnangagwa','President','President','2017-11-24'::date)
) AS v(iso3,country,iso2,leader,role,title,started)
WHERE NOT EXISTS (
  SELECT 1 FROM public.africa_leaders l
  WHERE l.country_code_alpha2=v.iso2 AND l.is_current=true
);
