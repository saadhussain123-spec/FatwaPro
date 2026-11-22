import type { AppLanguage } from "../types/research";
import type { FiqhTopicChapter } from "../data/fiqhTopics";

export interface AppTranslations {
  nav: {
    research: string;
    topics: string;
    archive: string;
    methodology: string;
    newInquiry: string;
  };
  toolbar: {
    languageLabel: string;
    lightTheme: string;
    darkTheme: string;
    lightShort: string;
    darkShort: string;
    installApp: string;
    installIos: string;
    iosModalTitle: string;
    iosStep1: string;
    iosStep2: string;
    iosStep3: string;
    done: string;
  };
  search: {
    kicker: string;
    heroTitle: string;
    heroSubtitle: string;
    placeholder: string;
    scopeAll: string;
    scopeIslamqa: string;
    scopeWeb: string;
    depthComprehensive: string;
    depthConcise: string;
    submitIdle: string;
    submitLoading: string;
    suggestedHeading: string;
    micStart: string;
    micStop: string;
    micRecording: string;
    micTranscribing: string;
    micPermissionError: string;
    micUnsupportedError: string;
    micNoSpeechError: string;
  };
  status: {
    loadingMessage: string;
    translatingMessage: string;
    translateError: string;
    errorTitle: string;
    retry: string;
    sessionThread: string;
    offlineBanner: string;
  };
  dossier: {
    scopeAllLabel: string;
    scopeIslamqaLabel: string;
    scopeWebLabel: string;
    analysisLabel: string;
    quranUnit: string;
    hadithUnit: string;
    copyCitations: string;
    copied: string;
    exportHtml: string;
    saveResearch: string;
    savedInArchive: string;
    inquiryPrefix: string;
    summaryHeading: string;
    analysisHeading: string;
    perspectivesHeading: string;
    guidanceHeading: string;
    followUpHeading: string;
    followUpPlaceholder: string;
    askFollowUp: string;
    researching: string;
    relatedHeading: string;
    exploreArrow: string;
    quranHeading: string;
    hadithHeading: string;
    sourcesHeading: string;
    citedCount: string;
    linksCount: string;
    noQuranNote: string;
    noHadithNote: string;
    gradePrefix: string;
    narratedBy: string;
    directPortalIntro: string;
    searchIslamqaLabel: string;
    searchQuranLabel: string;
    searchSunnahLabel: string;
    islamqaGroup: string;
    otherSourcesGroup: string;
    queriesExecuted: string;
    inspectBtn: string;
    readingBtn: string;
    inspectedBtn: string;
    sourceExtractTitle: string;
    quranLabel: string;
    hadithLabel: string;
    bottomSourcesKicker: string;
    bottomSourcesTitle: string;
    fromIslamqaTitle: string;
    fromOthersTitle: string;
    liveLinksHeading: string;
    citedPositionsHeading: string;
    directVerificationHeading: string;
    emptyIslamqaNote: string;
    emptyOthersNote: string;
    searchSeekersLabel: string;
  };
  topics: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  archive: {
    kicker: string;
    title: string;
    countSingular: string;
    countPlural: string;
    storedSuffix: string;
    filterPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    startBtn: string;
    noMatch: string;
    openDossier: string;
  };
  methodology: {
    kicker: string;
    title: string;
    subtitle: string;
    principles: Array<{ num: string; title: string; body: string }>;
    advisoryTitle: string;
    advisoryBody: string;
    returnBtn: string;
  };
  footer: {
    left: string;
    developedBy: string;
    developerName: string;
    rightSuffix: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, AppTranslations> = {
  en: {
    nav: {
      research: "Research",
      topics: "Fiqh Index",
      archive: "Saved Archive",
      methodology: "Methodology",
      newInquiry: "New Inquiry",
    },
    toolbar: {
      languageLabel: "Language",
      lightTheme: "Archival Light",
      darkTheme: "Evening Study",
      lightShort: "Light",
      darkShort: "Dark",
      installApp: "Install App",
      installIos: "Install on iOS",
      iosModalTitle: "Install Fatwa Pro on iPhone & iPad",
      iosStep1: "Tap the Share icon in Safari's toolbar.",
      iosStep2: "Scroll down and tap Add to Home Screen.",
      iosStep3: "Tap Add to launch Fatwa Pro as a standalone app.",
      done: "Done",
    },
    search: {
      kicker: "IslamQA.info · Web Fatwa Archives · Qur'an & Authentic Hadith",
      heroTitle: "Scholarly Fatwa & Primary Source Research",
      heroSubtitle:
        "Query published rulings across IslamQA.info and authenticated Islamic scholarly portals. Every response is grounded in cited verses from the Noble Qur'an and verified Prophetic traditions.",
      placeholder:
        "Ask a fiqh, fatwa, or textual question (e.g., Ruling on combining prayers while travelling, Zakat on investments)...",
      scopeAll: "IslamQA + Web",
      scopeIslamqa: "IslamQA.info Only",
      scopeWeb: "Scholarly Web",
      depthComprehensive: "Comprehensive",
      depthConcise: "Concise",
      submitIdle: "Search Sources",
      submitLoading: "Searching Archives...",
      suggestedHeading: "Suggested Research Inquiries",
      micStart: "Voice input (English)",
      micStop: "Stop recording",
      micRecording: "Listening in English",
      micTranscribing: "Transcribing English speech...",
      micPermissionError: "Microphone access was denied. Please allow microphone permission in your browser settings.",
      micUnsupportedError: "Voice recording is not supported in this browser.",
      micNoSpeechError: "No speech was detected. Please speak clearly and try again.",
    },
    status: {
      loadingMessage:
        "Querying IslamQA.info, web fatwa archives, and verifying Qur'an & Hadith citations...",
      translatingMessage:
        "Translating scholarly dossier, citations, and references into English...",
      translateError:
        "Unable to translate this research dossier right now. Please try again.",
      errorTitle: "Research Query Error",
      retry: "Retry Search",
      sessionThread: "Session Thread:",
      offlineBanner: "Offline Mode · Saved Archive dossiers remain available.",
    },
    dossier: {
      scopeAllLabel: "IslamQA.info & Scholarly Web",
      scopeIslamqaLabel: "IslamQA.info Archive",
      scopeWebLabel: "Scholarly Web Archives",
      analysisLabel: "Analysis",
      quranUnit: "Qur'an",
      hadithUnit: "Hadith",
      copyCitations: "Copy Citations",
      copied: "Copied",
      exportHtml: "Export HTML",
      saveResearch: "Save Research",
      savedInArchive: "Saved in Archive",
      inquiryPrefix: "Inquiry:",
      summaryHeading: "01. Summary Ruling",
      analysisHeading: "02. Juristic Analysis & Textual Reasoning",
      perspectivesHeading: "03. Scholarly Perspectives & Fatwa Councils",
      guidanceHeading: "04. Practical Conditions & Guidance",
      followUpHeading: "Continue Research Thread",
      followUpPlaceholder:
        "Ask a clarifying follow-up question (with Qur'an & Hadith references)...",
      askFollowUp: "Ask Follow-up",
      researching: "Researching...",
      relatedHeading: "Related Juristic Inquiries",
      exploreArrow: "Explore →",
      quranHeading: "Noble Qur'an Evidences",
      hadithHeading: "Prophetic Hadith References",
      sourcesHeading: "IslamQA.info & Web Sources",
      citedCount: "Cited",
      linksCount: "Links",
      noQuranNote:
        "No direct Qur'anic verse was extracted for this query; consult the detailed analysis and sources below.",
      noHadithNote:
        "No separate Hadith card was structured for this response; inspect the grounded fatwa sources below.",
      gradePrefix: "Grade:",
      narratedBy: "Narrated by",
      directPortalIntro:
        "Primary textual synthesis completed. Verify directly across these scholarly archives for your query:",
      searchIslamqaLabel: "Search IslamQA.info Fatwas",
      searchQuranLabel: "Search Noble Qur'an Verses",
      searchSunnahLabel: "Search Authentic Hadith Collections",
      islamqaGroup: "IslamQA.info Fatwas",
      otherSourcesGroup: "Broader Scholarly Web Archives",
      queriesExecuted: "Search Queries Executed",
      inspectBtn: "Inspect",
      readingBtn: "Reading...",
      inspectedBtn: "Inspected",
      sourceExtractTitle: "Source Page Extract",
      quranLabel: "Qur'an",
      hadithLabel: "Hadith",
      bottomSourcesKicker: "Fatwa Sources & Attribution",
      bottomSourcesTitle: "Sources Divided by Origin",
      fromIslamqaTitle: "From IslamQA.info",
      fromOthersTitle: "From Other Scholarly Sources",
      liveLinksHeading: "Live Grounded Links",
      citedPositionsHeading: "Referenced Rulings & Councils",
      directVerificationHeading: "Direct Archive Verification",
      emptyIslamqaNote:
        "No separate IslamQA.info entry was listed for this query.",
      emptyOthersNote:
        "No additional external scholarly entries were listed for this query.",
      searchSeekersLabel: "Search SeekersGuidance Answers",
    },
    topics: {
      kicker: "Curated Jurisprudence Chapters",
      title: "Fiqh & Fatwa Topic Index",
      subtitle:
        "Select any foundational or contemporary inquiry below to run a live grounded search across IslamQA.info and scholarly web archives with primary Qur'an and Hadith citations.",
    },
    archive: {
      kicker: "Personal Study Dossiers",
      title: "Saved Research Archive",
      countSingular: "dossier",
      countPlural: "dossiers",
      storedSuffix: "saved scholarly",
      filterPlaceholder: "Filter saved archive...",
      emptyTitle: "Your Research Archive is Empty",
      emptyBody:
        "Save any fatwa inquiry to preserve its Qur'anic verses, Hadith citations, and IslamQA.info references for quick offline review.",
      startBtn: "Start an Inquiry",
      noMatch: "No saved dossiers match",
      openDossier: "Open Dossier",
    },
    methodology: {
      kicker: "Usul al-Bahth · Evidentiary Standards",
      title: "Research Methodology & Source Hierarchy",
      subtitle:
        "How Fatwa Pro queries live Islamic fatwa portals, verifies primary textual evidences, and structures juristic responses.",
      principles: [
        {
          num: "01",
          title: "Primacy of the Noble Qur'an",
          body: "Every scholarly inquiry begins with the explicit verses of the Qur'an, presenting the Arabic text with diacritics, Surah and Ayah numbering, and faithful translation alongside its juristic relevance.",
        },
        {
          num: "02",
          title: "Authenticated Prophetic Sunnah",
          body: "Hadith citations are retrieved and cross-checked against canonical collections (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah) with narrator attribution and authenticity grading.",
        },
        {
          num: "03",
          title: "IslamQA.info & Broad Fatwa Grounding",
          body: "Using live web search grounding, queries inspect published fatwas on IslamQA.info as well as recognized Islamic scholarly archives across the internet, returning direct clickable source links and on-demand page inspection.",
        },
        {
          num: "04",
          title: "Fair Representation of Juristic Difference",
          body: "Where classical jurists (Hanafi, Maliki, Shafi'i, Hanbali) or contemporary fatwa councils hold differing valid opinions based on textual interpretation, Fatwa Pro outlines each position respectfully without obscuring consensus rulings.",
        },
      ],
      advisoryTitle: "Scholarly Advisory Notice",
      advisoryBody:
        "Fatwa Pro is an educational and research retrieval tool designed to assist students of knowledge and general readers in locating published fatwas and primary Qur'an and Hadith references. For complex personal matters—such as marital disputes, inheritance settlements, or specific medical exemptions—please consult a qualified local scholar or Mufti who can evaluate individual circumstances directly.",
      returnBtn: "Return to Research Desk",
    },
    footer: {
      left: "Fatwa Pro · Grounded in Qur'an, Authentic Sunnah & IslamQA.info Archives",
      developedBy: "Developed by",
      developerName: "Dr. Saad Hussain",
      rightSuffix: "Educational research aid",
    },
  },
  de: {
    nav: {
      research: "Recherche",
      topics: "Fiqh-Index",
      archive: "Archiv",
      methodology: "Methodik",
      newInquiry: "Neue Anfrage",
    },
    toolbar: {
      languageLabel: "Sprache",
      lightTheme: "Helles Archiv",
      darkTheme: "Abendstudium",
      lightShort: "Hell",
      darkShort: "Dunkel",
      installApp: "App installieren",
      installIos: "Auf iOS installieren",
      iosModalTitle: "Fatwa Pro auf iPhone & iPad installieren",
      iosStep1: "Tippen Sie in der Safari-Leiste auf das Teilen-Symbol.",
      iosStep2: "Scrollen Sie nach unten und wählen Sie Zum Home-Bildschirm.",
      iosStep3: "Tippen Sie auf Hinzufügen, um Fatwa Pro als App zu starten.",
      done: "Fertig",
    },
    search: {
      kicker: "IslamQA.info · Web-Fatwa-Archive · Qur'an & Authentische Hadithe",
      heroTitle: "Islamische Fatwa- & Primärquellen-Recherche",
      heroSubtitle:
        "Durchsuchen Sie veröffentlichte Rechtsgutachten auf IslamQA.info und anerkannten islamischen Wissenschaftsportalen. Jede Antwort basiert auf belegten Versen des Edlen Qur'an und authentischen Prophetentraditionen.",
      placeholder:
        "Stellen Sie eine Fiqh-, Fatwa- oder Quellenfrage (z. B. Gebete auf Reisen zusammenlegen, Zakat auf Aktien)...",
      scopeAll: "IslamQA + Web",
      scopeIslamqa: "Nur IslamQA.info",
      scopeWeb: "Islamisches Web",
      depthComprehensive: "Ausführlich",
      depthConcise: "Kompakt",
      submitIdle: "Quellen durchsuchen",
      submitLoading: "Archive werden durchsucht...",
      suggestedHeading: "Vorgeschlagene Forschungsfragen",
      micStart: "Spracheingabe (Deutsch)",
      micStop: "Aufnahme stoppen",
      micRecording: "Höre auf Deutsch zu",
      micTranscribing: "Transkribiere deutsche Spracheingabe...",
      micPermissionError: "Mikrofonzugriff verweigert. Bitte erlauben Sie das Mikrofon in den Browser-Einstellungen.",
      micUnsupportedError: "Sprachaufnahme wird in diesem Browser leider nicht unterstützt.",
      micNoSpeechError: "Keine Sprache erkannt. Bitte sprechen Sie deutlich und versuchen Sie es erneut.",
    },
    status: {
      loadingMessage:
        "Durchsuche IslamQA.info, Web-Fatwa-Archive und prüfe Qur'an- & Hadith-Belege...",
      translatingMessage:
        "Übersetze das Rechtsgutachten, Zitate und Quellen ins Deutsche...",
      translateError:
        "Dieses Forschungsdossier konnte derzeit nicht übersetzt werden. Bitte erneut versuchen.",
      errorTitle: "Fehler bei der Recherche",
      retry: "Erneut suchen",
      sessionThread: "Sitzungsverlauf:",
      offlineBanner: "Offline-Modus · Gespeicherte Dossiers bleiben verfügbar.",
    },
    dossier: {
      scopeAllLabel: "IslamQA.info & Islamisches Web",
      scopeIslamqaLabel: "IslamQA.info-Archiv",
      scopeWebLabel: "Islamische Web-Archive",
      analysisLabel: "Analyse",
      quranUnit: "Qur'an",
      hadithUnit: "Hadith",
      copyCitations: "Zitate kopieren",
      copied: "Kopiert",
      exportHtml: "HTML exportieren",
      saveResearch: "Speichern",
      savedInArchive: "Im Archiv",
      inquiryPrefix: "Anfrage:",
      summaryHeading: "01. Zusammenfassendes Urteil",
      analysisHeading: "02. Rechtswissenschaftliche Analyse & Beweisführung",
      perspectivesHeading: "03. Gelehrtenmeinungen & Fatwa-Gremien",
      guidanceHeading: "04. Praktische Hinweise & Bedingungen",
      followUpHeading: "Recherche fortsetzen",
      followUpPlaceholder:
        "Stellen Sie eine vertiefende Anschlussfrage (mit Qur'an- & Hadith-Belegen)...",
      askFollowUp: "Nachfragen",
      researching: "Recherchiere...",
      relatedHeading: "Verwandte Fiqh-Fragen",
      exploreArrow: "Erkunden →",
      quranHeading: "Belege aus dem Edlen Qur'an",
      hadithHeading: "Authentische Hadith-Referenzen",
      sourcesHeading: "IslamQA.info & Web-Quellen",
      citedCount: "Zitiert",
      linksCount: "Links",
      noQuranNote:
        "Für diese Anfrage wurde kein direkter Qur'an-Vers extrahiert; bitte prüfen Sie die Analyse und Quellen.",
      noHadithNote:
        "Für diese Antwort wurde keine separate Hadith-Karte erstellt; prüfen Sie die angegebenen Quellen.",
      gradePrefix: "Einstufung:",
      narratedBy: "Überliefert von",
      directPortalIntro:
        "Primärquellen-Synthese abgeschlossen. Überprüfen Sie Ihre Anfrage direkt in diesen Archiven:",
      searchIslamqaLabel: "IslamQA.info Fatwas durchsuchen",
      searchQuranLabel: "Verse im Edlen Qur'an suchen",
      searchSunnahLabel: "Authentische Hadith-Sammlungen suchen",
      islamqaGroup: "IslamQA.info Fatwas",
      otherSourcesGroup: "Weitere islamische Web-Archive",
      queriesExecuted: "Ausgeführte Suchanfragen",
      inspectBtn: "Prüfen",
      readingBtn: "Lese...",
      inspectedBtn: "Geprüft",
      sourceExtractTitle: "Auszug der Quellenseite",
      quranLabel: "Qur'an",
      hadithLabel: "Hadith",
      bottomSourcesKicker: "Fatwa-Quellen & Nachweise",
      bottomSourcesTitle: "Quellen nach Herkunft unterteilt",
      fromIslamqaTitle: "Von IslamQA.info",
      fromOthersTitle: "Von anderen Quellen",
      liveLinksHeading: "Gefundene Live-Links",
      citedPositionsHeading: "Zitierte Gutachten & Gelehrtenräte",
      directVerificationHeading: "Direkte Archiv-Überprüfung",
      emptyIslamqaNote:
        "Für diese Anfrage wurden keine separaten IslamQA.info-Einträge aufgeführt.",
      emptyOthersNote:
        "Für diese Anfrage wurden keine weiteren externen Quellen aufgeführt.",
      searchSeekersLabel: "SeekersGuidance Antworten durchsuchen",
    },
    topics: {
      kicker: "Kuratierte Rechtskapitel",
      title: "Fiqh- & Fatwa-Themenverzeichnis",
      subtitle:
        "Wählen Sie eine klassische oder zeitgenössische Frage, um eine Live-Recherche auf IslamQA.info und in islamischen Web-Archiven mit Qur'an- und Hadith-Belegen zu starten.",
    },
    archive: {
      kicker: "Persönliche Studiendossiers",
      title: "Gespeichertes Forschungsarchiv",
      countSingular: "Dossier",
      countPlural: "Dossiers",
      storedSuffix: "gespeicherte",
      filterPlaceholder: "Archiv durchsuchen...",
      emptyTitle: "Ihr Forschungsarchiv ist leer",
      emptyBody:
        "Speichern Sie beliebige Fatwa-Anfragen, um Qur'an-Verse, Hadith-Belege und IslamQA.info-Quellen für die Offline-Lektüre aufzubewahren.",
      startBtn: "Recherche starten",
      noMatch: "Keine gespeicherten Dossiers gefunden für",
      openDossier: "Dossier öffnen",
    },
    methodology: {
      kicker: "Usul al-Bahth · Quellenstandards",
      title: "Forschungsmethodik & Quellenhierarchie",
      subtitle:
        "Wie Fatwa Pro islamische Fatwa-Portale abfragt, Primärbelege prüft und rechtswissenschaftliche Antworten strukturiert.",
      principles: [
        {
          num: "01",
          title: "Vorrang des Edlen Qur'an",
          body: "Jede Recherche beginnt mit den eindeutigen Versen des Qur'an – mit arabischem Originaltext, Suren- und Versangabe, getreuer Übersetzung und juristischer Einordnung.",
        },
        {
          num: "02",
          title: "Authentifizierte Prophetische Sunnah",
          body: "Hadith-Belege werden aus den kanonischen Sammlungen (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah) mit Überlieferer und Authentizitätsgrad herangezogen.",
        },
        {
          num: "03",
          title: "IslamQA.info & Web-Fundierung",
          body: "Durch Live-Websuche werden veröffentlichte Fatwas auf IslamQA.info sowie anerkannte islamische Wissenschaftsarchive ausgewertet und mit direkten Quellenlinks bereitgestellt.",
        },
        {
          num: "04",
          title: "Ausgewogene Darstellung von Rechtsmeinungen",
          body: "Wo klassische Rechtsschulen (Hanafi, Maliki, Schafi'i, Hanbali) oder zeitgenössische Fatwa-Räte begründete unterschiedliche Ansichten vertreten, stellt Fatwa Pro diese respektvoll und sachlich dar.",
        },
      ],
      advisoryTitle: "Wissenschaftlicher Hinweis",
      advisoryBody:
        "Fatwa Pro ist ein Bildungs- und Recherchewerkzeug zur Auffindung veröffentlichter Fatwas sowie von Qur'an- und Hadith-Belegen. Bei komplexen persönlichen Angelegenheiten – etwa Ehe-, Erb- oder medizinischen Fragen – wenden Sie sich bitte direkt an einen qualifizierten Gelehrten oder Mufti vor Ort.",
      returnBtn: "Zurück zur Recherche",
    },
    footer: {
      left: "Fatwa Pro · Fundiert auf Qur'an, authentischer Sunnah & IslamQA.info-Archiven",
      developedBy: "Entwickelt von",
      developerName: "Dr. Saad Hussain",
      rightSuffix: "Wissenschaftliches Recherchewerkzeug",
    },
  },
  ur: {
    nav: {
      research: "تحقیق",
      topics: "فقہی فہرست",
      archive: "محفوظ ذخیرہ",
      methodology: "طریقۂ کار",
      newInquiry: "نیا سوال",
    },
    toolbar: {
      languageLabel: "زبان",
      lightTheme: "روشن ورق",
      darkTheme: "شب مطالعہ",
      lightShort: "روشن",
      darkShort: "تاریک",
      installApp: "ایپ انسٹال کریں",
      installIos: "iOS پر انسٹال کریں",
      iosModalTitle: "آئی فون اور آئی پیڈ پر فتویٰ پرو انسٹال کریں",
      iosStep1: "سفاری کے ٹول بار میں شیئر (Share) بٹن پر ٹیپ کریں۔",
      iosStep2: "نیچے اسکرول کر کے Add to Home Screen منتخب کریں۔",
      iosStep3: "ایپ شامل کرنے کے لیے Add پر ٹیپ کریں۔",
      done: "مکمل",
    },
    search: {
      kicker: "IslamQA.info · ویب فتاویٰ ذخائر · قرآنِ مجید اور صحیح احادیث",
      heroTitle: "شرعی فتاویٰ اور بنیادی مآخذ کی تحقیق",
      heroSubtitle:
        "IslamQA.info اور مستند اسلامی علمی ویب سائٹس سے شائع شدہ فتاویٰ تلاش کریں۔ ہر جواب قرآنِ کریم کی آیات اور مستند احادیثِ نبویہ کے حوالوں کے ساتھ پیش کیا جاتا ہے۔",
      placeholder:
        "فقہی، شرعی یا علمی سوال درج کریں (مثلاً: سفر میں نماز جمع کرنے کا حکم، حصص اور سرمایہ کاری پر زکوٰۃ)...",
      scopeAll: "IslamQA + ویب",
      scopeIslamqa: "صرف IslamQA.info",
      scopeWeb: "اسلامی ویب",
      depthComprehensive: "مفصل",
      depthConcise: "مختصر",
      submitIdle: "مآخذ تلاش کریں",
      submitLoading: "ذخائر میں تلاش جاری ہے...",
      suggestedHeading: "تجویز کردہ تحقیقی سوالات",
      micStart: "آواز کے ذریعے تلاش (اردو)",
      micStop: "ریکارڈنگ بند کریں",
      micRecording: "اردو میں آواز سنی جا رہی ہے",
      micTranscribing: "اردو آواز کو تحریر میں تبدیل کیا جا رہا ہے...",
      micPermissionError: "مائیکروفون کی اجازت نہیں ملی۔ براہِ کرم براؤزر کی ترتیبات میں مائیکروفون کی اجازت دیں۔",
      micUnsupportedError: "اس براؤزر میں وائس ریکارڈنگ کی سہولت دستیاب نہیں ہے۔",
      micNoSpeechError: "کوئی آواز سنائی نہیں دی۔ براہِ کرم واضح آواز میں دوبارہ کوشش کریں۔",
    },
    status: {
      loadingMessage:
        "IslamQA.info اور مستند علمی ذخائر میں تلاش اور قرآن و حدیث کے حوالوں کی تصدیق جاری ہے...",
      translatingMessage:
        "مکمل تحقیقی فتویٰ، آیات و احادیث کے تراجم اور مآخذ کا اردو میں ترجمہ جاری ہے...",
      translateError:
        "اس وقت اس تحقیقی مواد کا ترجمہ ممکن نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔",
      errorTitle: "تحقیقی تلاش میں خرابی",
      retry: "دوبارہ کوشش کریں",
      sessionThread: "تحقیقی سلسلہ:",
      offlineBanner: "آف لائن موڈ · محفوظ شدہ فتاویٰ مطالعہ کے لیے دستیاب ہیں۔",
    },
    dossier: {
      scopeAllLabel: "IslamQA.info اور علمی ویب",
      scopeIslamqaLabel: "IslamQA.info ذخیرہ",
      scopeWebLabel: "اسلامی علمی ویب",
      analysisLabel: "تجزیہ",
      quranUnit: "قرآن",
      hadithUnit: "حدیث",
      copyCitations: "حوالہ جات کاپی کریں",
      copied: "کاپی ہو گیا",
      exportHtml: "HTML محفوظ کریں",
      saveResearch: "تحقیق محفوظ کریں",
      savedInArchive: "ذخیرے میں محفوظ",
      inquiryPrefix: "سوال:",
      summaryHeading: "01. خلاصۂ حکمِ شرعی",
      analysisHeading: "02. فقہی تجزیہ اور شرعی استدلال",
      perspectivesHeading: "03. فقہی مکاتبِ فکر اور علمی آراء",
      guidanceHeading: "04. عملی شرائط اور رہنمائی",
      followUpHeading: "تحقیق جاری رکھیں",
      followUpPlaceholder:
        "مزید وضاحتی سوال پوچھیں (قرآن و حدیث کے حوالوں کے ساتھ)...",
      askFollowUp: "ضمنی سوال پوچھیں",
      researching: "تحقیق جاری ہے...",
      relatedHeading: "متعلقہ فقہی سوالات",
      exploreArrow: "مطالعہ کریں ←",
      quranHeading: "قرآنی دلائل",
      hadithHeading: "احادیثِ نبویہ کے حوالے",
      sourcesHeading: "IslamQA.info اور ویب مآخذ",
      citedCount: "حوالے",
      linksCount: "روابط",
      noQuranNote:
        "اس سوال کے لیے کوئی الگ قرآنی آیت علیحدہ کارڈ میں درج نہیں ہوئی؛ نیچے تفصیلی تجزیہ اور مآخذ ملاحظہ کریں۔",
      noHadithNote:
        "اس جواب میں علیحدہ حدیث کارڈ شامل نہیں؛ نیچے دیے گئے مستند مآخذ ملاحظہ کریں۔",
      gradePrefix: "درجہ:",
      narratedBy: "راوی:",
      directPortalIntro:
        "بنیادی نصوص کی روشنی میں تحقیق مکمل ہو گئی۔ براہِ راست ان مستند ذخائر میں بھی تصدیق کریں:",
      searchIslamqaLabel: "IslamQA.info پر فتاویٰ تلاش کریں",
      searchQuranLabel: "Quran.com پر آیات تلاش کریں",
      searchSunnahLabel: "Sunnah.com پر احادیث تلاش کریں",
      islamqaGroup: "IslamQA.info فتاویٰ",
      otherSourcesGroup: "دیگر مستند اسلامی ویب مآخذ",
      queriesExecuted: "تلاش کی گئی اصطلاحات",
      inspectBtn: "جائزہ لیں",
      readingBtn: "مطالعہ...",
      inspectedBtn: "مکمل",
      sourceExtractTitle: "مأخذ صفحے کا خلاصہ",
      quranLabel: "قرآن",
      hadithLabel: "حدیث",
      bottomSourcesKicker: "فتاویٰ کے مآخذ اور حوالہ جات",
      bottomSourcesTitle: "مآخذ کی درجہ بندی بلحاظِ ماخذ",
      fromIslamqaTitle: "IslamQA.info سے",
      fromOthersTitle: "دیگر مستند ذرائع سے",
      liveLinksHeading: "براہِ راست ویب لنکس",
      citedPositionsHeading: "حوالہ شدہ فتاویٰ اور فقہی مجالس",
      directVerificationHeading: "براہِ راست تصدیق کے روابط",
      emptyIslamqaNote:
        "اس سوال کے لیے IslamQA.info کا کوئی الگ حوالہ درج نہیں ہوا۔",
      emptyOthersNote:
        "اس سوال کے لیے دیگر مستند ذرائع کا کوئی الگ حوالہ درج نہیں ہوا۔",
      searchSeekersLabel: "SeekersGuidance پر فتاویٰ تلاش کریں",
    },
    topics: {
      kicker: "منتخب فقہی ابواب",
      title: "فقہی و شرعی موضوعات کی فہرست",
      subtitle:
        "کسی بھی کلاسیکی یا جدید فقہی مسئلے کا انتخاب کریں تاکہ IslamQA.info اور مستند ویب ذخائر سے قرآن و حدیث کے دلائل کے ساتھ براہِ راست تحقیق کی جا سکے۔",
    },
    archive: {
      kicker: "ذاتی تحقیقی ملفات",
      title: "محفوظ تحقیقی ذخیرہ",
      countSingular: "فتویٰ",
      countPlural: "فتاویٰ",
      storedSuffix: "محفوظ شدہ",
      filterPlaceholder: "محفوظ ذخیرے میں تلاش کریں...",
      emptyTitle: "آپ کا تحقیقی ذخیرہ خالی ہے",
      emptyBody:
        "آف لائن مطالعہ کے لیے کسی بھی فتویٰ تحقیق کو قرآنی آیات، احادیث اور IslamQA.info کے حوالوں سمیت محفوظ کریں۔",
      startBtn: "تحقیق شروع کریں",
      noMatch: "ان الفاظ سے کوئی محفوظ فتویٰ نہیں ملا:",
      openDossier: "تفصیل کھولیں",
    },
    methodology: {
      kicker: "اصولِ بحث · استدلالی معیار",
      title: "طریقۂ تحقیق اور مآخذ کی ترتیب",
      subtitle:
        "فتویٰ پرو کس طرح مستند فتویٰ پورٹلز سے معلومات اخذ کرتا ہے، نصوص کی تصدیق کرتا ہے اور فقہی جوابات ترتیب دیتا ہے۔",
      principles: [
        {
          num: "01",
          title: "قرآنِ مجید کی اولین حیثیت",
          body: "ہر شرعی تحقیق کی بنیاد قرآنِ کریم کی صریح آیات پر رکھی جاتی ہے، جنہیں اعراب کے ساتھ عربی متن، سورت و آیت نمبر اور مستند ترجمے سمیت پیش کیا جاتا ہے۔",
        },
        {
          num: "02",
          title: "صحیح احادیثِ نبویہ",
          body: "حدیث کے حوالے کتبِ ستہ (صحیح بخاری، صحیح مسلم، سنن ابی داود، جامع ترمذی، سنن نسائی، سنن ابن ماجہ) سے راوی اور صحت کے درجے کی صراحت کے ساتھ پیش کیے جاتے ہیں۔",
        },
        {
          num: "03",
          title: "IslamQA.info اور مستند ویب مآخذ",
          body: "لائیو ویب سرچ کے ذریعے IslamQA.info اور دیگر معتبر اسلامی علمی اداروں کے شائع شدہ فتاویٰ تلاش کر کے براہِ راست لنکس اور صفحہ کے خلاصے فراہم کیے جاتے ہیں۔",
        },
        {
          num: "04",
          title: "فقہی اختلافات کی دیانتدارانہ وضاحت",
          body: "جہاں ائمہِ اربعہ (حنفی، مالکی، شافعی، حنبلی) یا معاصر فقہی مجالس کے درمیان دلائل کی بنیاد پر معتبر اختلاف موجود ہو، وہاں ہر مؤقف کو احترام اور وضاحت کے ساتھ بیان کیا جاتا ہے۔",
        },
      ],
      advisoryTitle: "علمی و شرعی تنبیہ",
      advisoryBody:
        "فتویٰ پرو ایک تعلیمی اور تحقیقی معاون ایپ ہے جو طلبۂ علم اور عام قارئین کو شائع شدہ فتاویٰ اور قرآن و حدیث کے حوالے تلاش کرنے میں مدد دیتی ہے۔ نجی معاملات مثلاً عائلی تنازعات، وراثت کی تقسیم یا مخصوص طبی اعذار کے لیے اپنے مقامی مستند عالمِ دین یا مفتی سے براہِ راست رجوع فرمائیں۔",
      returnBtn: "تحقیق کے صفحے پر واپس جائیں",
    },
    footer: {
      left: "فتویٰ پرو · قرآنِ مجید، صحیح سنت اور IslamQA.info ذخائر پر مبنی",
      developedBy: "تیار کردہ:",
      developerName: "ڈاکٹر سعد حسین",
      rightSuffix: "علمی و تحقیقی معاونت",
    },
  },
  ar: {
    nav: {
      research: "البحث",
      topics: "فهرس الفقه",
      archive: "الأرشيف المحفوظ",
      methodology: "المنهجية",
      newInquiry: "مسألة جديدة",
    },
    toolbar: {
      languageLabel: "اللغة",
      lightTheme: "الوضع النهاري",
      darkTheme: "وضع المطالعة الليلي",
      lightShort: "نهاري",
      darkShort: "ليلي",
      installApp: "تثبيت التطبيق",
      installIos: "التثبيت على iOS",
      iosModalTitle: "تثبيت فتوى برو على iPhone و iPad",
      iosStep1: "اضغط على أيقونة المشاركة (Share) في شريط متصفح سفاري.",
      iosStep2: "مرر للأسفل واختر الإضافة إلى الشاشة الرئيسية (Add to Home Screen).",
      iosStep3: "اضغط على إضافة (Add) لتشغيل التطبيق مباشرة.",
      done: "تم",
    },
    search: {
      kicker: "IslamQA.info · أرشيفات الفتاوى · القرآن الكريم والسنة الصحيحة",
      heroTitle: "البحث الفقهي والفتاوى المؤصلة",
      heroSubtitle:
        "ابحث في الفتاوى المنشورة عبر موقع IslamQA.info والمواقع العلمية الإسلامية المعتمدة، مع توثيق كل جواب بآيات القرآن الكريم والأحاديث النبوية الصحيحة.",
      placeholder:
        "اكتب سؤالك الفقهي أو الشرعي (مثل: حكم الجمع بين الصلاتين في السفر، زكاة الأسهم والاستثمارات)...",
      scopeAll: "IslamQA + الويب",
      scopeIslamqa: "IslamQA.info فقط",
      scopeWeb: "المواقع العلمية",
      depthComprehensive: "بحث مفصل",
      depthConcise: "مختصر",
      submitIdle: "ابحث في المصادر",
      submitLoading: "جارٍ البحث في الأرشيفات...",
      suggestedHeading: "مسائل بحثية مقترحة",
      micStart: "البحث الصوتي (العربية)",
      micStop: "إيقاف التسجيل",
      micRecording: "جارٍ الاستماع باللغة العربية",
      micTranscribing: "جارٍ تحويل الصوت العربي إلى نص...",
      micPermissionError: "تم رفض إذن الميكروفون. يرجى السماح باستخدام الميكروفون من إعدادات المتصفح.",
      micUnsupportedError: "التسجيل الصوتي غير مدعوم في هذا المتصفح.",
      micNoSpeechError: "لم يتم التقاط صوت واضح. يرجى التحدث بوضوح والمحاولة مرة أخرى.",
    },
    status: {
      loadingMessage:
        "جارٍ البحث في IslamQA.info وأرشيفات الفتاوى وتوثيق أدلة القرآن والسنة...",
      translatingMessage:
        "جارٍ ترجمة الملف البحثي والأدلة الشرعية والمصادر إلى العربية...",
      translateError:
        "تعذر ترجمة هذا الملف البحثي حالياً. يرجى المحاولة مرة أخرى.",
      errorTitle: "خطأ في عملية البحث",
      retry: "إعادة البحث",
      sessionThread: "سلسلة البحث:",
      offlineBanner: "وضع عدم الاتصال · تظل الأبحاث المحفوظة متاحة للمطالعة.",
    },
    dossier: {
      scopeAllLabel: "IslamQA.info والمواقع العلمية",
      scopeIslamqaLabel: "أرشيف IslamQA.info",
      scopeWebLabel: "أرشيفات الويب العلمية",
      analysisLabel: "التحليل",
      quranUnit: "قرآن",
      hadithUnit: "حديث",
      copyCitations: "نسخ المراجع",
      copied: "تم النسخ",
      exportHtml: "تصدير HTML",
      saveResearch: "حفظ البحث",
      savedInArchive: "محفوظ في الأرشيف",
      inquiryPrefix: "السؤال:",
      summaryHeading: "01. خلاصة الحكم الشرعي",
      analysisHeading: "02. التحليل الفقهي والاستدلال النصي",
      perspectivesHeading: "03. المذاهب الفقهية والمجامع العلمية",
      guidanceHeading: "04. الضوابط العملية والتوجيهات",
      followUpHeading: "متابعة البحث",
      followUpPlaceholder:
        "اطرح سؤالاً تكميلياً للتوضيح (مع أدلة القرآن والحديث)...",
      askFollowUp: "سؤال تكميلي",
      researching: "جارٍ البحث...",
      relatedHeading: "مسائل فقهية ذات صلة",
      exploreArrow: "استكشف ←",
      quranHeading: "الأدلة من القرآن الكريم",
      hadithHeading: "الأدلة من السنة النبوية",
      sourcesHeading: "مصادر IslamQA.info والويب",
      citedCount: "مراجع",
      linksCount: "روابط",
      noQuranNote:
        "لم تُستخرج آية قرآنية في بطاقة مستقلة لهذه المسألة؛ يرجى مراجعة التحليل والمصادر أدناه.",
      noHadithNote:
        "لم تُدرج بطاقة حديث مستقلة هنا؛ يرجى مراجعة المصادر الموثقة أدناه.",
      gradePrefix: "الدرجة:",
      narratedBy: "عن",
      directPortalIntro:
        "اكتمل العرض التأصيلي. يمكنك التحقق مباشرة عبر هذه البوابات العلمية المعتمدة:",
      searchIslamqaLabel: "البحث في فتاوى IslamQA.info",
      searchQuranLabel: "البحث في آيات القرآن الكريم (Quran.com)",
      searchSunnahLabel: "البحث في كتب السنة (Sunnah.com)",
      islamqaGroup: "فتاوى IslamQA.info",
      otherSourcesGroup: "مصادر علمية إسلامية أخرى",
      queriesExecuted: "عبارات البحث المنفذة",
      inspectBtn: "فحص المصدر",
      readingBtn: "جارٍ القراءة...",
      inspectedBtn: "تم الفحص",
      sourceExtractTitle: "ملخص صفحة المصدر",
      quranLabel: "القرآن",
      hadithLabel: "الحديث",
      bottomSourcesKicker: "مصادر الفتاوى والتوثيق",
      bottomSourcesTitle: "توزيع المصادر حسب الجهة",
      fromIslamqaTitle: "من موقع IslamQA.info",
      fromOthersTitle: "من مصادر علمية أخرى",
      liveLinksHeading: "روابط مباشرة من البحث",
      citedPositionsHeading: "الفتاوى والمجامع الفقهية المشار إليها",
      directVerificationHeading: "روابط التحقق المباشر",
      emptyIslamqaNote:
        "لم تُدرج مراجع منفصلة من IslamQA.info لهذه المسألة.",
      emptyOthersNote:
        "لم تُدرج مراجع خارجية إضافية لهذه المسألة.",
      searchSeekersLabel: "البحث في SeekersGuidance",
    },
    topics: {
      kicker: "أبواب فقهية مختارة",
      title: "فهرس الموضوعات الفقهية والفتاوى",
      subtitle:
        "اختر أي مسألة فقهية أو معاصرة لإجراء بحث موثق عبر IslamQA.info والمواقع العلمية مع استحضار أدلة القرآن والسنة.",
    },
    archive: {
      kicker: "ملفات الدراسة الشخصية",
      title: "أرشيف الأبحاث المحفوظة",
      countSingular: "بحث",
      countPlural: "أبحاث",
      storedSuffix: "ملفات محفوظة",
      filterPlaceholder: "تصفية الأرشيف المحفوظ...",
      emptyTitle: "أرشيف أبحاثك فارغ",
      emptyBody:
        "احفظ أي بحث فقهي للاحتفاظ بالآيات القرآنية والأحاديث النبوية ومراجع IslamQA.info للمطالعة دون اتصال.",
      startBtn: "ابدأ بحثاً جديداً",
      noMatch: "لا توجد أبحاث محفوظة تطابق:",
      openDossier: "فتح البحث",
    },
    methodology: {
      kicker: "أصول البحث · معايير التوثيق",
      title: "منهجية البحث وتراتبية المصادر",
      subtitle:
        "كيف يبحث تطبيق فتوى برو في بوابات الفتوى الإسلامية ويتحقق من الأدلة النصية وينسق الإجابات الفقهية.",
      principles: [
        {
          num: "01",
          title: "أولوية القرآن الكريم",
          body: "يبدأ كل بحث فقهي بالآيات القرآنية الصريحة مع عرض النص العربي مضبوطاً بالشكل ورقم السورة والآية وبيان وجه الدلالة الفقهية.",
        },
        {
          num: "02",
          title: "السنة النبوية الصحيحة",
          body: "تُستخرج الأحاديث النبوية من دواوين السنة المعتمدة (الصحيحين والسنن الأربعة) مع ذكر الصحابي الراوي ودرجة الحديث صحةً أو حسناً.",
        },
        {
          num: "03",
          title: "IslamQA.info والمصادر العلمية المعتبرة",
          body: "يُجري النظام بحثاً في فتاوى IslamQA.info والمواقع والمجامع الفقهية الموثوقة مع فصل مصادر IslamQA.info عن المصادر الأخرى في أسفل كل نتيجة.",
        },
        {
          num: "04",
          title: "بيان الخلاف الفقهي المعتبر بأمانة",
          body: "عند وجود خلاف معتبر بين المذاهب الأربعة (الحنفي والمالكي والشافعي والحنبلي) أو المجامع الفقهية، يُعرض كل قول بدليله بأسلوب علمي رصين.",
        },
      ],
      advisoryTitle: "تنبيه علمي وشرعي",
      advisoryBody:
        "تطبيق فتوى برو أداة بحثية وتعليمية تساعد طلبة العلم والقراء في الوصول إلى الفتاوى المنشورة وأدلة الكتاب والسنة. أما القضايا الشخصية الخاصة كالمنازعات الأسرية وتقسيم التركات والأعذار الطبية الدقيقة فيُنصح بمراجعة أهل العلم والفتوى المختصين مباشرة.",
      returnBtn: "العودة إلى صفحة البحث",
    },
    footer: {
      left: "فتوى برو · مؤصل على القرآن الكريم والسنة الصحيحة وأرشيف IslamQA.info",
      developedBy: "تطوير:",
      developerName: "د. سعد حسين",
      rightSuffix: "أداة بحث علمي وتعليمي",
    },
  },
};

export const LOCALIZED_QUICK_INQUIRIES: Record<AppLanguage, string[]> = {
  en: [
    "Ruling on combining prayers while travelling and distance threshold",
    "How is Zakat calculated on stocks, index funds, and retirement accounts?",
    "Does using an asthma inhaler or blood test break the fast in Ramadan?",
    "What are the conditions of a valid marriage (Nikah) contract in Islam?",
  ],
  de: [
    "Urteil über das Zusammenlegen von Gebeten auf Reisen und Mindestentfernung",
    "Wie wird die Zakat auf Aktien, ETFs und Altersvorsorge berechnet?",
    "Brechen Asthma-Inhalatoren oder Bluttests das Fasten im Ramadan?",
    "Welche Bedingungen gelten für einen gültigen islamischen Ehevertrag (Nikah)?",
  ],
  ur: [
    "سفر کے دوران نمازیں جمع کرنے اور قصر کرنے کی شرعی مسافت کا حکم",
    "شیئرز، میوچل فنڈز اور پنشن فنڈ پر زکوٰۃ کا حساب کیسے کیا جائے؟",
    "کیا رمضان میں دمہ کا انہیلر استعمال کرنے یا خون ٹیسٹ کرانے سے روزہ ٹوٹ جاتا ہے؟",
    "اسلام میں صحیح نکاح کے بنیادی شرائط اور ارکان کیا ہیں؟",
  ],
  ar: [
    "حكم الجمع بين الصلاتين في السفر ومقدار المسافة المبيحة للقصر",
    "كيف تُحسب زكاة الأسهم والصناديق الاستثمارية ومدخرات التقاعد؟",
    "هل استخدام بخاخ الربو أو تحليل الدم يفطر الصائم في رمضان؟",
    "ما هي شروط وأركان عقد النكاح الصحيح في الإسلام؟",
  ],
};

export const LOCALIZED_FIQH_CHAPTERS: Record<AppLanguage, FiqhTopicChapter[]> = {
  en: [
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
  ],
  de: [
    {
      id: "worship",
      number: "01",
      title: "Reinheit & Gebet",
      arabicTitle: "الطهارة والصلاة",
      description:
        "Rechtsurteile zur Gebetswaschung (Wudu), zum Streichen über Socken, zu Gebetszeiten, Gemeinschaftsgebeten und dem Vergesslichkeits-Sujud.",
      inquiries: [
        "Welche Bedingungen und Fristen gelten für das Streichen über Socken (Khuffayn)?",
        "Wann wird Sujud al-Sahw vor bzw. nach dem Salam verrichtet?",
        "Urteil über das Zusammenlegen von Gebeten auf Reisen und Mindestentfernung",
        "Was macht das Wudu nach den vier sunnitischen Rechtsschulen ungültig?",
      ],
    },
    {
      id: "fasting-zakat",
      number: "02",
      title: "Fasten & Zakat",
      arabicTitle: "الصيام والزكاة",
      description:
        "Quellenbelege zu Fastenausnahmen im Ramadan, Fidyah, Kaffarah, Nisab-Grenzen und moderner Vermögens-Zakat.",
      inquiries: [
        "Brechen Asthma-Inhalatoren oder Bluttests das Fasten im Ramadan?",
        "Wie wird die Zakat auf Aktien, ETFs und Altersvorsorge berechnet?",
        "Wer sind die acht Zakat-Empfängergruppen in Sure At-Tawbah?",
        "Wie werden versäumte Ramadan-Fastentage nachgeholt, wenn sich die Nachholung verzögert?",
      ],
    },
    {
      id: "family",
      number: "03",
      title: "Ehe, Familie & Erbrecht",
      arabicTitle: "النكاح والأسرة",
      description:
        "Primärbelege zu Eheverträgen, Vormundschaft (Wali), ehelichen Rechten, Güte gegenüber den Eltern und Nachlassverteilung.",
      inquiries: [
        "Welche Bedingungen gelten für einen gültigen islamischen Ehevertrag (Nikah)?",
        "Welche Rolle spielt die Zustimmung der Braut und des Wali bei der Eheschließung?",
        "Pflichten gegenüber betagten Eltern im Einklang mit familiären Verpflichtungen",
        "Wie schützt das islamische Erbrecht (Fara'id) die Anteile von Töchtern und Eltern?",
      ],
    },
    {
      id: "commerce",
      number: "04",
      title: "Finanzen & Zeitgenössische Ethik",
      arabicTitle: "المعاملات والقضايا المعاصرة",
      description:
        "Fatwas zu zinsfreier Finanzierung, digitalem Handel, medizinischer Bioethik, Speisevorschriften und neuer Technologie.",
      inquiries: [
        "Islamisches Urteil über konventionelle Immobilienfinanzierung vs. Murabaha",
        "Zulässigkeit von Kryptowährungen und Staking im zeitgenössischen Fiqh",
        "Urteil über Gelatine und tierische Enzyme in Lebensmitteln und Arzneien",
        "Ethische Regeln für den Einsatz künstlicher Intelligenz in Wissenschaft und Beruf",
      ],
    },
  ],
  ur: [
    {
      id: "worship",
      number: "01",
      title: "طہارت اور نماز",
      arabicTitle: "الطهارة والصلاة",
      description:
        "وضو، موزوں یا جرابوں پر مسح، نماز کے اوقات، باجماعت نماز اور سجدۂ سہو کے شرعی احکام۔",
      inquiries: [
        "چمڑے کے موزوں یا عام جرابوں پر مسح کرنے کی شرائط اور مدت کیا ہے؟",
        "سجدۂ سہو سلام سے پہلے کب کیا جاتا ہے اور سلام کے بعد کب؟",
        "سفر کے دوران نمازیں جمع کرنے اور قصر کرنے کی شرعی مسافت کا حکم",
        "ائمہِ اربعہ کے نزدیک کن چیزوں سے وضو ٹوٹ جاتا ہے؟",
      ],
    },
    {
      id: "fasting-zakat",
      number: "02",
      title: "روزہ اور زکوٰۃ",
      arabicTitle: "الصيام والزكاة",
      description:
        "رمضان کے روزوں کی رخصتیں، فدیہ، کفارہ، نصابِ زکوٰۃ اور جدید مالیاتی اثاثوں پر زکوٰۃ کے دلائل۔",
      inquiries: [
        "کیا رمضان میں دمہ کا انہیلر استعمال کرنے یا خون ٹیسٹ کرانے سے روزہ ٹوٹ جاتا ہے؟",
        "شیئرز، میوچل فنڈز اور پنشن فنڈ پر زکوٰۃ کا حساب کیسے کیا جائے؟",
        "سورۂ توبہ میں بیان کردہ زکوٰۃ کے آٹھ مصارف کون کون سے ہیں؟",
        "اگر قضا روزے اگلے رمضان تک رہ جائیں تو ان کی ادائیگی کا کیا حکم ہے؟",
      ],
    },
    {
      id: "family",
      number: "03",
      title: "نکاح، خاندان اور وراثت",
      arabicTitle: "النكاح والأسرة",
      description:
        "عقدِ نکاح کی شرائط، ولی کی حیثیت، میاں بیوی کے حقوق، والدین سے حسنِ سلوک اور تقسیمِ وراثت کے احکام۔",
      inquiries: [
        "اسلام میں صحیح نکاح کے بنیادی شرائط اور ارکان کیا ہیں؟",
        "نکاح میں دلہن کی رضامندی اور ولی کی اجازت کی شرعی حیثیت کیا ہے؟",
        "بوڑھے والدین کی خدمت اور ازدواجی ذمہ داریوں میں توازن کیسے قائم رکھا جائے؟",
        "اسلامی قانونِ وراثت (فرائض) بیٹیوں اور والدین کے حصوں کا تحفظ کیسے کرتا ہے؟",
      ],
    },
    {
      id: "commerce",
      number: "04",
      title: "معاملات اور عصری مسائل",
      arabicTitle: "المعاملات والقضايا المعاصرة",
      description:
        "سود سے پاک مالیات، ڈیجیٹل تجارت، طبی مسائل، حلال و حرام غذا اور جدید ٹیکنالوجی سے متعلق فتاویٰ۔",
      inquiries: [
        "روایتی سودی ہوم لون بمقابلہ اسلامی مرابحہ ہوم فنانسنگ کا شرعی حکم",
        "معاصر فقہ کی روشنی میں کرپٹو کرنسی کی تجارت اور اسٹیکنگ کا حکم",
        "غذا اور ادویات میں جیلیٹن اور حیوانی اجزاء کے استعمال کا شرعی حکم",
        "علمی تحقیق اور پیشہ ورانہ کام میں مصنوعی ذہانت (AI) کے استعمال کے آداب و احکام",
      ],
    },
  ],
  ar: [
    {
      id: "worship",
      number: "01",
      title: "الطهارة والصلاة",
      arabicTitle: "الطهارة والصلاة",
      description:
        "أحكام الوضوء والمسح على الخفين والجوربين ومواقيت الصلاة وصلاة الجماعة وسجود السهو.",
      inquiries: [
        "ما شروط المسح على الخفين والجوربين وكم مدته للمقيم والمسافر؟",
        "متى يُشرع سجود السهو قبل السلام ومتى يكون بعد السلام؟",
        "حكم الجمع بين الصلاتين في السفر ومقدار المسافة المبيحة للقصر",
        "ما هي نواقض الوضوء عند المذاهب الفقهية الأربعة؟",
      ],
    },
    {
      id: "fasting-zakat",
      number: "02",
      title: "الصيام والزكاة",
      arabicTitle: "الصيام والزكاة",
      description:
        "أحكام أعذار الصيام في رمضان والفدية والكفارة ونصاب الزكاة وزكاة الأصول المالية المعاصرة.",
      inquiries: [
        "هل استخدام بخاخ الربو أو تحليل الدم يفطر الصائم في رمضان؟",
        "كيف تُحسب زكاة الأسهم والصناديق الاستثمارية ومدخرات التقاعد؟",
        "من هم مصارف الزكاة الثمانية المذكورون في سورة التوبة؟",
        "ما حكم من أخر قضاء صيام رمضان حتى دخل رمضان التالي؟",
      ],
    },
    {
      id: "family",
      number: "03",
      title: "النكاح والأسرة والمواريث",
      arabicTitle: "النكاح والأسرة",
      description:
        "شروط عقد النكاح والولاية والحقوق الزوجية وبر الوالدين وأحكام قسمة التركات.",
      inquiries: [
        "ما هي شروط وأركان عقد النكاح الصحيح في الإسلام؟",
        "ما حكم اشتراط رضا الزوجة وإذن الولي في عقد الزواج؟",
        "حقوق الوالدين المسنين وكيفية التوفيق بينها وبين المسؤوليات الأسرية",
        "كيف يضمن نظام المواريث الإسلامي حقوق البنات والوالدين؟",
      ],
    },
    {
      id: "commerce",
      number: "04",
      title: "المعاملات والقضايا المعاصرة",
      arabicTitle: "المعاملات والقضايا المعاصرة",
      description:
        "فتاوى المعاملات المالية الإسلامية والتجارة الرقمية والأخلاقيات الطبية والأطعمة والتقنيات الحديثة.",
      inquiries: [
        "حكم التمويل العقاري الربوي مقارنة بتمويل المرابحة الإسلامية",
        "حكم تداول العملات الرقمية وتخزينها (Staking) في الفقه المعاصر",
        "حكم الجيلاتين والإنزيمات الحيوانية في الأغذية والأدوية",
        "الضوابط الشرعية لاستخدام الذكاء الاصطناعي في البحث العلمي والعمل",
      ],
    },
  ],
};
