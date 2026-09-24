import React, { useState, useEffect } from "react";
import "./App.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Tamil", label: "தமிழ்" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Telugu", label: "తెలుగు" },
  { value: "Malayalam", label: "മലയാളം" },
  { value: "Kannada", label: "ಕನ್ನಡ" },
  { value: "Bengali", label: "বাংলা" },
  { value: "French", label: "Français" },
  { value: "Spanish", label: "Español" },
  { value: "German", label: "Deutsch" },
  { value: "Japanese", label: "日本語" },
];

const UI_TEXT = {
  English: {
    overview: "Overview",
    transactions: "Transactions",
    cashFlow: "Cash Flow",
    advisor: "AI Advisor",
    whatIf: "What-If",
    commandCenter: "Business Command Center",
    importLedger: "Import Your Business Ledger",
    chooseCsv: "Choose CSV",
    analyze: "Analyze Data",
    inflow: "Inflow",
    outflow: "Outflow",
    net: "Net",
    risk: "Risk",
    anomalies: "Spending Anomalies",
    recurring: "Recurring Costs",
    financeLab: "What-If Finance Lab",
    saas: "SaaS Reduction",
    contractor: "Contractor Reduction",
    generate: "Generate Advice",
    online: "AI Engine Online",
    upload: "Upload CSV",
    noFile: "No file selected",
    demo: "Use Demo Data",
    language: "Language",
    transactionsCount: "transactions",
    analyzing: "Analyzing...",
    loading: "Loading...",
  },

  Tamil: {
    overview: "மேலோட்டம்",
    transactions: "பரிவர்த்தனைகள்",
    cashFlow: "பணப்புழக்கம்",
    advisor: "AI ஆலோசகர்",
    whatIf: "என்ன ஆகும்?",
    commandCenter: "வணிக கட்டுப்பாட்டு மையம்",
    importLedger: "உங்கள் வணிக Ledger-ஐ பதிவேற்றவும்",
    chooseCsv: "CSV தேர்வு",
    analyze: "தரவை பகுப்பாய்வு செய்",
    inflow: "வரவு",
    outflow: "செலவு",
    net: "நிகர தொகை",
    risk: "ஆபத்து",
    anomalies: "அசாதாரண செலவுகள்",
    recurring: "தொடர்ச்சியான செலவுகள்",
    financeLab: "What-If நிதி ஆய்வகம்",
    saas: "SaaS குறைப்பு",
    contractor: "Contractor குறைப்பு",
    generate: "ஆலோசனையை உருவாக்கு",
    online: "AI Engine இயங்குகிறது",
    upload: "CSV பதிவேற்றம்",
    noFile: "கோப்பு தேர்வு செய்யப்படவில்லை",
    demo: "Demo தரவைப் பயன்படுத்து",
    language: "மொழி",
    transactionsCount: "பரிவர்த்தனைகள்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    loading: "ஏற்றுகிறது...",
  },

  Hindi: {
    overview: "अवलोकन",
    transactions: "लेन-देन",
    cashFlow: "कैश फ्लो",
    advisor: "AI सलाहकार",
    whatIf: "क्या होगा?",
    commandCenter: "बिज़नेस कमांड सेंटर",
    importLedger: "अपना बिज़नेस Ledger अपलोड करें",
    chooseCsv: "CSV चुनें",
    analyze: "डेटा का विश्लेषण करें",
    inflow: "आवक",
    outflow: "जावक",
    net: "शुद्ध",
    risk: "जोखिम",
    anomalies: "असामान्य खर्च",
    recurring: "बार-बार होने वाले खर्च",
    financeLab: "What-If वित्त प्रयोगशाला",
    saas: "SaaS कमी",
    contractor: "कॉन्ट्रैक्टर कमी",
    generate: "सलाह तैयार करें",
    online: "AI Engine ऑनलाइन",
    upload: "CSV अपलोड",
    noFile: "कोई फ़ाइल नहीं चुनी गई",
    demo: "Demo डेटा उपयोग करें",
    language: "भाषा",
    transactionsCount: "लेन-देन",
    analyzing: "विश्लेषण हो रहा है...",
    loading: "लोड हो रहा है...",
  },

  Telugu: {
    overview: "అవలోకనం",
    transactions: "లావాదేవీలు",
    cashFlow: "క్యాష్ ఫ్లో",
    advisor: "AI సలహాదారు",
    whatIf: "ఏమైతే?",
    commandCenter: "బిజినెస్ కమాండ్ సెంటర్",
    importLedger: "మీ బిజినెస్ Ledger అప్లోడ్ చేయండి",
    chooseCsv: "CSV ఎంచుకోండి",
    analyze: "డేటాను విశ్లేషించండి",
    inflow: "ఆదాయం",
    outflow: "ఖర్చు",
    net: "నికర",
    risk: "ప్రమాదం",
    anomalies: "అసాధారణ ఖర్చులు",
    recurring: "పునరావృత ఖర్చులు",
    financeLab: "What-If ఫైనాన్స్ ల్యాబ్",
    saas: "SaaS తగ్గింపు",
    contractor: "కాంట్రాక్టర్ తగ్గింపు",
    generate: "సలహా రూపొందించండి",
    online: "AI Engine ఆన్‌లైన్",
    upload: "CSV అప్లోడ్",
    noFile: "ఫైల్ ఎంచుకోలేదు",
    demo: "Demo డేటా ఉపయోగించండి",
    language: "భాష",
    transactionsCount: "లావాదేవీలు",
    analyzing: "విశ్లేషిస్తోంది...",
    loading: "లోడ్ అవుతోంది...",
  },

  Malayalam: {
    overview: "അവലോകനം",
    transactions: "ഇടപാടുകൾ",
    cashFlow: "ക്യാഷ് ഫ്ലോ",
    advisor: "AI ഉപദേഷ്ടാവ്",
    whatIf: "എന്തായിരുന്നെങ്കിൽ?",
    commandCenter: "ബിസിനസ് കമാൻഡ് സെന്റർ",
    importLedger: "നിങ്ങളുടെ ബിസിനസ് Ledger അപ്‌ലോഡ് ചെയ്യുക",
    chooseCsv: "CSV തിരഞ്ഞെടുക്കുക",
    analyze: "ഡാറ്റ വിശകലനം ചെയ്യുക",
    inflow: "വരവ്",
    outflow: "ചെലവ്",
    net: "നെറ്റ്",
    risk: "റിസ്ക്",
    anomalies: "അസാധാരണ ചെലവുകൾ",
    recurring: "ആവർത്തിച്ചുള്ള ചെലവുകൾ",
    financeLab: "What-If ഫിനാൻസ് ലാബ്",
    saas: "SaaS കുറവ്",
    contractor: "Contractor കുറവ്",
    generate: "ഉപദേശം സൃഷ്ടിക്കുക",
    online: "AI Engine ഓൺലൈൻ",
    upload: "CSV അപ്‌ലോഡ്",
    noFile: "ഫയൽ തിരഞ്ഞെടുത്തിട്ടില്ല",
    demo: "Demo ഡാറ്റ ഉപയോഗിക്കുക",
    language: "ഭാഷ",
    transactionsCount: "ഇടപാടുകൾ",
    analyzing: "വിശകലനം ചെയ്യുന്നു...",
    loading: "ലോഡ് ചെയ്യുന്നു...",
  },

  Kannada: {
    overview: "ಅವಲೋಕನ",
    transactions: "ವಹಿವಾಟುಗಳು",
    cashFlow: "ನಗದು ಹರಿವು",
    advisor: "AI ಸಲಹೆಗಾರ",
    whatIf: "ಏನಾದರೆ?",
    commandCenter: "ಬಿಸಿನೆಸ್ ಕಮಾಂಡ್ ಸೆಂಟರ್",
    importLedger: "ನಿಮ್ಮ ಬಿಸಿನೆಸ್ Ledger ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    chooseCsv: "CSV ಆಯ್ಕೆಮಾಡಿ",
    analyze: "ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಿ",
    inflow: "ಒಳಹರಿವು",
    outflow: "ಹೊರಹರಿವು",
    net: "ನಿವ್ವಳ",
    risk: "ಅಪಾಯ",
    anomalies: "ಅಸಾಮಾನ್ಯ ವೆಚ್ಚಗಳು",
    recurring: "ಪುನರಾವರ್ತಿತ ವೆಚ್ಚಗಳು",
    financeLab: "What-If ಫೈನಾನ್ಸ್ ಲ್ಯಾಬ್",
    saas: "SaaS ಕಡಿತ",
    contractor: "ಕಾಂಟ್ರಾಕ್ಟರ್ ಕಡಿತ",
    generate: "ಸಲಹೆ ರಚಿಸಿ",
    online: "AI Engine ಆನ್‌ಲೈನ್",
    upload: "CSV ಅಪ್‌ಲೋಡ್",
    noFile: "ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ",
    demo: "Demo ಡೇಟಾ ಬಳಸಿ",
    language: "ಭಾಷೆ",
    transactionsCount: "ವಹಿವಾಟುಗಳು",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
  },

  Bengali: {
    overview: "ওভারভিউ",
    transactions: "লেনদেন",
    cashFlow: "ক্যাশ ফ্লো",
    advisor: "AI উপদেষ্টা",
    whatIf: "যদি এমন হয়?",
    commandCenter: "বিজনেস কমান্ড সেন্টার",
    importLedger: "আপনার ব্যবসার Ledger আপলোড করুন",
    chooseCsv: "CSV নির্বাচন করুন",
    analyze: "ডেটা বিশ্লেষণ করুন",
    inflow: "আয়",
    outflow: "ব্যয়",
    net: "নেট",
    risk: "ঝুঁকি",
    anomalies: "অস্বাভাবিক খরচ",
    recurring: "পুনরাবৃত্ত খরচ",
    financeLab: "What-If ফাইন্যান্স ল্যাব",
    saas: "SaaS হ্রাস",
    contractor: "কন্ট্রাক্টর হ্রাস",
    generate: "পরামর্শ তৈরি করুন",
    online: "AI Engine অনলাইন",
    upload: "CSV আপলোড",
    noFile: "কোনো ফাইল নির্বাচন করা হয়নি",
    demo: "Demo ডেটা ব্যবহার করুন",
    language: "ভাষা",
    transactionsCount: "লেনদেন",
    analyzing: "বিশ্লেষণ করা হচ্ছে...",
    loading: "লোড হচ্ছে...",
  },

  French: {
    overview: "Aperçu",
    transactions: "Transactions",
    cashFlow: "Flux de trésorerie",
    advisor: "Conseiller IA",
    whatIf: "Et si ?",
    commandCenter: "Centre de commande",
    importLedger: "Importer votre registre",
    chooseCsv: "Choisir CSV",
    analyze: "Analyser les données",
    inflow: "Entrées",
    outflow: "Sorties",
    net: "Net",
    risk: "Risque",
    anomalies: "Dépenses anormales",
    recurring: "Coûts récurrents",
    financeLab: "Laboratoire financier",
    saas: "Réduction SaaS",
    contractor: "Réduction prestataires",
    generate: "Générer des conseils",
    online: "Moteur IA en ligne",
    upload: "Importer CSV",
    noFile: "Aucun fichier sélectionné",
    demo: "Utiliser les données Demo",
    language: "Langue",
    transactionsCount: "transactions",
    analyzing: "Analyse...",
    loading: "Chargement...",
  },

  Spanish: {
    overview: "Resumen",
    transactions: "Transacciones",
    cashFlow: "Flujo de caja",
    advisor: "Asesor IA",
    whatIf: "¿Qué pasaría?",
    commandCenter: "Centro de control empresarial",
    importLedger: "Importar registro empresarial",
    chooseCsv: "Elegir CSV",
    analyze: "Analizar datos",
    inflow: "Ingresos",
    outflow: "Gastos",
    net: "Neto",
    risk: "Riesgo",
    anomalies: "Gastos anómalos",
    recurring: "Costes recurrentes",
    financeLab: "Laboratorio financiero",
    saas: "Reducción SaaS",
    contractor: "Reducción contratistas",
    generate: "Generar consejo",
    online: "Motor IA en línea",
    upload: "Subir CSV",
    noFile: "Ningún archivo seleccionado",
    demo: "Usar datos Demo",
    language: "Idioma",
    transactionsCount: "transacciones",
    analyzing: "Analizando...",
    loading: "Cargando...",
  },

  German: {
    overview: "Übersicht",
    transactions: "Transaktionen",
    cashFlow: "Cashflow",
    advisor: "KI-Berater",
    whatIf: "Was-wäre-wenn",
    commandCenter: "Business Command Center",
    importLedger: "Geschäfts-Ledger importieren",
    chooseCsv: "CSV auswählen",
    analyze: "Daten analysieren",
    inflow: "Einnahmen",
    outflow: "Ausgaben",
    net: "Netto",
    risk: "Risiko",
    anomalies: "Auffällige Ausgaben",
    recurring: "Wiederkehrende Kosten",
    financeLab: "Finanzlabor",
    saas: "SaaS-Reduzierung",
    contractor: "Reduzierung Auftragnehmer",
    generate: "Beratung erstellen",
    online: "KI-Engine online",
    upload: "CSV hochladen",
    noFile: "Keine Datei ausgewählt",
    demo: "Demo-Daten verwenden",
    language: "Sprache",
    transactionsCount: "Transaktionen",
    analyzing: "Analyse...",
    loading: "Laden...",
  },

  Japanese: {
    overview: "概要",
    transactions: "取引",
    cashFlow: "キャッシュフロー",
    advisor: "AIアドバイザー",
    whatIf: "もしも分析",
    commandCenter: "ビジネスコマンドセンター",
    importLedger: "ビジネス台帳をインポート",
    chooseCsv: "CSVを選択",
    analyze: "データを分析",
    inflow: "収入",
    outflow: "支出",
    net: "純額",
    risk: "リスク",
    anomalies: "異常支出",
    recurring: "継続コスト",
    financeLab: "もしも財務ラボ",
    saas: "SaaS削減",
    contractor: "請負業者削減",
    generate: "アドバイスを生成",
    online: "AIエンジン稼働中",
    upload: "CSVアップロード",
    noFile: "ファイルが選択されていません",
    demo: "デモデータを使用",
    language: "言語",
    transactionsCount: "取引",
    analyzing: "分析中...",
    loading: "読み込み中...",
  },
};

