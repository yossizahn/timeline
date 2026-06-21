// Timeline data: Geonim, Rishonim, Acharonim — with books, regions, Wikipedia
// links, and world events.
// Dates are CE (secular). Hebrew years are derived as CE + 3760 (approx.; the
// civil/Hebrew year overlap means ±1 near Rosh Hashanah). Some early dates are
// approximate ("circa") per the historical sources.
// `w` = Hebrew Wikipedia article title (used to build a he.wikipedia.org link).

const ERAS = {
  tannaim:   { he: "תנאים",   en: "Tannaim",   color: "#be123c" },
  amoraim:   { he: "אמוראים", en: "Amoraim",   color: "#7c3aed" },
  geonim:    { he: "גאונים",  en: "Geonim",    color: "#b45309" },
  rishonim:  { he: "ראשונים", en: "Rishonim",  color: "#1d4ed8" },
  acharonim: { he: "אחרונים", en: "Acharonim", color: "#047857" },
};

// Centers of Torah, each with a marker colour and a position (mx,my) on the
// schematic map (viewBox 320×240) — surfaces the geographic story.
const REGIONS = {
  bavel:         { he: "בבל",          en: "Babylonia",     color: "#a16207", mx: 258.8, my: 159 },
  sefarad:       { he: "ספרד",         en: "Spain",         color: "#ca8a04", mx: 38.1,  my: 118.8 },
  tzarfat:       { he: "צרפת",         en: "France",        color: "#2563eb", mx: 73.9,  my: 70.2 },
  ashkenaz:      { he: "אשכנז",        en: "Germany",       color: "#4f46e5", mx: 93.2,  my: 60.1 },
  provans:       { he: "פרובנס",       en: "Provence",      color: "#0d9488", mx: 75.2,  my: 97.2 },
  italia:        { he: "איטליה",       en: "Italy",         color: "#65a30d", mx: 112.6, my: 108.6 },
  tzfonAfrica:   { he: "צפון אפריקה",  en: "North Africa",  color: "#dc2626", mx: 101.6, my: 145.8 },
  eretzIsrael:   { he: "ארץ ישראל",    en: "Land of Israel",color: "#0891b2", mx: 216.9, my: 169.2 },
  mizrachEurope: { he: "מזרח אירופה",  en: "Eastern Europe",color: "#9333ea", mx: 162.2, my: 45 },
  merkazEurope:  { he: "מרכז אירופה",  en: "Central Europe",color: "#ea580c", mx: 131.5, my: 64.8 },
  iraq:          { he: "בבל (עיראק)",  en: "Iraq",          color: "#92400e", mx: 274.9, my: 177 },
  usa:           { he: "ארצות הברית",  en: "United States", color: "#475569", mx: 14,    my: 115.8, off: true },
};

// Migration of the Torah center from Bavel westward (~942–1088 CE).
// Paths are cubic Béziers in the map's 285×252 coordinate space.
const MIGRATION = [
  { d: "M258.8,159 C 196,204 80,178 41,121",  he: "בבל ← צפון אפריקה ← ספרד" },
  { d: "M258.8,159 C 198,112 150,78 95,62",   he: "בבל ← איטליה ← אשכנז" },
];

