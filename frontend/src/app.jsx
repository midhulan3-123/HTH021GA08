import React, { useEffect, useState } from "react";
import "./index.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ்" },
  { code: "hi", name: "हिन्दी" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "bn", name: "বাংলা" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
];

const translations = {
  en: {
    intelligence: "FINANCIAL INTELLIGENCE",
    command: "Business Command Center",
    online: "AI ONLINE",
    ingestion: "DATA INGESTION",
    importLedger: "Import Your Business Data",
    description:
      "Upload your transaction CSV. WealthBridge will audit your business data and build your financial command center.",
    drop: "Drop your CSV here",
    browse: "Choose CSV",
    formats: "CSV • Maximum 10 MB",
    analyze: "Analyze Data →",
    demo: "Use Demo Data",
    pipeline: "DATA PIPELINE",
    import: "IMPORT",
    audit: "AUDIT",
    advise: "ADVISE",
    inflow: "Inflow",
    outflow: "Outflow",
    net: "Net",
    risk: "Risk",
    revenue: "Recorded revenue",
    spending: "Operational spending",
    cash: "Cash position",
    volatility: "Revenue volatility",
    signals: "AUDIT SIGNALS",
    anomalies: "Spending Anomalies",
    recurring: "Recurring Costs",
    scenario: "SCENARIO ENGINE",
    lab: "What-If Finance Lab",
    test: "Test expense reductions before making a decision.",
    savings: "PROJECTED SAVINGS",
    saas: "SaaS Reduction",
    contractor: "Contractor Reduction",
    current: "CURRENT NET",
    adjusted: "ADJUSTED NET",
    advisor: "AI Advisor",
    advisorText:
      "Grounded financial recommendations generated from your ledger.",
    generate: "Generate Advice →",
    language: "Language",
    secure: "🔒 Secure local analysis",
    overview: "Overview",
    transactions: "Transactions",
    cashflow: "Cash Flow",
    noTransactions: "No transaction data available.",
    transactionId: "Transaction ID",
    date: "Date",
    merchant: "Merchant",
    category: "Category",
    amount: "Amount",
    type: "Type",
    totalTransactions: "Total Transactions",
    cashflowTitle: "Cash Flow Analysis",
    cashflowText:
      "Review your recorded inflow, operational outflow and current net cash position.",
    advisorTitle: "AI Financial Advisor",
    whatifTitle: "What-If Finance Lab",
  },

  ta: {
    intelligence: "நிதி நுண்ணறிவு",
    command: "வணிக கட்டுப்பாட்டு மையம்",
    online: "AI இயங்குகிறது",
    ingestion: "தரவு உள்ளீடு",
    importLedger: "வணிக தரவை பதிவேற்றவும்",
    description:
      "உங்கள் பரிவர்த்தனை CSV கோப்பை பதிவேற்றவும். WealthBridge உங்கள் வணிக தரவை பகுப்பாய்வு செய்யும்.",
    drop: "உங்கள் CSV-ஐ இங்கே விடுங்கள்",
    browse: "CSV தேர்வு செய்க",
    formats: "CSV • அதிகபட்சம் 10 MB",
    analyze: "தரவை பகுப்பாய்வு செய்க →",
    demo: "Demo தரவை பயன்படுத்தவும்",
    pipeline: "தரவு செயல்முறை",
    import: "உள்ளீடு",
    audit: "தணிக்கை",
    advise: "ஆலோசனை",
    inflow: "வரவு",
    outflow: "செலவு",
    net: "நிகர",
    risk: "ஆபத்து",
    revenue: "பதிவான வருவாய்",
    spending: "செயல்பாட்டு செலவு",
    cash: "பண நிலை",
    volatility: "வருவாய் மாற்றம்",
    signals: "தணிக்கை குறியீடுகள்",
    anomalies: "அசாதாரண செலவுகள்",
    recurring: "தொடர்ச்சியான செலவுகள்",
    scenario: "சூழ்நிலை இயந்திரம்",
    lab: "What-If நிதி ஆய்வகம்",
    test: "முடிவு எடுப்பதற்கு முன் செலவு குறைப்புகளை சோதிக்கவும்.",
    savings: "எதிர்பார்க்கப்படும் சேமிப்பு",
    saas: "SaaS குறைப்பு",
    contractor: "ஒப்பந்ததாரர் குறைப்பு",
    current: "தற்போதைய நிகர",
    adjusted: "மாற்றியமைக்கப்பட்ட நிகர",
    advisor: "AI நிதி ஆலோசகர்",
    advisorText:
      "உங்கள் பரிவர்த்தனை தரவை அடிப்படையாகக் கொண்ட நிதி பரிந்துரைகள்.",
    generate: "ஆலோசனையை உருவாக்கு →",
    language: "மொழி",
    secure: "🔒 பாதுகாப்பான உள்ளூர் பகுப்பாய்வு",
    overview: "மேலோட்டம்",
    transactions: "பரிவர்த்தனைகள்",
    cashflow: "பணப்புழக்கம்",
    noTransactions: "பரிவர்த்தனை தரவு இல்லை.",
    transactionId: "பரிவர்த்தனை ID",
    date: "தேதி",
    merchant: "வணிகர்",
    category: "வகை",
    amount: "தொகை",
    type: "வகை",
    totalTransactions: "மொத்த பரிவர்த்தனைகள்",
    cashflowTitle: "பணப்புழக்க பகுப்பாய்வு",
    cashflowText:
      "வரவு, செலவு மற்றும் தற்போதைய நிகர பண நிலையை பார்க்கவும்.",
    advisorTitle: "AI நிதி ஆலோசகர்",
    whatifTitle: "What-If நிதி ஆய்வகம்",
  },

  hi: {
    intelligence: "वित्तीय बुद्धिमत्ता",
    command: "बिजनेस कमांड सेंटर",
    online: "AI ऑनलाइन",
    ingestion: "डेटा इनपुट",
    importLedger: "अपना बिजनेस डेटा अपलोड करें",
    description:
      "अपनी लेन-देन CSV अपलोड करें। WealthBridge आपके डेटा का विश्लेषण करेगा।",
    drop: "अपनी CSV यहां डालें",
    browse: "CSV चुनें",
    formats: "CSV • अधिकतम 10 MB",
    analyze: "डेटा का विश्लेषण करें →",
    demo: "डेमो डेटा इस्तेमाल करें",
    pipeline: "डेटा पाइपलाइन",
    import: "इम्पोर्ट",
    audit: "ऑडिट",
    advise: "सलाह",
    inflow: "आवक",
    outflow: "खर्च",
    net: "नेट",
    risk: "जोखिम",
    revenue: "रिकॉर्डेड राजस्व",
    spending: "परिचालन खर्च",
    cash: "कैश स्थिति",
    volatility: "राजस्व अस्थिरता",
    signals: "ऑडिट संकेत",
    anomalies: "असामान्य खर्च",
    recurring: "आवर्ती खर्च",
    scenario: "सिनेरियो इंजन",
    lab: "What-If वित्त लैब",
    test: "निर्णय लेने से पहले खर्च में कमी का परीक्षण करें।",
    savings: "अनुमानित बचत",
    saas: "SaaS कमी",
    contractor: "कॉन्ट्रैक्टर कमी",
    current: "वर्तमान नेट",
    adjusted: "समायोजित नेट",
    advisor: "AI सलाहकार",
    advisorText:
      "आपके लेन-देन डेटा से तैयार वित्तीय सुझाव।",
    generate: "सलाह बनाएं →",
    language: "भाषा",
    secure: "🔒 सुरक्षित स्थानीय विश्लेषण",
    overview: "ओवरव्यू",
    transactions: "लेन-देन",
    cashflow: "कैश फ्लो",
    noTransactions: "कोई लेन-देन डेटा उपलब्ध नहीं है।",
    transactionId: "लेन-देन ID",
    date: "तारीख",
    merchant: "व्यापारी",
    category: "श्रेणी",
    amount: "राशि",
    type: "प्रकार",
    totalTransactions: "कुल लेन-देन",
    cashflowTitle: "कैश फ्लो विश्लेषण",
    cashflowText:
      "आवक, खर्च और वर्तमान नेट कैश स्थिति देखें।",
    advisorTitle: "AI वित्तीय सलाहकार",
    whatifTitle: "What-If वित्त लैब",
  },

  te: {
    intelligence: "ఆర్థిక మేధస్సు",
    command: "బిజినెస్ కమాండ్ సెంటర్",
    online: "AI ఆన్‌లైన్",
    ingestion: "డేటా ఇన్‌పుట్",
    importLedger: "మీ వ్యాపార డేటాను అప్‌లోడ్ చేయండి",
    description:
      "మీ లావాదేవీల CSVని అప్‌లోడ్ చేయండి. WealthBridge మీ డేటాను విశ్లేషిస్తుంది.",
    drop: "మీ CSVని ఇక్కడ వదలండి",
    browse: "CSV ఎంచుకోండి",
    formats: "CSV • గరిష్టంగా 10 MB",
    analyze: "డేటాను విశ్లేషించండి →",
    demo: "డెమో డేటా ఉపయోగించండి",
    pipeline: "డేటా పైప్‌లైన్",
    import: "ఇంపోర్ట్",
    audit: "ఆడిట్",
    advise: "సలహా",
    inflow: "ఇన్‌ఫ్లో",
    outflow: "అవుట్‌ఫ్లో",
    net: "నెట్",
    risk: "రిస్క్",
    revenue: "రికార్డ్ చేసిన ఆదాయం",
    spending: "ఆపరేషనల్ ఖర్చు",
    cash: "క్యాష్ స్థితి",
    volatility: "ఆదాయ మార్పు",
    signals: "ఆడిట్ సంకేతాలు",
    anomalies: "అసాధారణ ఖర్చులు",
    recurring: "పునరావృత ఖర్చులు",
    scenario: "సినారియో ఇంజిన్",
    lab: "What-If ఫైనాన్స్ ల్యాబ్",
    test: "నిర్ణయం తీసుకునే ముందు ఖర్చు తగ్గింపులను పరీక్షించండి.",
    savings: "అంచనా పొదుపు",
    saas: "SaaS తగ్గింపు",
    contractor: "కాంట్రాక్టర్ తగ్గింపు",
    current: "ప్రస్తుత నెట్",
    adjusted: "సర్దుబాటు చేసిన నెట్",
    advisor: "AI ఆర్థిక సలహాదారు",
    advisorText:
      "మీ లావాదేవీ డేటా ఆధారంగా ఆర్థిక సూచనలు.",
    generate: "సలహా రూపొందించండి →",
    language: "భాష",
    secure: "🔒 సురక్షిత స్థానిక విశ్లేషణ",
    overview: "అవలోకనం",
    transactions: "లావాదేవీలు",
    cashflow: "క్యాష్ ఫ్లో",
    noTransactions: "లావాదేవీ డేటా లేదు.",
    transactionId: "లావాదేవీ ID",
    date: "తేదీ",
    merchant: "వ్యాపారి",
    category: "వర్గం",
    amount: "మొత్తం",
    type: "రకం",
    totalTransactions: "మొత్తం లావాదేవీలు",
    cashflowTitle: "క్యాష్ ఫ్లో విశ్లేషణ",
    cashflowText:
      "ఇన్‌ఫ్లో, అవుట్‌ఫ్లో మరియు నికర నగదు స్థితిని చూడండి.",
    advisorTitle: "AI ఆర్థిక సలహాదారు",
    whatifTitle: "What-If ఫైనాన్స్ ల్యాబ్",
  },

  ml: {
    intelligence: "സാമ്പത്തിക ഇന്റലിജൻസ്",
    command: "ബിസിനസ് കമാൻഡ് സെന്റർ",
    online: "AI ഓൺലൈൻ",
    ingestion: "ഡാറ്റ ഇൻപുട്ട്",
    importLedger: "ബിസിനസ് ഡാറ്റ അപ്‌ലോഡ് ചെയ്യുക",
    description:
      "നിങ്ങളുടെ ഇടപാട് CSV അപ്‌ലോഡ് ചെയ്യുക. WealthBridge ഡാറ്റ വിശകലനം ചെയ്യും.",
    drop: "CSV ഇവിടെ ഇടുക",
    browse: "CSV തിരഞ്ഞെടുക്കുക",
    formats: "CSV • പരമാവധി 10 MB",
    analyze: "ഡാറ്റ വിശകലനം ചെയ്യുക →",
    demo: "Demo ഡാറ്റ ഉപയോഗിക്കുക",
    pipeline: "ഡാറ്റ പൈപ്പ്‌ലൈൻ",
    import: "ഇംപോർട്ട്",
    audit: "ഓഡിറ്റ്",
    advise: "ഉപദേശം",
    inflow: "വരവ്",
    outflow: "ചെലവ്",
    net: "നെറ്റ്",
    risk: "റിസ്ക്",
    revenue: "രേഖപ്പെടുത്തിയ വരുമാനം",
    spending: "പ്രവർത്തന ചെലവ്",
    cash: "ക്യാഷ് സ്ഥിതി",
    volatility: "വരുമാന വ്യതിയാനം",
    signals: "ഓഡിറ്റ് സിഗ്നലുകൾ",
    anomalies: "അസാധാരണ ചെലവുകൾ",
    recurring: "ആവർത്തിക്കുന്ന ചെലവുകൾ",
    scenario: "സിനാരിയോ എൻജിൻ",
    lab: "What-If ഫിനാൻസ് ലാബ്",
    test: "തീരുമാനം എടുക്കുന്നതിന് മുമ്പ് ചെലവ് കുറയ്ക്കലുകൾ പരീക്ഷിക്കുക.",
    savings: "പ്രതീക്ഷിക്കുന്ന ലാഭം",
    saas: "SaaS കുറവ്",
    contractor: "കോൺട്രാക്ടർ കുറവ്",
    current: "നിലവിലെ നെറ്റ്",
    adjusted: "ക്രമീകരിച്ച നെറ്റ്",
    advisor: "AI സാമ്പത്തിക ഉപദേഷ്ടാവ്",
    advisorText:
      "നിങ്ങളുടെ ഇടപാട് ഡാറ്റയിൽ നിന്നുള്ള സാമ്പത്തിക നിർദ്ദേശങ്ങൾ.",
    generate: "ഉപദേശം സൃഷ്ടിക്കുക →",
    language: "ഭാഷ",
    secure: "🔒 സുരക്ഷിത പ്രാദേശിക വിശകലനം",
    overview: "അവലോകനം",
    transactions: "ഇടപാടുകൾ",
    cashflow: "ക്യാഷ് ഫ്ലോ",
    noTransactions: "ഇടപാട് ഡാറ്റ ലഭ്യമല്ല.",
    transactionId: "ഇടപാട് ID",
    date: "തീയതി",
    merchant: "വ്യാപാരി",
    category: "വിഭാഗം",
    amount: "തുക",
    type: "തരം",
    totalTransactions: "മൊത്തം ഇടപാടുകൾ",
    cashflowTitle: "ക്യാഷ് ഫ്ലോ വിശകലനം",
    cashflowText:
      "വരവ്, ചെലവ്, നിലവിലെ നെറ്റ് ക്യാഷ് സ്ഥിതി പരിശോധിക്കുക.",
    advisorTitle: "AI സാമ്പത്തിക ഉപദേഷ്ടാവ്",
    whatifTitle: "What-If ഫിനാൻസ് ലാബ്",
  },

  kn: {
    intelligence: "ಹಣಕಾಸು ಬುದ್ಧಿಮತ್ತೆ",
    command: "ವ್ಯಾಪಾರ ಕಮಾಂಡ್ ಸೆಂಟರ್",
    online: "AI ಆನ್‌ಲೈನ್",
    ingestion: "ಡೇಟಾ ಇನ್‌ಪುಟ್",
    importLedger: "ವ್ಯಾಪಾರ ಡೇಟಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    description:
      "ನಿಮ್ಮ ವ್ಯವಹಾರದ CSV ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. WealthBridge ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.",
    drop: "CSV ಇಲ್ಲಿ ಬಿಡಿ",
    browse: "CSV ಆಯ್ಕೆಮಾಡಿ",
    formats: "CSV • ಗರಿಷ್ಠ 10 MB",
    analyze: "ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಿ →",
    demo: "Demo ಡೇಟಾ ಬಳಸಿ",
    pipeline: "ಡೇಟಾ ಪೈಪ್‌ಲೈನ್",
    import: "ಇಂಪೋರ್ಟ್",
    audit: "ಆಡಿಟ್",
    advise: "ಸಲಹೆ",
    inflow: "ಒಳಹರಿವು",
    outflow: "ಹೊರಹರಿವು",
    net: "ನೆಟ್",
    risk: "ಅಪಾಯ",
    revenue: "ದಾಖಲಾದ ಆದಾಯ",
    spending: "ಕಾರ್ಯಾಚರಣಾ ವೆಚ್ಚ",
    cash: "ನಗದು ಸ್ಥಿತಿ",
    volatility: "ಆದಾಯ ಬದಲಾವಣೆ",
    signals: "ಆಡಿಟ್ ಸಂಕೇತಗಳು",
    anomalies: "ಅಸಾಮಾನ್ಯ ವೆಚ್ಚಗಳು",
    recurring: "ಪುನರಾವರ್ತಿತ ವೆಚ್ಚಗಳು",
    scenario: "ಸನ್ನಿವೇಶ ಎಂಜಿನ್",
    lab: "What-If ಹಣಕಾಸು ಲ್ಯಾಬ್",
    test: "ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ವೆಚ್ಚ ಕಡಿತಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
    savings: "ಅಂದಾಜು ಉಳಿತಾಯ",
    saas: "SaaS ಕಡಿತ",
    contractor: "ಕಾಂಟ್ರಾಕ್ಟರ್ ಕಡಿತ",
    current: "ಪ್ರಸ್ತುತ ನೆಟ್",
    adjusted: "ಹೊಂದಿಸಿದ ನೆಟ್",
    advisor: "AI ಹಣಕಾಸು ಸಲಹೆಗಾರ",
    advisorText:
      "ನಿಮ್ಮ ವಹಿವಾಟು ಡೇಟಾದ ಆಧಾರದ ಮೇಲೆ ಹಣಕಾಸು ಸಲಹೆಗಳು.",
    generate: "ಸಲಹೆ ರಚಿಸಿ →",
    language: "ಭಾಷೆ",
    secure: "🔒 ಸುರಕ್ಷಿತ ಸ್ಥಳೀಯ ವಿಶ್ಲೇಷಣೆ",
    overview: "ಅವಲೋಕನ",
    transactions: "ವಹಿವಾಟುಗಳು",
    cashflow: "ಕ್ಯಾಶ್ ಫ್ಲೋ",
    noTransactions: "ವಹಿವಾಟು ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.",
    transactionId: "ವಹಿವಾಟು ID",
    date: "ದಿನಾಂಕ",
    merchant: "ವ್ಯಾಪಾರಿ",
    category: "ವರ್ಗ",
    amount: "ಮೊತ್ತ",
    type: "ಪ್ರಕಾರ",
    totalTransactions: "ಒಟ್ಟು ವಹಿವಾಟುಗಳು",
    cashflowTitle: "ಕ್ಯಾಶ್ ಫ್ಲೋ ವಿಶ್ಲೇಷಣೆ",
    cashflowText:
      "ಒಳಹರಿವು, ಹೊರಹರಿವು ಮತ್ತು ಪ್ರಸ್ತುತ ನೆಟ್ ನಗದು ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
    advisorTitle: "AI ಹಣಕಾಸು ಸಲಹೆಗಾರ",
    whatifTitle: "What-If ಹಣಕಾಸು ಲ್ಯಾಬ್",
  },

  bn: {
    intelligence: "আর্থিক বুদ্ধিমত্তা",
    command: "বিজনেস কমান্ড সেন্টার",
    online: "AI অনলাইন",
    ingestion: "ডেটা ইনপুট",
    importLedger: "আপনার ব্যবসার ডেটা আপলোড করুন",
    description:
      "আপনার লেনদেনের CSV আপলোড করুন। WealthBridge আপনার ডেটা বিশ্লেষণ করবে।",
    drop: "আপনার CSV এখানে রাখুন",
    browse: "CSV নির্বাচন করুন",
    formats: "CSV • সর্বোচ্চ 10 MB",
    analyze: "ডেটা বিশ্লেষণ করুন →",
    demo: "ডেমো ডেটা ব্যবহার করুন",
    pipeline: "ডেটা পাইপলাইন",
    import: "ইমপোর্ট",
    audit: "অডিট",
    advise: "পরামর্শ",
    inflow: "ইনফ্লো",
    outflow: "আউটফ্লো",
    net: "নেট",
    risk: "ঝুঁকি",
    revenue: "রেকর্ড করা রাজস্ব",
    spending: "অপারেশনাল খরচ",
    cash: "ক্যাশ অবস্থা",
    volatility: "রাজস্ব পরিবর্তন",
    signals: "অডিট সংকেত",
    anomalies: "অস্বাভাবিক খরচ",
    recurring: "পুনরাবৃত্ত খরচ",
    scenario: "সিনারিও ইঞ্জিন",
    lab: "What-If ফাইন্যান্স ল্যাব",
    test: "সিদ্ধান্ত নেওয়ার আগে খরচ কমানোর পরীক্ষা করুন।",
    savings: "প্রত্যাশিত সঞ্চয়",
    saas: "SaaS হ্রাস",
    contractor: "কন্ট্রাক্টর হ্রাস",
    current: "বর্তমান নেট",
    adjusted: "সমন্বয়কৃত নেট",
    advisor: "AI আর্থিক উপদেষ্টা",
    advisorText:
      "আপনার লেনদেন ডেটার ভিত্তিতে আর্থিক পরামর্শ।",
    generate: "পরামর্শ তৈরি করুন →",
    language: "ভাষা",
    secure: "🔒 নিরাপদ স্থানীয় বিশ্লেষণ",
    overview: "ওভারভিউ",
    transactions: "লেনদেন",
    cashflow: "ক্যাশ ফ্লো",
    noTransactions: "কোনো লেনদেন ডেটা নেই।",
    transactionId: "লেনদেন ID",
    date: "তারিখ",
    merchant: "ব্যবসায়ী",
    category: "বিভাগ",
    amount: "পরিমাণ",
    type: "ধরন",
    totalTransactions: "মোট লেনদেন",
    cashflowTitle: "ক্যাশ ফ্লো বিশ্লেষণ",
    cashflowText:
      "ইনফ্লো, আউটফ্লো এবং বর্তমান নেট ক্যাশ অবস্থান দেখুন।",
    advisorTitle: "AI আর্থিক উপদেষ্টা",
    whatifTitle: "What-If ফাইন্যান্স ল্যাব",
  },

  fr: {
    intelligence: "INTELLIGENCE FINANCIÈRE",
    command: "Centre de Commande Business",
    online: "IA EN LIGNE",
    ingestion: "IMPORTATION DES DONNÉES",
    importLedger: "Importer vos données",
    description:
      "Importez votre fichier CSV de transactions. WealthBridge analysera vos données.",
    drop: "Déposez votre CSV ici",
    browse: "Choisir un CSV",
    formats: "CSV • Maximum 10 Mo",
    analyze: "Analyser →",
    demo: "Utiliser les données démo",
    pipeline: "PIPELINE DE DONNÉES",
    import: "IMPORT",
    audit: "AUDIT",
    advise: "CONSEIL",
    inflow: "Entrées",
    outflow: "Sorties",
    net: "Net",
    risk: "Risque",
    revenue: "Revenus enregistrés",
    spending: "Dépenses opérationnelles",
    cash: "Position de trésorerie",
    volatility: "Volatilité des revenus",
    signals: "SIGNAUX D’AUDIT",
    anomalies: "Anomalies de dépenses",
    recurring: "Coûts récurrents",
    scenario: "MOTEUR DE SCÉNARIOS",
    lab: "Laboratoire financier What-If",
    test: "Testez les réductions de dépenses avant de décider.",
    savings: "ÉCONOMIES PROJETÉES",
    saas: "Réduction SaaS",
    contractor: "Réduction sous-traitants",
    current: "NET ACTUEL",
    adjusted: "NET AJUSTÉ",
    advisor: "Conseiller IA",
    advisorText:
      "Recommandations financières basées sur vos données.",
    generate: "Générer les conseils →",
    language: "Langue",
    secure: "🔒 Analyse locale sécurisée",
    overview: "Vue d’ensemble",
    transactions: "Transactions",
    cashflow: "Flux de trésorerie",
    noTransactions: "Aucune donnée de transaction.",
    transactionId: "ID transaction",
    date: "Date",
    merchant: "Marchand",
    category: "Catégorie",
    amount: "Montant",
    type: "Type",
    totalTransactions: "Total transactions",
    cashflowTitle: "Analyse des flux",
    cashflowText:
      "Consultez les entrées, sorties et la position nette.",
    advisorTitle: "Conseiller financier IA",
    whatifTitle: "Laboratoire financier What-If",
  },

  es: {
    intelligence: "INTELIGENCIA FINANCIERA",
    command: "Centro de Comando Empresarial",
    online: "IA EN LÍNEA",
    ingestion: "INGESTA DE DATOS",
    importLedger: "Importa tus datos",
    description:
      "Sube tu CSV de transacciones. WealthBridge analizará tus datos.",
    drop: "Suelta tu CSV aquí",
    browse: "Elegir CSV",
    formats: "CSV • Máximo 10 MB",
    analyze: "Analizar →",
    demo: "Usar datos demo",
    pipeline: "FLUJO DE DATOS",
    import: "IMPORTAR",
    audit: "AUDITAR",
    advise: "ASESORAR",
    inflow: "Entrada",
    outflow: "Salida",
    net: "Neto",
    risk: "Riesgo",
    revenue: "Ingresos registrados",
    spending: "Gasto operativo",
    cash: "Posición de efectivo",
    volatility: "Volatilidad de ingresos",
    signals: "SEÑALES DE AUDITORÍA",
    anomalies: "Anomalías de gasto",
    recurring: "Costos recurrentes",
    scenario: "MOTOR DE ESCENARIOS",
    lab: "Laboratorio financiero What-If",
    test: "Prueba reducciones de gastos antes de decidir.",
    savings: "AHORRO PROYECTADO",
    saas: "Reducción SaaS",
    contractor: "Reducción de contratistas",
    current: "NETO ACTUAL",
    adjusted: "NETO AJUSTADO",
    advisor: "Asesor IA",
    advisorText:
      "Recomendaciones financieras basadas en tus datos.",
    generate: "Generar consejos →",
    language: "Idioma",
    secure: "🔒 Análisis local seguro",
    overview: "Resumen",
    transactions: "Transacciones",
    cashflow: "Flujo de caja",
    noTransactions: "No hay datos de transacciones.",
    transactionId: "ID de transacción",
    date: "Fecha",
    merchant: "Comerciante",
    category: "Categoría",
    amount: "Importe",
    type: "Tipo",
    totalTransactions: "Total de transacciones",
    cashflowTitle: "Análisis de flujo de caja",
    cashflowText:
      "Revisa entradas, salidas y posición neta de efectivo.",
    advisorTitle: "Asesor financiero IA",
    whatifTitle: "Laboratorio financiero What-If",
  },

  de: {
    intelligence: "FINANZINTELLIGENZ",
    command: "Business Command Center",
    online: "KI ONLINE",
    ingestion: "DATENIMPORT",
    importLedger: "Geschäftsdaten importieren",
    description:
      "Laden Sie Ihre Transaktions-CSV hoch. WealthBridge analysiert Ihre Daten.",
    drop: "CSV hier ablegen",
    browse: "CSV auswählen",
    formats: "CSV • Maximal 10 MB",
    analyze: "Daten analysieren →",
    demo: "Demodaten verwenden",
    pipeline: "DATENPIPELINE",
    import: "IMPORT",
    audit: "AUDIT",
    advise: "BERATUNG",
    inflow: "Zufluss",
    outflow: "Abfluss",
    net: "Netto",
    risk: "Risiko",
    revenue: "Erfasster Umsatz",
    spending: "Betriebsausgaben",
    cash: "Liquidität",
    volatility: "Umsatzvolatilität",
    signals: "AUDIT-SIGNALE",
    anomalies: "Ausgabenanomalien",
    recurring: "Wiederkehrende Kosten",
    scenario: "SZENARIO-ENGINE",
    lab: "What-If Finanzlabor",
    test: "Testen Sie Ausgabensenkungen vor einer Entscheidung.",
    savings: "PROGNOSTIZIERTE EINSPARUNGEN",
    saas: "SaaS-Reduktion",
    contractor: "Dienstleister-Reduktion",
    current: "AKTUELLES NETTO",
    adjusted: "ANGEPASSTES NETTO",
    advisor: "KI-Berater",
    advisorText:
      "Finanzempfehlungen auf Basis Ihrer Daten.",
    generate: "Beratung erstellen →",
    language: "Sprache",
    secure: "🔒 Sichere lokale Analyse",
    overview: "Übersicht",
    transactions: "Transaktionen",
    cashflow: "Cashflow",
    noTransactions: "Keine Transaktionsdaten verfügbar.",
    transactionId: "Transaktions-ID",
    date: "Datum",
    merchant: "Händler",
    category: "Kategorie",
    amount: "Betrag",
    type: "Typ",
    totalTransactions: "Transaktionen gesamt",
    cashflowTitle: "Cashflow-Analyse",
    cashflowText:
      "Überprüfen Sie Zu- und Abflüsse sowie die aktuelle Netto-Liquidität.",
    advisorTitle: "KI-Finanzberater",
    whatifTitle: "What-If Finanzlabor",
  },

  ja: {
    intelligence: "財務インテリジェンス",
    command: "ビジネスコマンドセンター",
    online: "AI オンライン",
    ingestion: "データ入力",
    importLedger: "ビジネスデータをアップロード",
    description:
      "取引CSVをアップロードしてください。WealthBridgeがデータを分析します。",
    drop: "CSVをここにドロップ",
    browse: "CSVを選択",
    formats: "CSV • 最大10 MB",
    analyze: "データを分析 →",
    demo: "デモデータを使用",
    pipeline: "データパイプライン",
    import: "インポート",
    audit: "監査",
    advise: "アドバイス",
    inflow: "流入",
    outflow: "流出",
    net: "純額",
    risk: "リスク",
    revenue: "記録された収益",
    spending: "運用支出",
    cash: "キャッシュポジション",
    volatility: "収益変動",
    signals: "監査シグナル",
    anomalies: "異常支出",
    recurring: "継続コスト",
    scenario: "シナリオエンジン",
    lab: "What-If ファイナンスラボ",
    test: "意思決定前にコスト削減をテストします。",
    savings: "予測節約額",
    saas: "SaaS削減",
    contractor: "請負業者削減",
    current: "現在の純額",
    adjusted: "調整後純額",
    advisor: "AI財務アドバイザー",
    advisorText:
      "取引データに基づいた財務アドバイス。",
    generate: "アドバイスを生成 →",
    language: "言語",
    secure: "🔒 安全なローカル分析",
    overview: "概要",
    transactions: "取引",
    cashflow: "キャッシュフロー",
    noTransactions: "取引データがありません。",
    transactionId: "取引ID",
    date: "日付",
    merchant: "加盟店",
    category: "カテゴリ",
    amount: "金額",
    type: "タイプ",
    totalTransactions: "取引総数",
    cashflowTitle: "キャッシュフロー分析",
    cashflowText:
      "流入、流出、現在の純キャッシュポジションを確認します。",
    advisorTitle: "AI財務アドバイザー",
    whatifTitle: "What-If ファイナンスラボ",
  },
};

