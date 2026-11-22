export interface FiqhTopicChapter {
  id: string;
  number: string;
  title: string;
  arabicTitle: string;
  description: string;
  inquiries: string[];
}

export const QUICK_INQUIRIES: string[] = [
  "Ruling on combining prayers while travelling and distance threshold",
  "How is Zakat calculated on stocks, index funds, and retirement accounts?",
  "Does using an asthma inhaler or blood test break the fast in Ramadan?",
  "What are the conditions of a valid marriage (Nikah) contract in Islam?",
];

export const FIQH_CHAPTERS: FiqhTopicChapter[] = [
  {
    id: "worship",
    number: "01",
    title: "Purification & Prayer",
    arabicTitle: "الطهارة والصلاة",
    description:
      "Rulings governing ablution (Wudu), wiping over footwear, prayer timings, congregational prayer, and prostration of forgetfulness.",
    inquiries: [
      "What are the conditions and duration for wiping over socks (Khuffayn)?",
      "When is Sujud al-Sahw (prostration of forgetfulness) performed before vs after Salam?",
      "Ruling on combining prayers while travelling and distance threshold",
      "What invalidates Wudu according to the four Sunni schools of jurisprudence?",
    ],
  },
  {
    id: "fasting-zakat",
    number: "02",
    title: "Fasting & Obligatory Charity",
    arabicTitle: "الصيام والزكاة",
    description:
      "Detailed evidences regarding Ramadan fasting exemptions, Fidyah, Kaffarah, Nisab thresholds, and modern wealth Zakat.",
    inquiries: [
      "Does using an asthma inhaler or blood test break the fast in Ramadan?",
      "How is Zakat calculated on stocks, index funds, and retirement accounts?",
      "Who are the eight categories eligible to receive Zakat in Surah At-Tawbah?",
      "How should missed Ramadan fasts be made up if delayed until the next Ramadan?",
    ],
  },
  {
    id: "family",
    number: "03",
    title: "Marriage, Family & Inheritance",
    arabicTitle: "النكاح والأسرة",
    description:
      "Primary textual proofs on marriage contracts, guardianship, spousal rights, dutifulness to parents, and estate distribution.",
    inquiries: [
      "What are the conditions of a valid marriage (Nikah) contract in Islam?",
      "What is the Islamic ruling on the consent of the bride and role of the Wali?",
      "Duties of children toward elderly parents and balancing spousal obligations",
      "How does Islamic inheritance (Fara'id) protect the shares of daughters and parents?",
    ],
  },
  {
    id: "commerce",
    number: "04",
    title: "Transactions & Contemporary Ethics",
    arabicTitle: "المعاملات والقضايا المعاصرة",
    description:
      "Scholarly fatwas addressing riba-free finance, digital commerce, medical bioethics, dietary laws, and emerging technology.",
    inquiries: [
      "Islamic ruling on conventional vs Islamic home financing and Murabaha",
      "Permissibility of cryptocurrency trading and staking in contemporary Fiqh",
      "Ruling on gelatin and animal-derived enzymes in food and medicine",
      "Etiquettes and rulings of using artificial intelligence in scholarship and work",
    ],
  },
];