function App() {
  const [audit, setAudit] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [plan, setPlan] = useState("");
  const [translatedPlan, setTranslatedPlan] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const [simulation, setSimulation] = useState(null);

  const [saasCut, setSaasCut] = useState(15);
  const [contractorCut, setContractorCut] = useState(10);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const [error, setError] = useState("");

  const t = UI_TEXT[selectedLanguage] || UI_TEXT.English;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/audit`);

      if (!response.ok) {
        throw new Error("Backend is not running");
      }

      const data = await response.json();

      setAudit(data);

      await runWhatIf(15, 10);

    } catch (err) {
      console.error(err);
      setError(
        "Backend connection failed. Start FastAPI on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be below 10 MB.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    handleFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    handleFileSelect(file);
  };

  const analyzeUploadedFile = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", selectedFile);

      /*
       IMPORTANT:
       Your FastAPI backend needs:

       POST /api/upload

       with:
       UploadFile = File(...)
      */

      const response = await fetch(
        `${BACKEND_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text || "CSV upload failed"
        );
      }

      const data = await response.json();

      if (data.audit) {
        setAudit(data.audit);
      }

      if (data.transactions) {
        setTransactions(data.transactions);
      }

      setPlan("");
      setTranslatedPlan("");

      await runWhatIf(
        saasCut,
        contractorCut
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to analyze CSV file."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/audit`
      );

      if (!response.ok) {
        throw new Error("Unable to load demo data");
      }

      const data = await response.json();

      setAudit(data);
      setSelectedFile(null);

      await runWhatIf(
        saasCut,
        contractorCut
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        throw new Error("What-If request failed");
      }

      const data = await response.json();

      setSimulation(data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSaasChange = (value) => {
    setSaasCut(value);

    runWhatIf(
      value,
      contractorCut
    );
  };

  const handleContractorChange = (value) => {
    setContractorCut(value);

    runWhatIf(
      saasCut,
      value
    );
  };

  const generateAdvice = async () => {
    try {
      setLoadingAdvice(true);
      setError("");

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

      if (!response.ok) {
        throw new Error(
          "Unable to generate financial advice"
        );
      }

      const data = await response.json();

      const newPlan = data.plan || "";

      setPlan(newPlan);

      if (selectedLanguage === "English") {
        setTranslatedPlan(newPlan);
      } else {
        await translateAdvice(
          newPlan,
          selectedLanguage
        );
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "AI advice generation failed."
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  const translateAdvice = async (
    text,
    language
  ) => {
    if (!text) {
      setTranslatedPlan("");
      return;
    }

    if (language === "English") {
      setTranslatedPlan(text);
      return;
    }

    try {
      setLoadingTranslation(true);

      const response = await fetch(
        `${BACKEND_URL}/api/translate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text,
            language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Translation request failed"
        );
      }

      const data = await response.json();

      setTranslatedPlan(
        data.translated_text || text
      );

    } catch (err) {
      console.error(err);

      setError(
        "Translation failed. Showing English advice."
      );

      setTranslatedPlan(text);

    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleLanguageChange = async (
    language
  ) => {
    setSelectedLanguage(language);

    if (plan) {
      await translateAdvice(
        plan,
        language
      );
    }
  };

  const money = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }
    ).format(number);
  };

  const getRisk = () => {
    if (!audit) return "LOW";

    if (
      audit.revenue_volatility
        ?.toLowerCase()
        .includes("high")
    ) {
      return "HIGH";
    }

    if (
      audit.anomalies &&
      audit.anomalies.length > 3
    ) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const risk = getRisk();

  const riskClass =
    risk === "HIGH"
      ? "risk-high"
      : risk === "MEDIUM"
      ? "risk-medium"
      : "risk-low";

  if (loading && !audit) {
    return (
      <div className="loading-screen">
        <div className="loading-orb">
          W
        </div>

        <h2>WealthBridge</h2>

        <p>
          {t.loading}
        </p>
      </div>
    );
  }

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
          <span className="online-dot"></span>
          {t.online}
        </div>

        <nav className="side-nav">

          <button className="nav-item active">
            <span>◈</span>
            {t.overview}
          </button>

          <button className="nav-item">
            <span>◫</span>
            {t.transactions}
          </button>

          <button className="nav-item">
            <span>◉</span>
            {t.cashFlow}
          </button>

          <button className="nav-item">
            <span>◇</span>
            {t.advisor}
          </button>

          <button className="nav-item">
            <span>◎</span>
            {t.whatIf}
          </button>

        </nav>

        <div className="sidebar-footer">

          <div className="language-title">
            {t.language}
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) =>
              handleLanguageChange(
                e.target.value
              )
            }
            className="language-select"
          >
            {LANGUAGES.map(
              (language) => (
                <option
                  key={language.value}
                  value={language.value}
                >
                  {language.label}
                </option>
              )
            )}
          </select>

          <div className="security">
            🔒 Secure local analysis
          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <div className="eyebrow">
              FINANCIAL INTELLIGENCE
            </div>

            <h1>
              {t.commandCenter}
            </h1>
          </div>

          <div className="top-status">
            <span className="pulse"></span>
            AI ONLINE
          </div>

        </header>

        {error && (
          <div className="error-banner">
            <span>⚠</span>

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* UPLOAD */}

        <section className="upload-card">

          <div className="upload-left">

            <div className="section-tag">
              DATA INGESTION
            </div>

            <h2>
              ↑ {t.importLedger}
            </h2>

            <p>
              Upload your transaction CSV.
              WealthBridge will audit it
              and build your financial
              command center.
            </p>

            <div
              className={`drop-zone ${
                dragging
                  ? "dragging"
                  : ""
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
                {selectedFile
                  ? selectedFile.name
                  : "Drop your CSV here"}
              </div>

              <div className="drop-sub">
                or browse files
              </div>

              <label className="browse-button">
                {t.chooseCsv}

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={
                    handleFileInput
                  }
                  hidden
                />
              </label>

              <div className="file-info">
                CSV • Maximum 10 MB
              </div>

            </div>

            <div className="upload-actions">

              <button
                className="primary-button"
                onClick={
                  analyzeUploadedFile
                }
                disabled={
                  !selectedFile ||
                  loading
                }
              >
                {loading
                  ? t.analyzing
                  : `${t.analyze} →`}
              </button>

              <button
                className="secondary-button"
                onClick={
                  loadDemoData
                }
              >
                {t.demo}
              </button>

            </div>

          </div>

          <div className="upload-preview">

            <div className="preview-title">
              LEDGER PIPELINE
            </div>

            <div className="pipeline">

              <div className="pipeline-step">
                <span>01</span>
                <strong>IMPORT</strong>
                <small>CSV ledger</small>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>02</span>
                <strong>AUDIT</strong>
                <small>Patterns</small>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>03</span>
                <strong>ADVISE</strong>
                <small>AI insights</small>
              </div>

            </div>

          </div>

        </section>

        {/* KPI CARDS */}

        <section className="kpi-grid">

          <div className="kpi-card">

            <div className="kpi-label">
              ↑ {t.inflow}
            </div>

            <div className="kpi-value">
              {money(
                audit?.total_inflow
              )}
            </div>

            <div className="kpi-meta">
              Recorded revenue
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-label">
              ↓ {t.outflow}
            </div>

            <div className="kpi-value">
              {money(
                audit?.total_outflow
              )}
            </div>

            <div className="kpi-meta">
              Operational spending
            </div>

          </div>

          <div className="kpi-card highlight">

            <div className="kpi-label">
              ◆ {t.net}
            </div>

            <div className="kpi-value">
              {money(
                audit?.net_cash_flow
              )}
            </div>

            <div className="kpi-meta">
              Cash position
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-label">
              ! {t.risk}
            </div>

            <div
              className={`risk-value ${riskClass}`}
            >
              {risk}
            </div>

            <div className="kpi-meta">
              Revenue volatility
            </div>

          </div>

        </section>

        {/* ANALYSIS GRID */}

        <section className="analysis-grid">

          {/* ANOMALIES */}

          <div className="panel">

            <div className="panel-header">

              <div>
                <div className="panel-kicker">
                  AUDIT SIGNALS
                </div>

                <h3>
                  {t.anomalies}
                </h3>
              </div>

              <span className="count-badge">
                {audit?.anomalies?.length ||
                  0}
              </span>

            </div>

            <div className="anomaly-list">

              {audit?.anomalies?.length ? (
                audit.anomalies
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      className="anomaly-item"
                      key={
                        item.tx_id ||
                        index
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
                        {money(
                          item.amount
                        )}
                      </div>

                    </div>
                  ))
              ) : (
                <div className="empty-state">
                  No anomalies detected.
                </div>
              )}

            </div>

          </div>

          {/* RECURRING */}

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

              <span className="count-badge">
                {audit
                  ?.recurring_charges
                  ?.length || 0}
              </span>

            </div>

            <div className="recurring-list">

              {audit
                ?.recurring_charges
                ?.length ? (
                audit.recurring_charges
                  .slice(0, 5)
                  .map(
                    (item, index) => (
                      <div
                        className="recurring-item"
                        key={
                          item.merchant ||
                          index
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
                          {money(
                            item.monthly_avg
                          )}
                          <small>
                            /mo
                          </small>
                        </div>

                      </div>
                    )
                  )
              ) : (
                <div className="empty-state">
                  No recurring costs found.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* WHAT IF */}

        <section className="finance-lab">

          <div className="lab-heading">

            <div>
              <div className="panel-kicker">
                SCENARIO ENGINE
              </div>

              <h2>
                {t.financeLab}
              </h2>

              <p>
                Test expense reductions
                before making a decision.
              </p>
            </div>

            <div className="simulation-result">

              <span>
                PROJECTED SAVINGS
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
                  handleSaasChange(
                    Number(e.target.value)
                  )
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
                value={
                  contractorCut
                }
                onChange={(e) =>
                  handleContractorChange(
                    Number(e.target.value)
                  )
                }
              />

            </div>

          </div>

          <div className="scenario-bottom">

            <div className="scenario-stat">

              <span>
                CURRENT NET
              </span>

              <strong>
                {money(
                  simulation?.original_net ??
                    audit?.net_cash_flow
                )}
              </strong>

            </div>

            <div className="scenario-arrow">
              →
            </div>

            <div className="scenario-stat positive">

              <span>
                ADJUSTED NET
              </span>

              <strong>
                {money(
                  simulation?.adjusted_net
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* AI ADVISOR */}

        <section className="advisor-panel">

          <div className="advisor-header">

            <div>

              <div className="advisor-symbol">
                ✦
              </div>

              <div className="panel-kicker">
                INTELLIGENCE LAYER
              </div>

              <h2>
                {t.advisor}
              </h2>

              <p>
                Grounded financial recommendations
                generated from your ledger.
              </p>

            </div>

            <button
              className="generate-button"
              onClick={
                generateAdvice
              }
              disabled={
                loadingAdvice
              }
            >
              {loadingAdvice
                ? t.analyzing
                : t.generate}
              <span>→</span>
            </button>

          </div>

          {loadingTranslation && (
            <div className="translation-loading">
              Translating financial report...
            </div>
          )}

          {translatedPlan && (
            <div className="advice-box">

              <div className="advice-language">
                {selectedLanguage}
              </div>

              <div className="advice-text">
                {translatedPlan}
              </div>

            </div>
          )}

        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">

          <span>
            WEALTHBRIDGE / SME FINANCIAL INTELLIGENCE
          </span>

          <span>
            {audit
              ? `${transactions.length || "800+"} ${t.transactionsCount}`
              : "Ready"}
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;