export default function App() {
  const [audit, setAudit] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [plan, setPlan] = useState("");

  const [language, setLanguage] = useState("en");
  const [activePage, setActivePage] = useState("overview");

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [saasCut, setSaasCut] = useState(15);
  const [contractorCut, setContractorCut] = useState(10);
  const [simulation, setSimulation] = useState(null);

  const [error, setError] = useState("");

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadAudit();
    loadTransactions();
  }, []);

  const loadAudit = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/audit`);

      if (!response.ok) {
        throw new Error("Backend is not running.");
      }

      const data = await response.json();
      setAudit(data);

      await runWhatIf(15, 10);
    } catch (err) {
      console.error(err);
      setError(
        "Backend connection failed. Start FastAPI on port 8000."
      );
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/transactions`
      );

      if (!response.ok) return;

      const data = await response.json();

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Transaction loading error:", err);
    }
  };

  const goToPage = (page) => {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const detectFileType = (file) => {
    if (!file) return null;

    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (ext === "csv") return "csv";

    if (
      ["jpg", "jpeg", "png", "webp"].includes(ext)
    ) {
      return "image";
    }

    if (
      ["mp3", "wav", "m4a"].includes(ext)
    ) {
      return "audio";
    }

    return null;
  };

  const validateFile = (file) => {
    if (!file) return false;

    const type = detectFileType(file);

    if (!type) {
      setError(
        "Unsupported file. Please use CSV, JPG, PNG, WEBP, MP3, WAV or M4A."
      );
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Maximum file size is 10 MB.");
      return false;
    }

    setError("");

    setSelectedFile(file);
    setFileType(type);

    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    validateFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    validateFile(file);
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        `${BACKEND_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "File analysis failed."
        );
      }

      if (data.audit) {
        setAudit(data.audit);
      }

      if (data.transactions) {
        setTransactions(data.transactions);
      } else {
        await loadTransactions();
      }

      setActivePage("overview");

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to analyze the uploaded file."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDemoData = async () => {
    try {
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/regenerate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Demo data failed.");
      }

      await loadAudit();
      await loadTransactions();

      setSelectedFile(null);
      setFileType("");
      setActivePage("overview");

    } catch (err) {
      setError(err.message);
    }
  };

  const runWhatIf = async (
    saasValue,
    contractorValue
  ) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/what-if`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            saas_reduction_pct:
              Number(saasValue),

            contractor_reduction_pct:
              Number(contractorValue),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("What-If analysis failed.");
      }

      const data = await response.json();

      setSimulation(data);
    } catch (err) {
      console.error(err);
    }
  };

  const changeSaas = (value) => {
    const newValue = Number(value);

    setSaasCut(newValue);

    runWhatIf(
      newValue,
      contractorCut
    );
  };

  const changeContractor = (value) => {
    const newValue = Number(value);

    setContractorCut(newValue);

    runWhatIf(
      saasCut,
      newValue
    );
  };

  const generateAdvice = async () => {
    setLoadingPlan(true);
    setError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/generate-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not generate advice."
        );
      }

      setPlan(data.plan || "");

    } catch (err) {
      console.error(err);

      setError(
        err.message || "AI advice failed."
      );
    } finally {
      setLoadingPlan(false);
    }
  };

  const money = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const riskClass =
    audit?.revenue_volatility?.includes("High")
      ? "risk-high"
      : "risk-low";

  const renderUpload = () => (
    <section className="upload-card">

      <div>

        <div className="section-tag">
          {t.ingestion}
        </div>

        <h2>{t.importLedger}</h2>

        <p>{t.description}</p>

        <div
          className={`drop-zone ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() =>
            setDragging(false)
          }
          onDrop={handleDrop}
        >

          <div className="upload-icon">
            ↑
          </div>

          <div className="drop-title">
            {t.drop}
          </div>

          <div className="drop-sub">
            or browse files
          </div>

          <label
            htmlFor="file-upload"
            className="browse-button"
          >
            {t.browse}
          </label>

          <input
            id="file-upload"
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileChange}
          />

          <div className="file-info">
            {t.formats}
          </div>

        </div>

        {selectedFile && (
          <div className="selected-file">

            <div className="selected-file-icon">
              📊
            </div>

            <div className="selected-file-details">

              <strong>
                {selectedFile.name}
              </strong>

              <small>
                CSV •{" "}
                {(
                  selectedFile.size / 1024
                ).toFixed(1)}
                {" KB"}
              </small>

            </div>

            <button
              className="remove-file"
              onClick={() => {
                setSelectedFile(null);
                setFileType("");
              }}
            >
              ×
            </button>

          </div>
        )}

        <div className="upload-actions">

          <button
            className="primary-button"
            disabled={
              !selectedFile ||
              uploading
            }
            onClick={
              handleAnalyzeFile
            }
          >
            {uploading
              ? "ANALYZING..."
              : t.analyze}
          </button>

          <button
            className="secondary-button"
            onClick={
              handleDemoData
            }
          >
            {t.demo}
          </button>

        </div>

      </div>

      <div className="upload-preview">

        <div className="preview-title">
          {t.pipeline}
        </div>

        <div className="pipeline">

          <div className="pipeline-step">
            <span>01</span>
            <strong>{t.import}</strong>
            <small>CSV ledger</small>
          </div>

          <div className="pipeline-line" />

          <div className="pipeline-step">
            <span>02</span>
            <strong>{t.audit}</strong>
            <small>Patterns</small>
          </div>

          <div className="pipeline-line" />

          <div className="pipeline-step">
            <span>03</span>
            <strong>{t.advise}</strong>
            <small>AI insights</small>
          </div>

        </div>

      </div>

    </section>
  );

  const renderKpis = () => {
    if (!audit) return null;

    return (
      <section className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-label">
            ↑ {t.inflow}
          </div>

          <div className="kpi-value">
            {money(audit.total_inflow)}
          </div>

          <div className="kpi-meta">
            {t.revenue}
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-label">
            ↓ {t.outflow}
          </div>

          <div className="kpi-value">
            {money(audit.total_outflow)}
          </div>

          <div className="kpi-meta">
            {t.spending}
          </div>

        </div>

        <div className="kpi-card highlight">

          <div className="kpi-label">
            ◆ {t.net}
          </div>

          <div className="kpi-value">
            {money(audit.net_cash_flow)}
          </div>

          <div className="kpi-meta">
            {t.cash}
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-label">
            ! {t.risk}
          </div>

          <div
            className={`risk-value ${riskClass}`}
          >
            {audit.revenue_volatility?.includes(
              "High"
            )
              ? "HIGH"
              : "STABLE"}
          </div>

          <div className="kpi-meta">
            {t.volatility}
          </div>

        </div>

      </section>
    );
  };

  const renderAuditSignals = () => {
    if (!audit) return null;

    return (
      <section className="analysis-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-kicker">
                {t.signals}
              </div>

              <h3>
                {t.anomalies}
              </h3>
            </div>

            <div className="count-badge">
              {audit.anomalies?.length || 0}
            </div>

          </div>

          <div className="anomaly-list">

            {(audit.anomalies || [])
              .slice(0, 8)
              .map((item, index) => (

                <div
                  className="anomaly-item"
                  key={
                    item.tx_id || index
                  }
                >

                  <div className="warning-icon">
                    !
                  </div>

                  <div className="anomaly-main">

                    <strong>
                      {item.merchant}
                    </strong>

                    <span>
                      {item.tx_id}
                    </span>

                  </div>

                  <div className="anomaly-amount">
                    {money(item.amount)}
                  </div>

                </div>

              ))}

            {(!audit.anomalies ||
              audit.anomalies.length === 0) && (
              <div className="empty-state">
                No major anomalies detected.
              </div>
            )}

          </div>

        </div>

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-kicker">
                FIXED COMMITMENTS
              </div>

              <h3>
                {t.recurring}
              </h3>
            </div>

            <div className="count-badge">
              {audit.recurring_charges?.length || 0}
            </div>

          </div>

          <div className="recurring-list">

            {(audit.recurring_charges || [])
              .slice(0, 8)
              .map((item, index) => (

                <div
                  className="recurring-item"
                  key={
                    item.merchant || index
                  }
                >

                  <div className="merchant-icon">
                    $
                  </div>

                  <div className="recurring-main">

                    <strong>
                      {item.merchant}
                    </strong>

                    <span>
                      {item.category}
                    </span>

                  </div>

                  <div className="recurring-price">

                    {money(item.monthly_avg)}

                    <small>
                      /month
                    </small>

                  </div>

                </div>

              ))}

          </div>

        </div>

      </section>
    );
  };

  const renderTransactions = () => (
    <section className="panel transactions-panel">

      <div className="panel-header">

        <div>
          <div className="panel-kicker">
            DATA LEDGER
          </div>

          <h3>
            {t.transactions}
          </h3>
        </div>

        <div className="count-badge">
          {transactions.length}
        </div>

      </div>

      {transactions.length === 0 ? (

        <div className="empty-state">
          {t.noTransactions}
        </div>

      ) : (

        <div className="transaction-table-wrap">

          <table className="transaction-table">

            <thead>
              <tr>
                <th>{t.transactionId}</th>
                <th>{t.date}</th>
                <th>{t.merchant}</th>
                <th>{t.category}</th>
                <th>{t.amount}</th>
                <th>{t.type}</th>
              </tr>
            </thead>

            <tbody>

              {transactions
                .slice(0, 100)
                .map((item, index) => (

                  <tr
                    key={
                      item.tx_id || index
                    }
                  >

                    <td>
                      {item.tx_id || "-"}
                    </td>

                    <td>
                      {item.date || "-"}
                    </td>

                    <td>
                      {item.merchant || "-"}
                    </td>

                    <td>
                      {item.category || "-"}
                    </td>

                    <td
                      className={
                        Number(item.amount) >= 0
                          ? "amount-positive"
                          : "amount-negative"
                      }
                    >
                      {money(item.amount)}
                    </td>

                    <td>
                      {item.type || "-"}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );

  const renderCashFlow = () => (
    <>

      <div className="page-intro">

        <div className="section-tag">
          CASH FLOW
        </div>

        <h2>
          {t.cashflowTitle}
        </h2>

        <p>
          {t.cashflowText}
        </p>

      </div>

      {renderKpis()}

      {audit && (
        <section className="panel cashflow-panel">

          <div className="panel-header">

            <div>
              <div className="panel-kicker">
                CASH POSITION
              </div>

              <h3>
                Financial Summary
              </h3>
            </div>

          </div>

          <div className="cashflow-summary">

            <div>
              <span>Inflow</span>
              <strong>
                {money(audit.total_inflow)}
              </strong>
            </div>

            <div>
              <span>Outflow</span>
              <strong>
                {money(audit.total_outflow)}
              </strong>
            </div>

            <div>
              <span>Net Cash Flow</span>
              <strong>
                {money(audit.net_cash_flow)}
              </strong>
            </div>

            <div>
              <span>Revenue Pattern</span>
              <strong>
                {audit.revenue_volatility}
              </strong>
            </div>

          </div>

        </section>
      )}

    </>
  );

  const renderWhatIf = () => (
    <section className="finance-lab">

      <div className="lab-heading">

        <div>

          <div className="section-tag">
            {t.scenario}
          </div>

          <h2>{t.whatifTitle}</h2>

          <p>{t.test}</p>

        </div>

        <div className="simulation-result">

          <span>
            {t.savings}
          </span>

          <strong>
            {money(
              simulation?.projected_savings
            )}
          </strong>

        </div>

      </div>

      <div className="sliders">

        <div className="slider-row">

          <div className="slider-info">

            <span>
              {t.saas}
            </span>

            <strong>
              {saasCut}%
            </strong>

          </div>

          <input
            type="range"
            min="0"
            max="50"
            value={saasCut}
            onChange={(e) =>
              changeSaas(e.target.value)
            }
          />

        </div>

        <div className="slider-row">

          <div className="slider-info">

            <span>
              {t.contractor}
            </span>

            <strong>
              {contractorCut}%
            </strong>

          </div>

          <input
            type="range"
            min="0"
            max="50"
            value={contractorCut}
            onChange={(e) =>
              changeContractor(
                e.target.value
              )
            }
          />

        </div>

      </div>

      <div className="scenario-bottom">

        <div className="scenario-stat">

          <span>
            {t.current}
          </span>

          <strong>
            {money(
              simulation?.original_net
            )}
          </strong>

        </div>

        <div className="scenario-arrow">
          →
        </div>

        <div className="scenario-stat positive">

          <span>
            {t.adjusted}
          </span>

          <strong>
            {money(
              simulation?.adjusted_net
            )}
          </strong>

        </div>

      </div>

    </section>
  );

  const renderAdvisor = () => (
    <section className="advisor-panel">

      <div className="advisor-header">

        <div>

          <div className="advisor-symbol">
            ✦
          </div>

          <div className="section-tag">
            {t.intelligence}
          </div>

          <h2>
            {t.advisorTitle}
          </h2>

          <p>
            {t.advisorText}
          </p>

        </div>

        <button
          className="generate-button"
          onClick={generateAdvice}
          disabled={loadingPlan}
        >
          {loadingPlan
            ? "GENERATING..."
            : t.generate}
        </button>

      </div>

      {plan && (
        <div className="advice-box">

          <div className="advice-language">
            {
              LANGUAGES.find(
                (x) =>
                  x.code === language
              )?.name
            }
          </div>

          <div className="advice-text">
            {plan}
          </div>

        </div>
      )}

    </section>
  );

  const renderOverview = () => (
    <>

      {renderUpload()}

      {renderKpis()}

      {renderAuditSignals()}

      {renderWhatIf()}

      {renderAdvisor()}

    </>
  );

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            W
          </div>

          <div>

            <div className="brand-name">
              WealthBridge
            </div>

            <div className="brand-sub">
              SME FINANCIAL AI
            </div>

          </div>

        </div>

        <div className="online-status">

          <span className="online-dot" />

          AI ENGINE ONLINE

        </div>

        <nav className="side-nav">

          <button
            className={`nav-item ${
              activePage === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToPage("overview")
            }
          >
            <span>◈</span>
            {t.overview}
          </button>

          <button
            className={`nav-item ${
              activePage === "transactions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToPage("transactions")
            }
          >
            <span>◫</span>
            {t.transactions}
          </button>

          <button
            className={`nav-item ${
              activePage === "cashflow"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToPage("cashflow")
            }
          >
            <span>◉</span>
            {t.cashflow}
          </button>

          <button
            className={`nav-item ${
              activePage === "advisor"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToPage("advisor")
            }
          >
            <span>◇</span>
            {t.advisor}
          </button>

          <button
            className={`nav-item ${
              activePage === "whatif"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToPage("whatif")
            }
          >
            <span>◎</span>
            What-If
          </button>

        </nav>

        <div className="sidebar-footer">

          <div className="language-title">
            {t.language}
          </div>

          <select
            className="language-select"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
          >

            {LANGUAGES.map((item) => (

              <option
                key={item.code}
                value={item.code}
              >
                {item.name}
              </option>

            ))}

          </select>

          <div className="security">
            {t.secure}
          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="eyebrow">
              {t.intelligence}
            </div>

            <h1>
              {t.command}
            </h1>

          </div>

          <div className="top-status">

            <span className="pulse" />

            {t.online}

          </div>

        </header>


        {error && (
          <div className="error-banner">

            <span>⚠</span>

            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}


        {/* PAGE CONTENT */}

        {activePage === "overview" && (
          renderOverview()
        )}

        {activePage === "transactions" && (
          <>
            <div className="page-intro">

              <div className="section-tag">
                DATA LEDGER
              </div>

              <h2>
                {t.transactions}
              </h2>

              <p>
                {t.totalTransactions}:{" "}
                <strong>
                  {transactions.length}
                </strong>
              </p>

            </div>

            {renderTransactions()}
          </>
        )}

        {activePage === "cashflow" && (
          renderCashFlow()
        )}

        {activePage === "advisor" && (
          renderAdvisor()
        )}

        {activePage === "whatif" && (
          renderWhatIf()
        )}


        <footer className="dashboard-footer">

          <span>
            WEALTHBRIDGE / SME FINANCIAL
            INTELLIGENCE
          </span>

          <span>
            MULTIMODAL DATA ENGINE
          </span>

        </footer>

      </main>

    </div>
  );
}