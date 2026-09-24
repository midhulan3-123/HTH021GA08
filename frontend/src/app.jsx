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
    overview: "Overview",
    transactions: "Transactions",
    cashflow: "Cash Flow",
    aiAdvisor: "AI Advisor",
    whatIf: "What-If",

    intelligence: "FINANCIAL INTELLIGENCE",
    command: "Business Command Center",
    online: "AI ENGINE ONLINE",

    ingestion: "DATA INGESTION",
    importLedger: "Import Your Business Data",

    description:
      "Upload your transaction CSV, receipt images or voice recordings. WealthBridge will analyze your business data.",

    drop: "Drop your file here",
    browse: "Choose File",

    formats:
      "CSV • JPG • PNG • WEBP • MP3 • WAV • M4A",

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

    test:
      "Test expense reductions before making a decision.",

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

    secure:
      "🔒 Secure local analysis",

    transactionTitle:
      "Transaction Ledger",

    transactionDescription:
      "Business transactions from your uploaded file.",

    id: "ID",
    date: "Date",
    merchant: "Merchant",
    category: "Category",
    amount: "Amount",

    noTransactions:
      "Upload a CSV file to display transactions.",

    cashTitle:
      "Business Cash Position",

    cashDescription:
      "Monitor the movement of business money.",

    noAnomalies:
      "No major anomalies detected.",

    noRecurring:
      "No recurring costs detected.",
  },

  ta: {
    overview: "மேலோட்டம்",
    transactions: "பரிவர்த்தனைகள்",
    cashflow: "பணப்புழக்கம்",
    aiAdvisor: "AI ஆலோசகர்",
    whatIf: "என்ன ஆகும்?",

    intelligence: "நிதி நுண்ணறிவு",
    command: "வணிக கட்டுப்பாட்டு மையம்",
    online: "AI இயங்குகிறது",

    ingestion: "தரவு உள்ளீடு",
    importLedger: "வணிக தரவை பதிவேற்றவும்",

    description:
      "CSV, ரசீது படங்கள் அல்லது குரல் பதிவுகளை பதிவேற்றவும். WealthBridge உங்கள் வணிக தரவை பகுப்பாய்வு செய்யும்.",

    drop: "உங்கள் கோப்பை இங்கே விடுங்கள்",
    browse: "கோப்பை தேர்வு செய்க",

    formats:
      "CSV • JPG • PNG • WEBP • MP3 • WAV • M4A",

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

    test:
      "முடிவு எடுப்பதற்கு முன் செலவு குறைப்புகளை சோதிக்கவும்.",

    savings: "எதிர்பார்க்கப்படும் சேமிப்பு",
    saas: "SaaS குறைப்பு",
    contractor: "ஒப்பந்ததாரர் குறைப்பு",

    current: "தற்போதைய நிகர",
    adjusted: "மாற்றியமைக்கப்பட்ட நிகர",

    advisor: "AI நிதி ஆலோசகர்",

    advisorText:
      "உங்கள் வணிக தரவை அடிப்படையாகக் கொண்ட நிதி பரிந்துரைகள்.",

    generate: "ஆலோசனையை உருவாக்கு →",

    language: "மொழி",

    secure:
      "🔒 பாதுகாப்பான உள்ளூர் பகுப்பாய்வு",

    transactionTitle:
      "பரிவர்த்தனை பட்டியல்",

    transactionDescription:
      "நீங்கள் பதிவேற்றிய கோப்பிலிருந்து வணிக பரிவர்த்தனைகள்.",

    id: "அடையாளம்",
    date: "தேதி",
    merchant: "விற்பனையாளர்",
    category: "வகை",
    amount: "தொகை",

    noTransactions:
      "பரிவர்த்தனைகளை பார்க்க CSV கோப்பை பதிவேற்றவும்.",

    cashTitle:
      "வணிக பண நிலை",

    cashDescription:
      "வணிக பணத்தின் இயக்கத்தை கண்காணிக்கவும்.",

    noAnomalies:
      "முக்கியமான அசாதாரணங்கள் கண்டறியப்படவில்லை.",

    noRecurring:
      "தொடர்ச்சியான செலவுகள் கண்டறியப்படவில்லை.",
  },

  hi: {
    overview: "अवलोकन",
    transactions: "लेनदेन",
    cashflow: "कैश फ्लो",
    aiAdvisor: "AI सलाहकार",
    whatIf: "क्या होगा?",

    intelligence: "वित्तीय बुद्धिमत्ता",
    command: "बिजनेस कमांड सेंटर",
    online: "AI ऑनलाइन",

    ingestion: "डेटा इनपुट",
    importLedger: "अपना बिजनेस डेटा अपलोड करें",

    description:
      "CSV, रसीद की तस्वीरें या वॉइस रिकॉर्डिंग अपलोड करें। WealthBridge आपके डेटा का विश्लेषण करेगा।",

    drop: "अपनी फाइल यहां डालें",
    browse: "फाइल चुनें",

    formats:
      "CSV • JPG • PNG • WEBP • MP3 • WAV • M4A",

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

    test:
      "निर्णय लेने से पहले खर्च में कमी का परीक्षण करें।",

    savings: "अनुमानित बचत",
    saas: "SaaS कमी",
    contractor: "कॉन्ट्रैक्टर कमी",

    current: "वर्तमान नेट",
    adjusted: "समायोजित नेट",

    advisor: "AI सलाहकार",

    advisorText:
      "आपके डेटा से तैयार वित्तीय सुझाव।",

    generate: "सलाह बनाएं →",

    language: "भाषा",

    secure:
      "🔒 सुरक्षित स्थानीय विश्लेषण",

    transactionTitle:
      "लेनदेन सूची",

    transactionDescription:
      "आपकी अपलोड की गई फाइल के बिजनेस लेनदेन।",

    id: "आईडी",
    date: "तारीख",
    merchant: "व्यापारी",
    category: "श्रेणी",
    amount: "राशि",

    noTransactions:
      "लेनदेन देखने के लिए CSV अपलोड करें।",

    cashTitle:
      "बिजनेस कैश स्थिति",

    cashDescription:
      "बिजनेस पैसे के प्रवाह की निगरानी करें।",

    noAnomalies:
      "कोई बड़ी असामान्यता नहीं मिली।",

    noRecurring:
      "कोई आवर्ती खर्च नहीं मिला।",
  },
};