// Each figure: born/died in CE. `circa` flags approximate dates.
const FIGURES = [
  // ---------- TANNAIM (Mishnah era) ----------
  {
    era: "tannaim", he: "רבן יוחנן בן זכאי", en: "Rabban Yochanan ben Zakkai",
    born: 1, died: 90, circa: true, region: "eretzIsrael", place: "יבנה, ארץ ישראל",
    w: "רבן יוחנן בן זכאי", note: "ייסד את ישיבת יבנה לאחר החורבן והציל את התורה — 'תן לי יבנה וחכמיה'.",
    books: [],
  },
  {
    era: "tannaim", he: "רבן גמליאל דיבנה", en: "Rabban Gamliel of Yavne",
    born: 50, died: 120, circa: true, region: "eretzIsrael", place: "יבנה, ארץ ישראל",
    w: "רבן גמליאל דיבנה", note: "נשיא הסנהדרין ביבנה; ביסס את מרכז התורה לאחר החורבן.",
    books: [],
  },
  {
    era: "tannaim", he: "רבי עקיבא", en: "Rabbi Akiva",
    born: 50, died: 135, circa: true, region: "eretzIsrael", place: "בני ברק, ארץ ישראל",
    w: "רבי עקיבא", note: "מגדולי התנאים; סידר את ההלכה. נהרג על קידוש השם בימי אדריאנוס.",
    books: [],
  },
  {
    era: "tannaim", he: "רבי ישמעאל", en: "Rabbi Yishmael",
    born: 90, died: 135, circa: true, region: "eretzIsrael", place: "ארץ ישראל",
    w: "רבי ישמעאל", note: "בר הפלוגתא של ר' עקיבא; שלוש עשרה המידות שהתורה נדרשת בהן.",
    books: [],
  },
  {
    era: "tannaim", he: "רבי מאיר", en: "Rabbi Meir",
    born: 110, died: 170, circa: true, region: "eretzIsrael", place: "ארץ ישראל",
    w: "רבי מאיר", note: "מתלמידי ר' עקיבא; 'סתם משנה ר' מאיר'.",
    books: [],
  },
  {
    era: "tannaim", he: "רבי שמעון בר יוחאי (רשב\"י)", en: "Rabbi Shimon bar Yochai",
    born: 100, died: 160, circa: true, region: "eretzIsrael", place: "מירון, ארץ ישראל",
    w: "רבי שמעון בר יוחאי", note: "מתלמידי ר' עקיבא; על פי המסורת מחבר ספר הזוהר.",
    books: [],
  },
  {
    era: "tannaim", he: "רבי יהודה הנשיא (רבי)", en: "Rabbi Yehuda HaNasi",
    born: 135, died: 217, circa: true, region: "eretzIsrael", place: "בית שערים → ציפורי",
    w: "רבי יהודה הנשיא", note: "עורך המשנה — חתימת התורה שבעל פה הראשונה.",
    books: [{ y: 200, he: "משנה", en: "Mishnah" }],
  },

  // ---------- AMORAIM (Talmud era) ----------
  {
    era: "amoraim", he: "רב (אבא אריכא)", en: "Rav (Abba Arika)",
    born: 175, died: 247, circa: true, region: "bavel", place: "סורא, בבל",
    w: "רב (אמורא)", note: "ייסד את ישיבת סורא; מראשוני האמוראים בבבל.",
    books: [],
  },
  {
    era: "amoraim", he: "שמואל", en: "Shmuel",
    born: 165, died: 254, circa: true, region: "bavel", place: "נהרדעא, בבל",
    w: "שמואל (אמורא)", note: "ראש ישיבת נהרדעא; 'דינא דמלכותא דינא'.",
    books: [],
  },
  {
    era: "amoraim", he: "רבי יוחנן", en: "Rabbi Yochanan",
    born: 180, died: 279, circa: true, region: "eretzIsrael", place: "טבריה, ארץ ישראל",
    w: "רבי יוחנן", note: "מנהיג חכמי ארץ ישראל; יסוד התלמוד הירושלמי.",
    books: [],
  },
  {
    era: "amoraim", he: "ריש לקיש", en: "Reish Lakish",
    born: 200, died: 275, circa: true, region: "eretzIsrael", place: "טבריה, ארץ ישראל",
    w: "ריש לקיש", note: "בר הפלוגתא והגיס של ר' יוחנן.",
    books: [],
  },
  {
    era: "amoraim", he: "רב הונא", en: "Rav Huna",
    born: 216, died: 296, circa: true, region: "bavel", place: "סורא, בבל",
    w: "רב הונא", note: "ראש ישיבת סורא לאחר רב; הנהיג את יהדות בבל.",
    books: [],
  },
  {
    era: "amoraim", he: "רבה (בר נחמני)", en: "Rabbah bar Nachmani",
    born: 270, died: 330, circa: true, region: "bavel", place: "פומבדיתא, בבל",
    w: "רבה בר נחמני", note: "ראש ישיבת פומבדיתא; 'עוקר הרים'.",
    books: [],
  },
  {
    era: "amoraim", he: "אביי", en: "Abaye",
    born: 280, died: 337, circa: true, region: "bavel", place: "פומבדיתא, בבל",
    w: "אביי", note: "ראש ישיבת פומבדיתא; 'הוויות דאביי ורבא'.",
    books: [],
  },
  {
    era: "amoraim", he: "רבא", en: "Rava",
    born: 280, died: 352, circa: true, region: "bavel", place: "מחוזא, בבל",
    w: "רבא", note: "ראש הישיבה במחוזא; הלכה כמותו ברוב מחלוקותיו עם אביי.",
    books: [],
  },
  {
    era: "amoraim", he: "רב אשי", en: "Rav Ashi",
    born: 352, died: 427, circa: true, region: "bavel", place: "מתא מחסיא (סורא), בבל",
    w: "רב אשי", note: "החל בעריכת התלמוד הבבלי בישיבת סורא.",
    books: [],
  },
  {
    era: "amoraim", he: "רבינא", en: "Ravina",
    born: 420, died: 499, circa: true, region: "bavel", place: "סורא, בבל",
    w: "רבינא", note: "מחותמי התלמוד הבבלי — 'רב אשי ורבינא סוף הוראה'.",
    books: [],
  },

  // ---------- GEONIM ----------
  {
    era: "geonim", he: "רב יהודאי גאון", en: "Rav Yehudai Gaon",
    born: 700, died: 761, circa: true, region: "bavel", place: "סורא, בבל",
    w: "יהודאי גאון", note: "מראשוני הגאונים שכתבו ספרי פסיקה.",
    books: [{ y: 755, he: "הלכות פסוקות", en: "Halachot Pesukot" }],
  },
  {
    era: "geonim", he: "רב עמרם גאון", en: "Rav Amram Gaon",
    born: 810, died: 875, circa: true, region: "bavel", place: "סורא, בבל",
    w: "עמרם גאון", note: "ראש ישיבת סורא; ערך את סדר התפילה הראשון השלם.",
    books: [{ y: 860, he: "סדר רב עמרם גאון", en: "Seder Rav Amram (first ordered siddur)" }],
  },
  {
    era: "geonim", he: "רב סעדיה גאון (רס\"ג)", en: "Rav Saadia Gaon",
    born: 882, died: 942, region: "bavel", place: "פיום, מצרים → סורא",
    w: "רב סעדיה גאון", note: "פילוסוף, מדקדק ופרשן; נלחם בקראים.",
    books: [
      { y: 933, he: "אמונות ודעות", en: "Emunot ve-De'ot (philosophy)" },
      { y: 920, he: "תפסיר (תרגום התורה)", en: "Tafsir — Arabic Torah translation" },
    ],
  },
  {
    era: "geonim", he: "רב שרירא גאון", en: "Rav Sherira Gaon",
    born: 906, died: 1006, circa: true, region: "bavel", place: "פומבדיתא, בבל",
    w: "רב שרירא גאון", note: "כתב את ההיסטוריה של מסירת התורה שבעל פה.",
    books: [{ y: 987, he: "איגרת רב שרירא גאון", en: "Iggeret Rav Sherira (history of the Oral Law)" }],
  },
  {
    era: "geonim", he: "רב האי גאון", en: "Rav Hai Gaon",
    born: 939, died: 1038, region: "bavel", place: "פומבדיתא, בבל",
    w: "רב האי גאון", note: "אחרון גאוני בבל הגדולים; אלפי תשובות.",
    books: [{ y: 1000, he: "ספר המקח והממכר", en: "Sefer ha-Mekach (commercial law)" }],
  },

  // ---------- RISHONIM ----------
  {
    era: "rishonim", he: "רבנו גרשום מאור הגולה", en: "Rabbeinu Gershom",
    born: 960, died: 1028, circa: true, region: "ashkenaz", place: "מגנצא, אשכנז",
    w: "רבנו גרשום", note: "\"מאור הגולה\"; תקנות (חרם נגד פוליגמיה).",
    books: [{ y: 1000, he: "תקנות רבנו גרשום", en: "Takkanot (rabbinic ordinances)" }],
  },
  {
    era: "rishonim", he: "ר' שלמה אבן גבירול", en: "Shlomo ibn Gabirol",
    born: 1021, died: 1058, circa: true, region: "sefarad", place: "מאלגה, ספרד",
    w: "שלמה אבן גבירול", note: "משורר ופילוסוף ניאו-אפלטוני.",
    books: [{ y: 1045, he: "כתר מלכות / מקור חיים", en: "Keter Malchut; Fons Vitae" }],
  },
  {
    era: "rishonim", he: "רי\"ף (יצחק אלפסי)", en: "Rif (Isaac Alfasi)",
    born: 1013, died: 1103, region: "sefarad", place: "פאס → לוסנה, ספרד",
    w: "יצחק אלפסי", note: "ספר ההלכות — אבן יסוד של ספרות הפסיקה.",
    books: [{ y: 1080, he: "ספר ההלכות (הרי\"ף)", en: "Sefer ha-Halachot" }],
  },
  {
    era: "rishonim", he: "רש\"י", en: "Rashi (Shlomo Yitzchaki)",
    born: 1040, died: 1105, region: "tzarfat", place: "טרואה, צרפת",
    w: "רש\"י", note: "הפרשן הגדול ביותר על התנ\"ך והתלמוד.",
    books: [
      { y: 1090, he: "פירוש רש\"י על התורה", en: "Commentary on the Torah" },
      { y: 1100, he: "פירוש רש\"י על הש\"ס", en: "Commentary on the Talmud" },
    ],
  },
  {
    era: "rishonim", he: "ר' בחיי אבן פקודה", en: "Bahya ibn Paquda",
    born: 1050, died: 1120, circa: true, region: "sefarad", place: "סרגוסה, ספרד",
    w: "בחיי אבן פקודה", note: "מספרי המוסר והמחשבה הקלאסיים.",
    books: [{ y: 1080, he: "חובות הלבבות", en: "Chovot ha-Levavot (Duties of the Heart)" }],
  },
  {
    era: "rishonim", he: "ר' יהודה הלוי", en: "Yehuda HaLevi",
    born: 1075, died: 1141, circa: true, region: "sefarad", place: "טודלה, ספרד → ארץ ישראל",
    w: "יהודה הלוי", note: "משורר ופילוסוף; משורר \"ציון הלא תשאלי\".",
    books: [{ y: 1140, he: "ספר הכוזרי", en: "The Kuzari" }],
  },
  {
    era: "rishonim", he: "רשב\"ם", en: "Rashbam (Shmuel ben Meir)",
    born: 1085, died: 1158, circa: true, region: "tzarfat", place: "טרואה, צרפת",
    w: "רשב\"ם", note: "נכד רש\"י; פרשן הפשט ובעל תוספות.",
    books: [{ y: 1140, he: "פירוש רשב\"ם על התורה", en: "Commentary on the Torah (peshat)" }],
  },
  {
    era: "rishonim", he: "אבן עזרא", en: "Abraham ibn Ezra",
    born: 1089, died: 1167, region: "sefarad", place: "טודלה, ספרד (נדודים)",
    w: "אברהם אבן עזרא", note: "פרשן, מדקדק, אסטרונום ומשורר.",
    books: [{ y: 1150, he: "פירוש אבן עזרא על התורה", en: "Torah commentary" }],
  },
  {
    era: "rishonim", he: "רבנו תם", en: "Rabbeinu Tam (Yaakov ben Meir)",
    born: 1100, died: 1171, region: "tzarfat", place: "רמרופ, צרפת",
    w: "רבנו תם", note: "נכד רש\"י; מגדולי בעלי התוספות.",
    books: [{ y: 1150, he: "ספר הישר", en: "Sefer ha-Yashar" }],
  },
  {
    era: "rishonim", he: "ר\"י הזקן (מבעלי התוספות)", en: "Ri HaZaken (Isaac of Dampierre)",
    born: 1115, died: 1184, circa: true, region: "tzarfat", place: "דמפייר, צרפת",
    w: "יצחק בן שמואל מדמפייר", note: "מגדולי בעלי התוספות; תלמיד רבנו תם.",
    books: [{ y: 1175, he: "תוספות", en: "Tosafot (Talmudic glosses)" }],
  },
  {
    era: "rishonim", he: "רמב\"ם (משה בן מימון)", en: "Rambam (Maimonides)",
    born: 1138, died: 1204, region: "sefarad", place: "קורדובה, ספרד → פוסטאט, מצרים",
    w: "רמב\"ם", note: "פוסק, פילוסוף ורופא; \"מִמֹּשֶׁה עד מֹשֶׁה...\".",
    books: [
      { y: 1168, he: "פירוש המשניות", en: "Commentary on the Mishnah" },
      { y: 1180, he: "משנה תורה (י\"ד החזקה)", en: "Mishneh Torah (legal code)" },
      { y: 1190, he: "מורה נבוכים", en: "Guide for the Perplexed" },
    ],
  },
  {
    era: "rishonim", he: "רד\"ק (דוד קמחי)", en: "Radak (David Kimchi)",
    born: 1160, died: 1235, region: "provans", place: "נרבונה, פרובנס",
    w: "דוד קמחי", note: "מדקדק ופרשן הנ\"ך.",
    books: [{ y: 1210, he: "ספר השורשים / פירוש הנ\"ך", en: "Sefer ha-Shorashim; Bible commentary" }],
  },
  {
    era: "rishonim", he: "רמב\"ן (משה בן נחמן)", en: "Ramban (Nachmanides)",
    born: 1194, died: 1270, region: "sefarad", place: "גירונה, ספרד → ארץ ישראל",
    w: "רמב\"ן", note: "פרשן, מקובל ופוסק; ויכוח ברצלונה.",
    books: [{ y: 1267, he: "פירוש הרמב\"ן על התורה", en: "Commentary on the Torah" }],
  },
  {
    era: "rishonim", he: "רבנו יונה גירונדי", en: "Rabbeinu Yonah of Gerona",
    born: 1200, died: 1263, circa: true, region: "sefarad", place: "גירונה, ספרד",
    w: "רבנו יונה גירונדי", note: "ספרי מוסר קלאסיים.",
    books: [{ y: 1260, he: "שערי תשובה", en: "Sha'arei Teshuvah (gates of repentance)" }],
  },
  {
    era: "rishonim", he: "רשב\"א", en: "Rashba (Shlomo ibn Aderet)",
    born: 1235, died: 1310, region: "sefarad", place: "ברצלונה, ספרד",
    w: "שלמה בן אדרת", note: "\"הרב מברצלונה\"; אלפי תשובות.",
    books: [{ y: 1300, he: "שו\"ת הרשב\"א", en: "Responsa of the Rashba" }],
  },
  {
    era: "rishonim", he: "המאירי", en: "Meiri (Menachem ben Shlomo)",
    born: 1249, died: 1315, region: "provans", place: "פרפיניאן, פרובנס",
    w: "מנחם המאירי", note: "פירוש מקיף ובהיר על התלמוד.",
    books: [{ y: 1300, he: "בית הבחירה", en: "Beit ha-Bechirah (Talmud commentary)" }],
  },
  {
    era: "rishonim", he: "רא\"ש (אשר בן יחיאל)", en: "Rosh (Asher ben Yechiel)",
    born: 1250, died: 1327, region: "sefarad", place: "אשכנז → טולדו, ספרד",
    w: "אשר בן יחיאל", note: "גשר בין מסורת אשכנז לספרד.",
    books: [{ y: 1320, he: "פסקי הרא\"ש", en: "Piskei ha-Rosh (halachic digest)" }],
  },
  {
    era: "rishonim", he: "רלב\"ג (גרשון)", en: "Ralbag (Gersonides)",
    born: 1288, died: 1344, region: "provans", place: "באניולס, פרובנס",
    w: "רלב\"ג", note: "פרשן, פילוסוף, מתמטיקאי ואסטרונום.",
    books: [{ y: 1329, he: "מלחמות השם / פירוש הנ\"ך", en: "Milchamot Hashem; Bible commentary" }],
  },
  {
    era: "rishonim", he: "בעל הטורים (יעקב בן אשר)", en: "Tur (Yaakov ben Asher)",
    born: 1269, died: 1343, region: "sefarad", place: "טולדו, ספרד",
    w: "יעקב בן אשר", note: "בנו של הרא\"ש; חילק את ההלכה לארבעה טורים.",
    books: [{ y: 1330, he: "ארבעה טורים", en: "Arba'ah Turim (four-part code)" }],
  },
  // -- late Rishonim (the 14th–15th-c. that previously left a gap) --
  {
    era: "rishonim", he: "ר\"ן (נסים גירונדי)", en: "Ran (Nissim of Gerona)",
    born: 1320, died: 1376, region: "sefarad", place: "ברצלונה, ספרד",
    w: "נסים בן ראובן גירונדי", note: "מגדולי פרשני התלמוד וההלכה בספרד.",
    books: [{ y: 1365, he: "חידושי הר\"ן / דרשות הר\"ן", en: "Commentaries; Derashot ha-Ran" }],
  },
  {
    era: "rishonim", he: "ריב\"ש (יצחק בר ששת)", en: "Rivash (Isaac ben Sheshet)",
    born: 1326, died: 1408, region: "sefarad", place: "ברצלונה → אלג'יר",
    w: "יצחק בר ששת", note: "מגדולי הפוסקים; שו\"ת רב-השפעה.",
    books: [{ y: 1400, he: "שו\"ת הריב\"ש", en: "Responsa of the Rivash" }],
  },
  {
    era: "rishonim", he: "רשב\"ץ (שמעון בן צמח)", en: "Rashbatz (Shimon b. Tzemach Duran)",
    born: 1361, died: 1444, region: "tzfonAfrica", place: "מיורקה → אלג'יר",
    w: "שמעון בן צמח דוראן", note: "פוסק, רופא ופילוסוף ביהדות צפון אפריקה.",
    books: [{ y: 1420, he: "שו\"ת התשב\"ץ / מגן אבות", en: "Tashbetz responsa; Magen Avot" }],
  },
  {
    era: "rishonim", he: "מהרי\"ל (יעקב מולין)", en: "Maharil (Yaakov Moelin)",
    born: 1365, died: 1427, region: "ashkenaz", place: "מגנצא, אשכנז",
    w: "יעקב מולין", note: "אבי מנהגי אשכנז; בסיס לפסיקת הרמ\"א.",
    books: [{ y: 1420, he: "ספר מהרי\"ל (מנהגים)", en: "Sefer Maharil (Ashkenazi customs)" }],
  },
  {
    era: "rishonim", he: "מהרי\"ק (יוסף קולון)", en: "Maharik (Joseph Colon)",
    born: 1420, died: 1480, circa: true, region: "italia", place: "איטליה",
    w: "יוסף קולון", note: "גדול פוסקי איטליה במאה ה-15.",
    books: [{ y: 1470, he: "שו\"ת מהרי\"ק", en: "Responsa of the Maharik" }],
  },
  {
    era: "rishonim", he: "ר' יצחק אברבנאל", en: "Don Isaac Abarbanel",
    born: 1437, died: 1508, region: "sefarad", place: "ליסבון → איטליה",
    w: "יצחק אברבנאל", note: "פרשן, פילוסוף ומדינאי; מגורשי ספרד.",
    books: [{ y: 1495, he: "פירוש אברבנאל על התנ\"ך", en: "Bible commentary" }],
  },
  {
    era: "rishonim", he: "ר' עובדיה מברטנורא", en: "Obadiah of Bertinoro",
    born: 1445, died: 1515, circa: true, region: "italia", place: "איטליה → ירושלים",
    w: "עובדיה מברטנורא", note: "פירוש המשניות הנפוץ ביותר.",
    books: [{ y: 1500, he: "פירוש הברטנורא על המשנה", en: "Mishnah commentary" }],
  },

  // ---------- ACHARONIM ----------
  {
    era: "acharonim", he: "בית יוסף (ר' יוסף קארו)", en: "Beit Yosef (Yosef Karo)",
    born: 1488, died: 1575, region: "eretzIsrael", place: "טולדו → צפת",
    w: "יוסף קארו", note: "מחבר השולחן ערוך — ספר הפסיקה המרכזי.",
    books: [
      { y: 1542, he: "בית יוסף (על הטור)", en: "Beit Yosef (commentary on the Tur)" },
      { y: 1565, he: "שולחן ערוך", en: "Shulchan Aruch (code of Jewish law)" },
    ],
  },
  {
    era: "acharonim", he: "מהר\"ל מפראג", en: "Maharal of Prague",
    born: 1520, died: 1609, circa: true, region: "merkazEurope", place: "פראג, בוהמיה",
    w: "מהר\"ל", note: "הוגה דעות; מיוחס לו סיפור הגולם.",
    books: [{ y: 1578, he: "גור אריה / נצח ישראל", en: "Gur Aryeh, Netzach Yisrael" }],
  },
  {
    era: "acharonim", he: "רמ\"א (משה איסרליש)", en: "Rema (Moshe Isserles)",
    born: 1530, died: 1572, circa: true, region: "mizrachEurope", place: "קרקוב, פולין",
    w: "משה איסרליש", note: "\"המפה\" — הוסיף את מנהג אשכנז לשו\"ע.",
    books: [{ y: 1570, he: "המפה / דרכי משה", en: "Ha-Mapah (Ashkenazi glosses on Shulchan Aruch)" }],
  },
  {
    era: "acharonim", he: "האר\"י (יצחק לוריא)", en: "Arizal (Isaac Luria)",
    born: 1534, died: 1572, region: "eretzIsrael", place: "ירושלים → צפת",
    w: "האר\"י", note: "אבי הקבלה הלוריאנית; נכתבה ע\"י תלמידיו.",
    books: [{ y: 1572, he: "כתבי האר\"י (עץ חיים)", en: "Lurianic Kabbalah (Etz Chaim)" }],
  },
  {
    era: "acharonim", he: "ט\"ז (דוד הלוי סגל)", en: "Taz (David HaLevi Segal)",
    born: 1586, died: 1667, region: "mizrachEurope", place: "קרקוב → לבוב",
    w: "דוד הלוי סגל", note: "מן הפרשנים המרכזיים של השולחן ערוך.",
    books: [{ y: 1646, he: "טורי זהב (ט\"ז)", en: "Turei Zahav (on Shulchan Aruch)" }],
  },
  {
    era: "acharonim", he: "ש\"ך (שבתי הכהן)", en: "Shach (Shabtai HaKohen)",
    born: 1621, died: 1662, region: "mizrachEurope", place: "וילנה → הולשוב",
    w: "שבתי כהן", note: "מן הפרשנים המרכזיים של השולחן ערוך.",
    books: [{ y: 1646, he: "שפתי כהן (ש\"ך)", en: "Siftei Kohen (commentary on Shulchan Aruch)" }],
  },
  {
    era: "acharonim", he: "מגן אברהם", en: "Magen Avraham (Avraham Gombiner)",
    born: 1635, died: 1682, region: "mizrachEurope", place: "קאליש, פולין",
    w: "אברהם אבלי גומבינר", note: "פרשן מרכזי על אורח חיים.",
    books: [{ y: 1671, he: "מגן אברהם", en: "Magen Avraham (on Orach Chaim)" }],
  },
  {
    era: "acharonim", he: "אור החיים (חיים בן עטר)", en: "Ohr HaChaim (Chaim ibn Attar)",
    born: 1696, died: 1743, region: "tzfonAfrica", place: "מרוקו → ירושלים",
    w: "חיים בן עטר", note: "פרשן ומקובל; \"אור החיים הקדוש\".",
    books: [{ y: 1742, he: "אור החיים על התורה", en: "Ohr HaChaim (Torah commentary)" }],
  },
  {
    era: "acharonim", he: "בעל שם טוב (בעש\"ט)", en: "Baal Shem Tov",
    born: 1698, died: 1760, region: "mizrachEurope", place: "מז'יבוז', אוקראינה",
    w: "ישראל בעל שם טוב", note: "מייסד תנועת החסידות.",
    books: [{ y: 1781, he: "כתר שם טוב (תורתו)", en: "Founder of Chassidut (teachings)" }],
  },
  {
    era: "acharonim", he: "נודע ביהודה (יחזקאל לנדא)", en: "Noda BiYehuda (Yechezkel Landau)",
    born: 1713, died: 1793, region: "merkazEurope", place: "פראג, בוהמיה",
    w: "יחזקאל לנדא", note: "מגדולי הפוסקים; שו\"ת רב-השפעה.",
    books: [{ y: 1776, he: "נודע ביהודה (שו\"ת)", en: "Noda BiYehuda (responsa)" }],
  },
  {
    era: "acharonim", he: "הגר\"א (הגאון מווילנא)", en: "Vilna Gaon (Gra)",
    born: 1720, died: 1797, region: "mizrachEurope", place: "וילנה, ליטא",
    w: "הגאון מווילנה", note: "מנהיג הליטאים והמתנגדים; גאון בכל מקצועות התורה.",
    books: [{ y: 1780, he: "ביאורי הגר\"א", en: "Bi'urei ha-Gra (glosses)" }],
  },
  {
    era: "acharonim", he: "בעל התניא (ר' שניאור זלמן)", en: "Baal HaTanya (Shneur Zalman)",
    born: 1745, died: 1812, region: "mizrachEurope", place: "לאדי, רוסיה",
    w: "שניאור זלמן מלאדי", note: "מייסד חסידות חב\"ד; \"אדמו\"ר הזקן\".",
    books: [{ y: 1797, he: "ספר התניא / שו\"ע הרב", en: "Tanya, Shulchan Aruch HaRav" }],
  },
  {
    era: "acharonim", he: "רבי עקיבא איגר", en: "Rabbi Akiva Eiger",
    born: 1761, died: 1837, region: "merkazEurope", place: "פוזן, פרוסיה",
    w: "עקיבא איגר", note: "מגדולי הפלפול והפסיקה.",
    books: [{ y: 1820, he: "שו\"ת ר' עקיבא איגר", en: "Responsa & Talmudic glosses" }],
  },
  {
    era: "acharonim", he: "חת\"ם סופר", en: "Chatam Sofer (Moshe Sofer)",
    born: 1762, died: 1839, region: "merkazEurope", place: "פרנקפורט → פרשבורג",
    w: "חת\"ם סופר", note: "מנהיג היהדות החרדית; \"חדש אסור מן התורה\".",
    books: [{ y: 1830, he: "שו\"ת חת\"ם סופר", en: "Chatam Sofer (responsa)" }],
  },
  {
    era: "acharonim", he: "ר' ישראל סלנטר", en: "Rabbi Yisrael Salanter",
    born: 1809, died: 1883, region: "mizrachEurope", place: "ליטא → גרמניה",
    w: "ישראל ליפקין מסלנט", note: "מייסד תנועת המוסר.",
    books: [{ y: 1858, he: "אגרת המוסר / תנועת המוסר", en: "Founder of the Mussar movement" }],
  },
  {
    era: "acharonim", he: "ערוך השולחן (י\"מ עפשטיין)", en: "Aruch HaShulchan (Y. M. Epstein)",
    born: 1829, died: 1908, region: "mizrachEurope", place: "נובהרדוק, רוסיה",
    w: "יחיאל מיכל הלוי אפשטיין", note: "קודיפיקציה שיטתית של ההלכה.",
    books: [{ y: 1884, he: "ערוך השולחן", en: "Aruch HaShulchan (halachic code)" }],
  },
  {
    era: "acharonim", he: "בן איש חי (יוסף חיים)", en: "Ben Ish Chai (Yosef Chaim)",
    born: 1835, died: 1909, region: "iraq", place: "בגדאד, עיראק",
    w: "יוסף חיים מבגדאד", note: "מנהיג יהדות בבל; הלכה וקבלה.",
    books: [{ y: 1898, he: "בן איש חי", en: "Ben Ish Chai (halacha & homily)" }],
  },
  {
    era: "acharonim", he: "חפץ חיים", en: "Chofetz Chaim (Yisrael Meir Kagan)",
    born: 1838, died: 1933, region: "mizrachEurope", place: "ראדין, פולין",
    w: "ישראל מאיר הכהן", note: "הלכות לשון הרע והמשנה ברורה.",
    books: [
      { y: 1873, he: "חפץ חיים (לשון הרע)", en: "Chofetz Chaim (laws of speech)" },
      { y: 1907, he: "משנה ברורה", en: "Mishnah Berurah (on Orach Chaim)" },
    ],
  },
  {
    era: "acharonim", he: "הראי\"ה קוק", en: "Rav A. I. Kook",
    born: 1865, died: 1935, region: "eretzIsrael", place: "לטביה → ירושלים",
    w: "אברהם יצחק הכהן קוק", note: "הרב הראשי הראשון לארץ ישראל; הוגה דעות.",
    books: [{ y: 1920, he: "אורות / אורות התשובה", en: "Orot, Orot HaTeshuvah" }],
  },
  {
    era: "acharonim", he: "חזון איש", en: "Chazon Ish (A. Y. Karelitz)",
    born: 1878, died: 1953, region: "eretzIsrael", place: "בלארוס → בני ברק",
    w: "אברהם ישעיהו קרליץ", note: "מנהיג הציבור החרדי-ליטאי בארץ ישראל.",
    books: [{ y: 1911, he: "חזון איש", en: "Chazon Ish (halachic works)" }],
  },
  {
    era: "acharonim", he: "ר' משה פיינשטיין", en: "Rabbi Moshe Feinstein",
    born: 1895, died: 1986, region: "usa", place: "בלארוס → ניו יורק",
    w: "משה פיינשטיין", note: "מגדולי פוסקי ההלכה במאה ה-20.",
    books: [{ y: 1959, he: "אגרות משה (שו\"ת)", en: "Igrot Moshe (responsa)" }],
  },
];

