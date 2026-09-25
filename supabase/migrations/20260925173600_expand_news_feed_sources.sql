-- GhanaPathFinder news feed source expansion
insert into public.news_sources(name,url,category,country_code,active,refresh_interval_minutes,created_at,updated_at)
select v.name,v.url,v.category,v.country_code,true,60,now(),now()
from (values
('Techpoint Africa','https://techpoint.africa/feed/','Technology','NG'),
('Citi Newsroom','https://citinewsroom.com/feed/','Ghana','GH'),
('MyJoyOnline','https://www.myjoyonline.com/feed/','Ghana','GH'),
('3News','https://3news.com/feed/','Ghana','GH'),
('Punch Nigeria','https://punchng.com/feed/','Nigeria','NG'),
('BusinessDay Nigeria','https://businessday.ng/feed/','Business','NG'),
('Guardian Nigeria','https://guardian.ng/feed/','Nigeria','NG'),
('Premium Times Nigeria','https://www.premiumtimesng.com/feed','Nigeria','NG'),
('Daily Maverick','https://www.dailymaverick.co.za/feed/','South Africa','ZA'),
('BusinessTech','https://businesstech.co.za/news/feed/','Business','ZA'),
('News24','https://feeds.news24.com/articles/news24/topstories/rss','South Africa','ZA'),
('The New Times Rwanda','https://www.newtimes.co.rw/feed','Rwanda','RW'),
('KT Press Rwanda','https://www.ktpress.rw/feed/','Rwanda','RW'),
('BBC Africa','https://feeds.bbci.co.uk/news/world/africa/rss.xml','Africa',null),
('Al Jazeera Africa','https://www.aljazeera.com/xml/rss/all.xml','Africa',null)
) as v(name,url,category,country_code)
where not exists(select 1 from public.news_sources n where n.url=v.url);