export default function App() {

  const [audit, setAudit] = useState(null);

  const [plan, setPlan] = useState("");

  const [language, setLanguage] = useState("en");

  const [activeSection, setActiveSection] =
    useState("overview");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [fileType, setFileType] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [loadingPlan, setLoadingPlan] =
    useState(false);

  const [saasCut, setSaasCut] =
    useState(15);

  const [contractorCut, setContractorCut] =
    useState(10);

  const [simulation, setSimulation] =
    useState(null);

  const [error, setError] =
    useState("");


  const t =
    translations[language] ||
    translations.en;


  useEffect(() => {
    loadAudit();
  }, []);


  const goToSection = (section) => {

    setActiveSection(section);

    const element =
      document.getElementById(section);

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }
  };


  const loadAudit = async () => {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/audit`
        );

      if (!response.ok) {
        throw new Error(
          "Backend is not running."
        );
      }

      const data =
        await response.json();

      setAudit(data);

      runWhatIf(15, 10);

    } catch (err) {

      console.error(err);

      setError(
        "Backend connection failed. Start FastAPI on port 8000."
      );
    }
  };


  const detectFileType = (file) => {

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    if (extension === "csv") {
      return "csv";
    }


    if (
      [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ].includes(extension)
    ) {
      return "image";
    }


    if (
      [
        "mp3",
        "wav",
        "m4a",
      ].includes(extension)
    ) {
      return "audio";
    }


    return null;
  };


  const validateFile = (file) => {

    if (!file) {
      return false;
    }


    const type =
      detectFileType(file);


    if (!type) {

      setError(
        "Unsupported file. Use CSV, JPG, PNG, WEBP, MP3, WAV or M4A."
      );

      return false;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Maximum file size is 10 MB."
      );

      return false;
    }


    setError("");

    setSelectedFile(file);

    setFileType(type);

    return true;
  };


  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];

    validateFile(file);
  };


  const handleDrop = (event) => {

    event.preventDefault();

    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    validateFile(file);
  };


  const handleAnalyzeFile = async () => {

    if (!selectedFile) {

      setError(
        "Please select a file first."
      );

      return;
    }


    setUploading(true);

    setError("");


    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response =
        await fetch(
          `${BACKEND_URL}/api/upload`,
          {
            method: "POST",
            body: formData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "File analysis failed."
        );
      }


      if (data.audit) {
        setAudit(data.audit);
      }


      setActiveSection(
        "overview"
      );

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

      const response =
        await fetch(
          `${BACKEND_URL}/api/regenerate`,
          {
            method: "POST",
          }
        );


      if (!response.ok) {
        throw new Error(
          "Demo data failed."
        );
      }


      await loadAudit();

    } catch (err) {

      setError(
        err.message
      );

    }
  };


  const runWhatIf = async (
    saasValue,
    contractorValue
  ) => {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/what-if`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
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
        throw new Error(
          "What-If analysis failed."
        );
      }


      const data =
        await response.json();

      setSimulation(data);

    } catch (err) {

      console.error(err);

    }
  };


  const changeSaas = (value) => {

    const number =
      Number(value);

    setSaasCut(number);

    runWhatIf(
      number,
      contractorCut
    );
  };


  const changeContractor = (
    value
  ) => {

    const number =
      Number(value);

    setContractorCut(number);

    runWhatIf(
      saasCut,
      number
    );
  };


  const generateAdvice = async () => {

    setLoadingPlan(true);

    setError("");


    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/generate-plan`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              api_key: null,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Could not generate advice."
        );
      }


      setPlan(
        data.plan || ""
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "AI advice failed."
      );

    } finally {

      setLoadingPlan(false);

    }
  };


  const money = (value) => {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value || 0)
    );
  };


  const riskClass =
    audit?.revenue_volatility
      ?.includes("High")
      ? "risk-high"
      : "risk-low";


  return (

    <div className="app-shell">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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

          {t.online}

        </div>


        {/* NAVIGATION */}

        <nav className="side-nav">


          <button
            type="button"
            className={`nav-item ${
              activeSection ===
              "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "overview"
              )
            }
          >

            <span className="nav-icon">
              ◈
            </span>

            {t.overview}

          </button>


          <button
            type="button"
            className={`nav-item ${
              activeSection ===
              "transactions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "transactions"
              )
            }
          >

            <span className="nav-icon">
              ◫
            </span>

            {t.transactions}

          </button>


          <button
            type="button"
            className={`nav-item ${
              activeSection ===
              "cashflow"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "cashflow"
              )
            }
          >

            <span className="nav-icon">
              ◉
            </span>

            {t.cashflow}

          </button>


          <button
            type="button"
            className={`nav-item ${
              activeSection ===
              "advisor"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "advisor"
              )
            }
          >

            <span className="nav-icon">
              ◇
            </span>

            {t.aiAdvisor}

          </button>


          <button
            type="button"
            className={`nav-item ${
              activeSection ===
              "whatif"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "whatif"
              )
            }
          >

            <span className="nav-icon">
              ◎
            </span>

            {t.whatIf}

          </button>

        </nav>


        {/* LANGUAGE */}

        <div className="sidebar-footer">

          <div className="language-title">
            {t.language}
          </div>


          <select
            className="language-select"
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
            }
          >

            {LANGUAGES.map(
              (item) => (

                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.name}
                </option>

              )
            )}

          </select>


          <div className="security">
            {t.secure}
          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main-content">


        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section
          id="overview"
          className="dashboard-section"
        >

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


          {/* ERROR */}

          {error && (

            <div className="error-banner">

              ⚠

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

            <div>

              <div className="section-tag">
                {t.ingestion}
              </div>

              <h2>
                {t.importLedger}
              </h2>

              <p>
                {t.description}
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
                onDrop={
                  handleDrop
                }
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
                  accept=".csv,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a"
                  onChange={
                    handleFileChange
                  }
                />


                <div className="file-info">

                  {t.formats}

                  {" • "}

                  Maximum 10 MB

                </div>

              </div>


              {selectedFile && (

                <div className="selected-file">

                  <div className="selected-file-icon">

                    {fileType === "csv"
                      ? "📊"
                      : fileType === "image"
                      ? "🖼️"
                      : "🎙️"}

                  </div>


                  <div className="selected-file-details">

                    <strong>
                      {selectedFile.name}
                    </strong>

                    <small>

                      {fileType.toUpperCase()}

                      {" • "}

                      {(
                        selectedFile.size /
                        1024
                      ).toFixed(1)}

                      KB

                    </small>

                  </div>


                  <button
                    className="remove-file"
                    onClick={() => {

                      setSelectedFile(
                        null
                      );

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


            {/* PIPELINE */}

            <div className="upload-preview">

              <div className="preview-title">
                {t.pipeline}
              </div>


              <div className="pipeline">

                <div className="pipeline-step">

                  <span>
                    01
                  </span>

                  <strong>
                    {t.import}
                  </strong>

                  <small>
                    CSV / Image / Audio
                  </small>

                </div>


                <div className="pipeline-line" />


                <div className="pipeline-step">

                  <span>
                    02
                  </span>

                  <strong>
                    {t.audit}
                  </strong>

                  <small>
                    Patterns
                  </small>

                </div>


                <div className="pipeline-line" />


                <div className="pipeline-step">

                  <span>
                    03
                  </span>

                  <strong>
                    {t.advise}
                  </strong>

                  <small>
                    AI insights
                  </small>

                </div>

              </div>

            </div>

          </section>


          {/* KPI */}

          {audit && (

            <section className="kpi-grid">

              <div className="kpi-card">

                <div className="kpi-label">
                  ↑ {t.inflow}
                </div>

                <div className="kpi-value">
                  {money(
                    audit.total_inflow
                  )}
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
                  {money(
                    audit.total_outflow
                  )}
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
                  {money(
                    audit.net_cash_flow
                  )}
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

                  {audit.revenue_volatility
                    ?.includes("High")
                    ? "HIGH"
                    : "STABLE"}

                </div>

                <div className="kpi-meta">
                  {t.volatility}
                </div>

              </div>

            </section>

          )}


          {/* AUDIT */}

          {audit && (

            <section className="analysis-grid">


              {/* ANOMALIES */}

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

                    {audit.anomalies
                      ?.length || 0}

                  </div>

                </div>


                <div className="anomaly-list">

                  {(
                    audit.anomalies ||
                    []
                  )
                    .slice(0, 5)
                    .map(
                      (
                        item,
                        index
                      ) => (

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
                              {
                                item.merchant
                              }
                            </strong>

                            <span>
                              {
                                item.tx_id
                              }
                            </span>

                          </div>

                          <div className="anomaly-amount">
                            {money(
                              item.amount
                            )}
                          </div>

                        </div>

                      )
                    )}


                  {(!audit.anomalies ||
                    audit.anomalies
                      .length ===
                      0) && (

                    <div className="empty-state">
                      {t.noAnomalies}
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


                  <div className="count-badge">

                    {audit
                      .recurring_charges
                      ?.length ||
                      0}

                  </div>

                </div>


                <div className="recurring-list">

                  {(
                    audit.recurring_charges ||
                    []
                  )
                    .slice(0, 5)
                    .map(
                      (
                        item,
                        index
                      ) => (

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
                              {
                                item.merchant
                              }
                            </strong>

                            <span>
                              {
                                item.category
                              }
                            </span>

                          </div>

                          <div className="recurring-price">

                            {money(
                              item.monthly_avg
                            )}

                            <small>
                              /month
                            </small>

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>

            </section>

          )}

        </section>


        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <section
          id="transactions"
          className="dashboard-section"
        >

          <div className="section-tag">
            TRANSACTIONS
          </div>

          <h2>
            {t.transactionTitle}
          </h2>

          <p>
            {t.transactionDescription}
          </p>


          <div className="transaction-table">

            <div className="transaction-header">

              <span>
                {t.id}
              </span>

              <span>
                {t.date}
              </span>

              <span>
                {t.merchant}
              </span>

              <span>
                {t.category}
              </span>

              <span>
                {t.amount}
              </span>

            </div>


            {audit?.transactions?.length ? (

              audit.transactions
                .slice(0, 50)
                .map(
                  (
                    tx,
                    index
                  ) => (

                    <div
                      className="transaction-row"
                      key={
                        tx.tx_id ||
                        index
                      }
                    >

                      <span>
                        {
                          tx.tx_id ||
                          "-"
                        }
                      </span>

                      <span>
                        {
                          tx.date ||
                          "-"
                        }
                      </span>

                      <span>
                        {
                          tx.merchant ||
                          "-"
                        }
                      </span>

                      <span>
                        {
                          tx.category ||
                          "-"
                        }
                      </span>

                      <span>
                        {money(
                          tx.amount
                        )}
                      </span>

                    </div>

                  )
                )

            ) : (

              <div className="empty-state">

                {t.noTransactions}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            CASH FLOW
        ================================================= */}

        <section
          id="cashflow"
          className="dashboard-section"
        >

          <div className="section-tag">
            CASH FLOW
          </div>

          <h2>
            {t.cashTitle}
          </h2>

          <p>
            {t.cashDescription}
          </p>


          <div className="cashflow-grid">

            <div className="cash-card">

              <span>
                ↑ {t.inflow}
              </span>

              <strong>
                {money(
                  audit?.total_inflow
                )}
              </strong>

              <small>
                {t.revenue}
              </small>

            </div>


            <div className="cash-card">

              <span>
                ↓ {t.outflow}
              </span>

              <strong>
                {money(
                  audit?.total_outflow
                )}
              </strong>

              <small>
                {t.spending}
              </small>

            </div>


            <div className="cash-card">

              <span>
                ◆ {t.net}
              </span>

              <strong>
                {money(
                  audit?.net_cash_flow
                )}
              </strong>

              <small>
                {t.cash}
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            WHAT IF
        ================================================= */}

        <section
          id="whatif"
          className="finance-lab"
        >

          <div className="lab-heading">

            <div>

              <div className="section-tag">
                {t.scenario}
              </div>

              <h2>
                {t.lab}
              </h2>

              <p>
                {t.test}
              </p>

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
                  changeSaas(
                    e.target.value
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


        {/* =================================================
            AI ADVISOR
        ================================================= */}

        <section
          id="advisor"
          className="advisor-panel"
        >

          <div className="advisor-header">

            <div>

              <div className="advisor-symbol">
                ✦
              </div>

              <div className="section-tag">
                {t.intelligence}
              </div>

              <h2>
                {t.advisor}
              </h2>

              <p>
                {t.advisorText}
              </p>

            </div>


            <button
              className="generate-button"
              onClick={
                generateAdvice
              }
              disabled={
                loadingPlan
              }
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
                      x.code ===
                      language
                  )?.name
                }

              </div>


              <div className="advice-text">
                {plan}
              </div>

            </div>

          )}

        </section>


        <footer className="dashboard-footer">

          <span>
            WEALTHBRIDGE /
            SME FINANCIAL
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