// Major world / Jewish-history events.
// j: true     → inner-Jewish history (not chiefly a world event)
// shift: true → a step in the migration of the Torah center from Bavel westward
const EVENTS = [
  { y: 70,   he: "חורבן בית שני", en: "Destruction of the Second Temple; Siege of Jerusalem", place: "ירושלים", w: "חורבן בית שני", j: true },
  { y: 73,   he: "נפילת מצדה", en: "Siege of Masada", place: "מצדה", w: "מצדה", j: true },
  { y: 132,  he: "מרד בר כוכבא", en: "Bar Kokhba revolt (132–135)", place: "ארץ ישראל", w: "מרד בר כוכבא", j: true },
  { y: 135,  he: "עשרת הרוגי מלכות; גזירות אדריאנוס", en: "Ten Martyrs; Hadrianic persecutions", place: "ארץ ישראל", w: "עשרת הרוגי מלכות", j: true },
  { y: 313,  he: "צו מילאנו — חופש דת לנצרות", en: "Edict of Milan", place: "האימפריה הרומית", w: "צו מילאנו" },
  { y: 325,  he: "ועידת ניקיאה", en: "First Council of Nicaea", place: "ניקיאה", w: "ועידת ניקיאה" },
  { y: 359,  he: "קביעת לוח השנה (הלל נשיאה)", en: "Hillel II fixes the Hebrew calendar", place: "ארץ ישראל", w: "הלל נשיאה", j: true },
  { y: 400,  he: "חתימת התלמוד הירושלמי", en: "Jerusalem Talmud redacted", place: "טבריה, ארץ ישראל", w: "תלמוד ירושלמי", j: true },
  { y: 476,  he: "נפילת האימפריה הרומית המערבית", en: "Fall of the Western Roman Empire", place: "רומא", w: "שקיעת האימפריה הרומית" },
  { y: 500,  he: "חתימת התלמוד הבבלי", en: "Babylonian Talmud sealed", place: "בבל", w: "תלמוד בבלי", j: true },
  { y: 550,  he: "תקופת הסבוראים", en: "The Savoraim", place: "בבל", w: "סבוראים", j: true },
  { y: 711,  he: "הכיבוש המוסלמי של ספרד", en: "Muslim conquest of Spain", place: "חצי האי האיברי", w: "הכיבוש המוסלמי של ספרד" },
  { y: 767,  he: "ראשית הקראות (ענן בן דוד)", en: "Anan ben David; Karaite schism", place: "בבל", w: "ענן בן דוד", j: true },
  { y: 800,  he: "קרל הגדול מוכתר לקיסר", en: "Charlemagne crowned Emperor", place: "אקס לה שאפל", w: "קרל הגדול" },
  { y: 942,  he: "שקיעת ישיבת סורא (רס\"ג)", en: "Death of Saadia Gaon; Sura declines", place: "בבל", w: "רב סעדיה גאון", shift: true },
  { y: 970,  he: "ארבעת השבויים — ייסוד ספרד", en: "Story of the Four Captives", place: "הים התיכון", w: "ארבעת השבויים", shift: true },
  { y: 1038, he: "סוף תקופת הגאונים", en: "End of the Geonic era", place: "בבל", w: "גאונים", shift: true },
  { y: 1088, he: "הרי\"ף עולה ללוסינה", en: "Rif moves to Lucena; Spain ascendant", place: "לוסינה, ספרד", w: "רי\"ף", shift: true },
  { y: 1096, he: "מסע הצלב הראשון; גזירות תתנ\"ו", en: "First Crusade; Rhineland massacres", place: "חבל הריין, אשכנז", w: "מסע הצלב הראשון", j: true },
  { y: 1099, he: "הצלבנים כובשים את ירושלים", en: "Crusaders capture Jerusalem", place: "ירושלים", w: "מצור ירושלים (1099)" },
  { y: 1171, he: "עלילת הדם בבלואה", en: "Blois blood libel", place: "בלואה, צרפת", w: "עלילת דם", j: true },
  { y: 1211, he: "עליית בעלי התוספות לארץ ישראל", en: "Aliyah of the Tosafists", place: "ארץ ישראל", w: "עליית בעלי התוספות", j: true },
  { y: 1242, he: "שריפת התלמוד בפריז", en: "Burning of the Talmud in Paris", place: "פריז, צרפת", w: "שריפת התלמוד", j: true },
  { y: 1263, he: "ויכוח ברצלונה (הרמב\"ן)", en: "Disputation of Barcelona", place: "ברצלונה, ספרד", w: "ויכוח ברצלונה", j: true },
  { y: 1290, he: "גירוש היהודים מאנגליה", en: "Expulsion of Jews from England", place: "אנגליה", w: "גירוש יהודי אנגליה", j: true },
  { y: 1306, he: "גירוש היהודים מצרפת", en: "Expulsion of Jews from France", place: "צרפת", w: "גירוש צרפת הגדול", j: true },
  { y: 1348, he: "המוות השחור", en: "The Black Death", place: "אירופה", w: "המוות השחור" },
  { y: 1453, he: "נפילת קונסטנטינופול", en: "Fall of Constantinople", place: "קונסטנטינופול", w: "נפילת קונסטנטינופול" },
  { y: 1455, he: "דפוס גוטנברג", en: "Gutenberg's printing press", place: "מיינץ, אשכנז", w: "יוהאן גוטנברג" },
  { y: 1475, he: "הספר העברי הראשון בדפוס", en: "Hebrew incunabula; first printed book", place: "רג'ו די קלבריה, איטליה", w: "דפוס עברי", j: true },
  { y: 1492, he: "גירוש ספרד; גילוי אמריקה", en: "Expulsion from Spain; Columbus", place: "ספרד", w: "גירוש ספרד", j: true },
  { y: 1516, he: "גטו ונציה — הראשון בעולם", en: "Venetian Ghetto established", place: "ונציה, איטליה", w: "גטו ונציה", j: true },
  { y: 1517, he: "הרפורמציה הפרוטסטנטית", en: "Protestant Reformation", place: "אשכנז", w: "הרפורמציה הפרוטסטנטית" },
  { y: 1565, he: "פרסום השולחן ערוך", en: "Publication of the Shulchan Aruch", place: "צפת וונציה", w: "שולחן ערוך", j: true },
  { y: 1648, he: "גזירות ת\"ח ות\"ט", en: "Chmielnicki massacres", place: "אוקראינה ופולין", w: "גזירות ת\"ח ות\"ט", j: true },
  { y: 1666, he: "תנועת שבתי צבי", en: "Shabbetai Zevi messianic movement", place: "האימפריה העות'מאנית", w: "שבתי צבי", j: true },
  { y: 1740, he: "ראשית החסידות (הבעש\"ט)", en: "Baal Shem Tov; rise of Hasidism", place: "פודוליה, מזרח אירופה", w: "חסידות", j: true },
  { y: 1772, he: "מחלוקת חסידים ומתנגדים", en: "Misnagdim; Hasidic-Mitnagdic split", place: "וילנה, ליטא", w: "מתנגדים", j: true },
  { y: 1789, he: "המהפכה הצרפתית", en: "French Revolution", place: "צרפת", w: "המהפכה הצרפתית" },
  { y: 1807, he: "הסנהדרין של נפוליאון", en: "Grand Sanhedrin", place: "פריז, צרפת", w: "הסנהדרין של נפוליאון", j: true },
  { y: 1881, he: "פרעות ברוסיה; ראשית העלייה", en: "Russian pogroms; First Aliyah", place: "תחום המושב, רוסיה", w: "העלייה הראשונה", j: true },
  { y: 1897, he: "הקונגרס הציוני הראשון", en: "First Zionist Congress", place: "באזל, שווייץ", w: "הקונגרס הציוני הראשון", j: true },
  { y: 1917, he: "הצהרת בלפור", en: "Balfour Declaration", place: "לונדון, אנגליה", w: "הצהרת בלפור", j: true },
  { y: 1939, he: "מלחמת העולם השנייה והשואה", en: "WWII & the Holocaust", place: "אירופה", w: "השואה", j: true },
  { y: 1948, he: "הקמת מדינת ישראל", en: "Establishment of the State of Israel", place: "ארץ ישראל", w: "הקמת מדינת ישראל", j: true },
];
