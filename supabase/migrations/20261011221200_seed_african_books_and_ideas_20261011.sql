insert into public.book_catalog (title, author, publication_year, subject, description, source_url)
select seed.title, seed.author, seed.publication_year, seed.subject, seed.description, seed.source_url
from (values
  ('Things Fall Apart', 'Chinua Achebe', 1958, 'Literature · Nigeria', 'A foundational novel exploring Igbo society, social change and colonial contact in Nigeria.', 'https://www.penguinrandomhouse.com/books/565351/things-fall-apart-by-chinua-achebe/9780307743855/'),
  ('Homegoing', 'Yaa Gyasi', 2016, 'Literature · Ghana · Diaspora', 'A multi-generational novel tracing connected family histories from eighteenth-century Ghana across the Atlantic.', 'https://www.penguinrandomhouse.com/books/533857/homegoing-by-yaa-gyasi/9781101971062/'),
  ('Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', 2006, 'Literature · Nigeria · History', 'A historical novel centred on the Biafran War and its effects on people, families and communities.', 'https://www.penguinrandomhouse.com/books/879/half-of-a-yellow-sun-by-chimamanda-ngozi-adichie/9781400095209/'),
  ('The Famished Road', 'Ben Okri', 1991, 'Literature · Nigeria · Magical realism', 'A novel that blends a child narrator’s spirit-world experiences with social and political life in Nigeria.', 'https://www.penguinrandomhouse.com/books/124277/the-famished-road-by-ben-okri/'),
  ('A Grain of Wheat', 'Ngũgĩ wa Thiong’o', 1967, 'Literature · Kenya · Independence', 'A novel set around Kenya’s independence that examines memory, sacrifice, loyalty and political change.', 'https://www.penguinrandomhouse.com/books/309801/a-grain-of-wheat-by-ngugi-wa-thiongo/paperback/'),
  ('How Europe Underdeveloped Africa', 'Walter Rodney', 1972, 'History · Political economy', 'A major work of African political economy presenting Rodney’s analysis of colonialism and unequal development; best read alongside other historical scholarship.', 'https://www.versobooks.com/en-gb/products/788-how-europe-underdeveloped-africa'),
  ('The African Origin of Civilization: Myth or Reality', 'Cheikh Anta Diop', 1974, 'History · African historiography', 'A work in African historiography presenting Diop’s arguments about ancient Egypt and African history; some claims remain debated in scholarship.', 'https://www.chicagoreviewpress.com/the-african-origin-of-civilization-products-9781556520723.php'),
  ('Decolonising the Mind', 'Ngũgĩ wa Thiong’o', 1986, 'Language · Literature · Decolonial thought', 'Essays on language, literature, cultural identity and the continuing influence of colonial power.', 'https://www.penguinrandomhouse.com/books/861437/descolonizar-la-mente--decolonizing-the-mind-the-politics-of-language-in-african-literature-by-ngugi-wa-thiongo/'),
  ('African Religions & Philosophy', 'John S. Mbiti', 1969, 'Philosophy · Religion · Anthropology', 'A scholarly study of African religious thought and philosophy. Mbiti’s framework has also been debated by other African philosophers.', 'https://books.google.com/books/about/African_Religions_Philosophy.html?id=eTUpo9lH-fYC'),
  ('The Beautyful Ones Are Not Yet Born', 'Ayi Kwei Armah', 1968, 'Literature · Ghana · Society', 'A novel examining moral compromise, corruption and daily life in post-independence Ghana.', 'https://books.google.com/books?id=adDP11OQ-7oC')
) as seed(title, author, publication_year, subject, description, source_url)
where not exists (
  select 1 from public.book_catalog existing
  where lower(existing.title) = lower(seed.title)
    and lower(existing.author) = lower(seed.author)
);
