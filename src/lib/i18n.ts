export type AppLanguage = "en" | "fr" | "sw" | "ar" | "pt" | "es" | "ha" | "am" | "yo" | "ig" | "wo" | "tw" | "ee";

export const LANGUAGES: { code: AppLanguage; label: string; nativeName: string; rtl?: boolean }[] = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "sw", label: "Kiswahili", nativeName: "Kiswahili" },
  { code: "ar", label: "Arabic", nativeName: "العربية", rtl: true },
  { code: "pt", label: "Portuguese", nativeName: "Português" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "ha", label: "Hausa", nativeName: "Hausa" },
  { code: "am", label: "Amharic", nativeName: "አማርኛ" },
  { code: "yo", label: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", label: "Igbo", nativeName: "Igbo" },
  { code: "wo", label: "Wolof", nativeName: "Wolof" },
  { code: "tw", label: "Twi", nativeName: "Twi" },
  { code: "ee", label: "Ewe", nativeName: "Eʋegbe" },
];

const COPY: Record<AppLanguage, Record<string, string>> = {
  en: { language:"Language", country:"Country", qualification:"Qualification / Exam", results:"Results", ghana_universities:"Ghanaian Universities", international_students:"International Students", how_to_apply:"How to apply", scholarships:"Scholarships", visa:"Visa and residence", jobs:"Jobs", internships:"Internships", search:"Search", about:"About", sign_in:"Sign in", sign_out:"Sign out" },
  fr: { language:"Langue", country:"Pays", qualification:"Diplôme / Examen", results:"Résultats", ghana_universities:"Universités ghanéennes", international_students:"Étudiants internationaux", how_to_apply:"Comment postuler", scholarships:"Bourses", visa:"Visa et séjour", jobs:"Emplois", internships:"Stages", search:"Rechercher", about:"À propos", sign_in:"Se connecter", sign_out:"Se déconnecter" },
  sw: { language:"Lugha", country:"Nchi", qualification:"Mtihani / Sifa", results:"Matokeo", ghana_universities:"Vyuo vikuu vya Ghana", international_students:"Wanafunzi wa kimataifa", how_to_apply:"Jinsi ya kutuma maombi", scholarships:"Ufadhili wa masomo", visa:"Visa na kibali cha ukaazi", jobs:"Ajira", internships:"Mafunzo kazini", search:"Tafuta", about:"Kuhusu", sign_in:"Ingia", sign_out:"Toka" },
  ar: { language:"اللغة", country:"الدولة", qualification:"المؤهل / الامتحان", results:"النتائج", ghana_universities:"جامعات غانا", international_students:"الطلاب الدوليون", how_to_apply:"كيفية التقديم", scholarships:"المنح الدراسية", visa:"التأشيرة والإقامة", jobs:"الوظائف", internships:"التدريب", search:"بحث", about:"حول", sign_in:"تسجيل الدخول", sign_out:"تسجيل الخروج" },
  pt: { language:"Idioma", country:"País", qualification:"Qualificação / Exame", results:"Resultados", ghana_universities:"Universidades do Gana", international_students:"Estudantes internacionais", how_to_apply:"Como candidatar-se", scholarships:"Bolsas de estudo", visa:"Visto e residência", jobs:"Empregos", internships:"Estágios", search:"Pesquisar", about:"Sobre", sign_in:"Entrar", sign_out:"Sair" },
  es: { language:"Idioma", country:"País", qualification:"Título / Examen", results:"Resultados", ghana_universities:"Universidades de Ghana", international_students:"Estudiantes internacionales", how_to_apply:"Cómo solicitar", scholarships:"Becas", visa:"Visado y residencia", jobs:"Empleos", internships:"Prácticas", search:"Buscar", about:"Acerca de", sign_in:"Iniciar sesión", sign_out:"Cerrar sesión" },
  ha: { language:"Harshe", country:"Ƙasa", qualification:"Jarabawa / Takardar shaidar karatu", results:"Sakamako", ghana_universities:"Jami'o'in Ghana", international_students:"Dalibai na duniya", how_to_apply:"Yadda ake nema", scholarships:"Tallafin karatu", visa:"Visa da zama", jobs:"Ayyuka", internships:"Horon aiki", search:"Bincika", about:"Game da", sign_in:"Shiga", sign_out:"Fita" },
  am: { language:"ቋንቋ", country:"ሀገር", qualification:"ፈተና / የትምህርት ደረጃ", results:"ውጤቶች", ghana_universities:"የጋና ዩኒቨርሲቲዎች", international_students:"ዓለም አቀፍ ተማሪዎች", how_to_apply:"እንዴት ማመልከት እንደሚቻል", scholarships:"ስኮላርሺፖች", visa:"ቪዛ እና መኖሪያ", jobs:"ስራዎች", internships:"ልምምድ", search:"ፈልግ", about:"ስለ", sign_in:"ግባ", sign_out:"ውጣ" },
  yo: { language:"Èdè", country:"Orílẹ̀-èdè", qualification:"Ìdánwò / Ìwé-ẹ̀rí", results:"Àwọn èsì", ghana_universities:"Àwọn yunifásítì Ghana", international_students:"Àwọn akẹ́kọ̀ọ́ àgbáyé", how_to_apply:"Bí a ṣe ń béèrè", scholarships:"Àwọn ẹ̀bùn ẹ̀kọ́", visa:"Visa àti ìbùdó", jobs:"Àwọn iṣẹ́", internships:"Ìdánilẹ́kọ̀ọ́", search:"Wá", about:"Nipa", sign_in:"Wọlé", sign_out:"Jáde" },
  ig: { language:"Asụsụ", country:"Obodo", qualification:"Ule / Asambodo", results:"Nsonaazụ", ghana_universities:"Mahadum Ghana", international_students:"Ụmụ akwụkwọ mba ụwa", how_to_apply:"Otu esi etinye akwụkwọ", scholarships:"Nkuzi ego", visa:"Visa na ebe obibi", jobs:"Ọrụ", internships:"Ọzụzụ ọrụ", search:"Chọọ", about:"Banyere", sign_in:"Banye", sign_out:"Pụọ" },
  wo: { language:"Làkk", country:"Réew", qualification:"Njàng / Eksamen", results:"Néew", ghana_universities:"Yunivërsité yu Ghana", international_students:"Jàngalekat yu dëkk yu bari", how_to_apply:"Ni ñuy jëfandikoo", scholarships:"Bourses", visa:"Visa ak dëkk", jobs:"Liggéey", internships:"Pratik", search:"Seet", about:"Ci", sign_in:"Dugg", sign_out:"Génn" },
  tw: { language:"Kasa", country:"Ɔman", qualification:"Sɔhwɛ / Krataa", results:"Nsusuwii", ghana_universities:"Ghana sukuu akɛse", international_students:"Aman foforo sukuufo", how_to_apply:"Sɛnea wobɛsrɛ", scholarships:"Sukuudan", visa:"Visa ne tenabea", jobs:"Nnwuma", internships:"Adwumayɛ ho ntetee", search:"Hwehwɛ", about:"Yɛn ho", sign_in:"Kɔ mu", sign_out:"Firi mu" },
  ee: { language:"Gbe", country:"Dukɔ", qualification:"Dzidzɔ / ƒe ŋkɔ", results:"Nudzɔdzɔ", ghana_universities:"Ghana ƒe sukudɔwo", international_students:"Dukɔ bubuviwo ƒe nusrɔ̃lawo", how_to_apply:"Aleke woaɖe kuku", scholarships:"Sukuviƒe kpekpeɖeŋu", visa:"Visa kple nɔƒe", jobs:"Dɔwɔƒewo", internships:"Dɔwɔwɔ ƒe nusrɔ̃", search:"Di", about:"Míawo ŋu", sign_in:"Ge", sign_out:"Do go" },
};

export function getLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem("gp-language") as AppLanguage | null;
  return LANGUAGES.some((x) => x.code === value) ? value! : "en";
}

export function setLanguage(language: AppLanguage) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("gp-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGES.find((x) => x.code === language)?.rtl ? "rtl" : "ltr";
    window.dispatchEvent(new Event("gp-language-change"));
  }
}

export function t(key: string, language: AppLanguage = getLanguage()) {
  return COPY[language]?.[key] ?? COPY.en[key] ?? key;
}
