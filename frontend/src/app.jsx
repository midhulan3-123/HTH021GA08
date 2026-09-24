import React, {
  useEffect,
  useState
} from "react";

import "./index.css";

const BACKEND_URL =
  "http://127.0.0.1:8000";

function money(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }
  ).format(value || 0);
}

export default function App() {

  const [audit, setAudit] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [advice, setAdvice] =
    useState("");

  const [adviceLoading, setAdviceLoading] =
    useState(false);

  const [saasCut, setSaasCut] =
    useState(15);

  const [contractorCut, setContractorCut] =
    useState(10);

  const [simulation, setSimulation] =
    useState(null);

  const [language, setLanguage] =
    useState("English");

  const [activePage, setActivePage] =
    useState("Overview");

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/audit`
        );

      const data =
        await response.json();

      setAudit(data);

      runSimulation(
        15,
        10
      );

    } catch (error) {

      console.error(
        "Backend connection failed:",
        error
      );
    }
  }

  async function uploadFile() {

    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    setLoading(true);

    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `${BACKEND_URL}/api/upload`,
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Upload failed"
        );
      }

      setAudit(data.audit);

      await runSimulation(
        saasCut,
        contractorCut
      );

      alert(
        `Successfully analyzed ${data.rows} transactions`
      );

    } catch (error) {

      alert(
        `Upload error: ${error.message}`
      );

    } finally {

      setLoading(false);
    }
  }

  async function useDemoData() {

    setLoading(true);

    try {

      await fetch(
        `${BACKEND_URL}/api/regenerate`,
        {
          method: "POST"
        }
      );

      await loadAudit();

    } catch (error) {

      alert(
        "Could not load demo data."
      );

    } finally {

      setLoading(false);
    }
  }

  async function runSimulation(
    saas,
    contractor
  ) {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/what-if`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              saas_reduction_pct:
                Number(saas),

              contractor_reduction_pct:
                Number(contractor)
            })
          }
        );

      const data =
        await response.json();

      setSimulation(data);

    } catch (error) {

      console.error(
        "Simulation error:",
        error
      );
    }
  }

  async function generateAdvice() {

    setAdviceLoading(true);

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/generate-plan`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              api_key: null
            })
          }
        );

      const data =
        await response.json();

      setAdvice(
        data.plan ||
        "No advice generated."
      );

    } catch (error) {

      setAdvice(
        "Unable to generate advice. Check the backend."
      );

    } finally {

      setAdviceLoading(false);
    }
  }

  function handleSaasChange(e) {

    const value =
      Number(e.target.value);

    setSaasCut(value);

    runSimulation(
      value,
      contractorCut
    );
  }

  function handleContractorChange(e) {

    const value =
      Number(e.target.value);

    setContractorCut(value);

    runSimulation(
      saasCut,
      value
    );
  }

  const translations = {

    English: {
      overview: "Overview",
      transactions: "Transactions",
      cashflow: "Cash Flow",
      advisor: "AI Advisor",
      whatif: "What-If",
      import: "IMPORT YOUR BUSINESS LEDGER",
      analyze: "ANALYZE DATA",
      inflow: "INFLOW",
      outflow: "OUTFLOW",
      net: "NET CASH",
      risk: "RISK",
      anomalies: "SPENDING ANOMALIES",
      recurring: "RECURRING COSTS",
      lab: "WHAT-IF FINANCE LAB",
      advisorTitle:
        "AI FINANCIAL ADVISOR",
      generate:
        "GENERATE ADVICE"
    },

    Tamil: {
      overview: "மேலோட்டம்",
      transactions: "பரிவர்த்தனைகள்",
      cashflow: "பணப்புழக்கம்",
      advisor: "AI ஆலோசகர்",
      whatif: "என்ன ஆகும்?",
      import: "வணிக CSV கோப்பை பதிவேற்றவும்",
      analyze: "தரவை பகுப்பாய்வு செய்",
      inflow: "வரவு",
      outflow: "செலவு",
      net: "நிகர பணம்",
      risk: "ஆபத்து",
      anomalies: "அசாதாரண செலவுகள்",
      recurring: "தொடர்ச்சியான செலவுகள்",
      lab: "WHAT-IF நிதி ஆய்வகம்",
      advisorTitle: "AI நிதி ஆலோசகர்",
      generate: "ஆலோசனையை உருவாக்கு"
    },

    Hindi: {
      overview: "अवलोकन",
      transactions: "लेनदेन",
      cashflow: "कैश फ्लो",
      advisor: "AI सलाहकार",
      whatif: "क्या होगा?",
      import: "व्यवसाय CSV अपलोड करें",
      analyze: "डेटा विश्लेषण करें",
      inflow: "आमदनी",
      outflow: "खर्च",
      net: "शुद्ध नकदी",
      risk: "जोखिम",
      anomalies: "असामान्य खर्च",
      recurring: "बार-बार होने वाले खर्च",
      lab: "WHAT-IF वित्त प्रयोगशाला",
      advisorTitle: "AI वित्तीय सलाहकार",
      generate: "सलाह तैयार करें"
    },

    Telugu: {
      overview: "అవలోకనం",
      transactions: "లావాదేవీలు",
      cashflow: "క్యాష్ ఫ్లో",
      advisor: "AI సలహాదారు",
      whatif: "ఏమైతే?",
      import: "వ్యాపార CSV అప్లోడ్ చేయండి",
      analyze: "డేటాను విశ్లేషించండి",
      inflow: "ఆదాయం",
      outflow: "ఖర్చు",
      net: "నికర నగదు",
      risk: "ప్రమాదం",
      anomalies: "అసాధారణ ఖర్చులు",
      recurring: "పునరావృత ఖర్చులు",
      lab: "WHAT-IF ఆర్థిక ప్రయోగశాల",
      advisorTitle: "AI ఆర్థిక సలహాదారు",
      generate: "సలహా రూపొందించండి"
    }
  };

  const t =
    translations[language] ||
    translations.English;

  if (!audit) {

    return (
      <div className="loading-screen">
        <div className="loading-logo">
          W
        </div>

        <h1>
          WealthBridge
        </h1>

        <p>
          Loading Financial Intelligence...
        </p>
      </div>
    );
  }

  const risk =
    audit.revenue_volatility
      ?.toLowerCase()
      .includes("high")
      ? "HIGH"
      : "STABLE";

  return (

    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            W
          </div>

          <div>
            <h2>
              WealthBridge
            </h2>

            <span>
              FINANCIAL OS
            </span>
          </div>

        </div>

        <div className="online">
          <span></span>
          AI ENGINE ONLINE
        </div>

        <nav>

          <button
            className={
              activePage === "Overview"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("Overview")
            }
          >
            ◈ {t.overview}
          </button>

          <button
            className={
              activePage === "Transactions"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("Transactions")
            }
          >
            ◫ {t.transactions}
          </button>

          <button
            className={
              activePage === "Cash Flow"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("Cash Flow")
            }
          >
            ◉ {t.cashflow}
          </button>

          <button
            className={
              activePage === "AI Advisor"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("AI Advisor")
            }
          >
            ◇ {t.advisor}
          </button>

          <button
            className={
              activePage === "What-If"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("What-If")
            }
          >
            ◎ {t.whatif}
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="secure">
            🔒 Secure workspace
          </div>

          <small>
            WealthBridge v1.0
          </small>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>

            <div className="eyebrow">
              FINANCIAL INTELLIGENCE
            </div>

            <h1>
              Business Command Center
            </h1>

          </div>

          <div className="top-actions">

            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value
                )
              }
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
              <option>Telugu</option>
            </select>

            <div className="status">
              <span></span>
              AI ONLINE
            </div>

          </div>

        </header>

        {/* UPLOAD */}

        <section className="upload-card">

          <div className="upload-left">

            <div className="upload-icon">
              ↑
            </div>

            <div>

              <div className="section-label">
                DATA IMPORT
              </div>

              <h2>
                {t.import}
              </h2>

              <p>
                Upload your transaction ledger
                and let WealthBridge analyze
                your business.
              </p>

            </div>

          </div>

          <div className="upload-actions">

            <label className="file-button">

              {file
                ? file.name
                : "CHOOSE CSV"}

              <input
                type="file"
                accept=".csv"
                onChange={(e) =>
                  setFile(
                    e.target.files[0]
                  )
                }
              />

            </label>

            <button
              className="primary-button"
              onClick={uploadFile}
              disabled={loading}
            >
              {loading
                ? "ANALYZING..."
                : `${t.analyze} →`}
            </button>

            <button
              className="demo-button"
              onClick={useDemoData}
            >
              USE DEMO DATA
            </button>

          </div>

        </section>

        {/* METRICS */}

        <section className="metrics">

          <div className="metric">

            <span>
              ↑ {t.inflow}
            </span>

            <strong>
              {money(
                audit.total_inflow
              )}
            </strong>

            <small>
              Recorded revenue
            </small>

          </div>

          <div className="metric">

            <span>
              ↓ {t.outflow}
            </span>

            <strong>
              {money(
                audit.total_outflow
              )}
            </strong>

            <small>
              Business expenses
            </small>

          </div>

          <div className="metric">

            <span>
              ◆ {t.net}
            </span>

            <strong>
              {money(
                audit.net_cash_flow
              )}
            </strong>

            <small>
              Current net position
            </small>

          </div>

          <div className="metric risk-card">

            <span>
              ◈ {t.risk}
            </span>

            <strong>
              {risk}
            </strong>

            <small>
              Revenue volatility
            </small>

          </div>

        </section>

        {/* ANALYSIS */}

        <section className="analysis-grid">

          {/* ANOMALIES */}

          <div className="panel">

            <div className="panel-heading">

              <div>
                <span className="section-label">
                  MONITOR
                </span>

                <h3>
                  {t.anomalies}
                </h3>
              </div>

              <span className="count">
                {audit.anomalies.length}
              </span>

            </div>

            <div className="anomaly-list">

              {audit.anomalies.length === 0 ? (

                <div className="empty">
                  No anomalies detected
                </div>

              ) : (

                audit.anomalies
                  .slice(0, 5)
                  .map(
                    (item, index) => (

                      <div
                        className="anomaly"
                        key={index}
                      >

                        <div className="warning">
                          ⚠
                        </div>

                        <div>

                          <strong>
                            {item.merchant}
                          </strong>

                          <span>
                            {item.tx_id}
                          </span>

                        </div>

                        <b>
                          {money(
                            item.amount
                          )}
                        </b>

                      </div>

                    )
                  )

              )}

            </div>

          </div>

          {/* RECURRING */}

          <div className="panel">

            <div className="panel-heading">

              <div>
                <span className="section-label">
                  COMMITMENTS
                </span>

                <h3>
                  {t.recurring}
                </h3>
              </div>

              <span className="count">
                {audit.recurring_charges.length}
              </span>

            </div>

            <div className="recurring-list">

              {audit.recurring_charges
                .slice(0, 5)
                .map(
                  (item, index) => (

                    <div
                      className="recurring"
                      key={index}
                    >

                      <div className="merchant-icon">
                        $
                      </div>

                      <div>

                        <strong>
                          {item.merchant}
                        </strong>

                        <span>
                          {item.category}
                        </span>

                      </div>

                      <b>
                        {money(
                          item.monthly_avg
                        )}
                        <small>
                          /mo
                        </small>
                      </b>

                    </div>

                  )
                )}

            </div>

          </div>

        </section>

        {/* WHAT IF */}

        <section className="whatif">

          <div className="whatif-header">

            <div>

              <span className="section-label">
                SIMULATION ENGINE
              </span>

              <h2>
                {t.lab}
              </h2>

            </div>

            {simulation && (

              <div className="savings">

                <span>
                  PROJECTED SAVINGS
                </span>

                <strong>
                  {money(
                    simulation.projected_savings
                  )}
                </strong>

              </div>

            )}

          </div>

          <div className="sliders">

            <div className="slider-row">

              <div className="slider-info">

                <span>
                  SaaS reduction
                </span>

                <b>
                  {saasCut}%
                </b>

              </div>

              <input
                type="range"
                min="0"
                max="50"
                value={saasCut}
                onChange={
                  handleSaasChange
                }
              />

            </div>

            <div className="slider-row">

              <div className="slider-info">

                <span>
                  Contractor reduction
                </span>

                <b>
                  {contractorCut}%
                </b>

              </div>

              <input
                type="range"
                min="0"
                max="50"
                value={contractorCut}
                onChange={
                  handleContractorChange
                }
              />

            </div>

          </div>

          {simulation && (

            <div className="simulation-result">

              <div>
                Original net
                <strong>
                  {money(
                    simulation.original_net
                  )}
                </strong>
              </div>

              <div>
                Projected net
                <strong>
                  {money(
                    simulation.adjusted_net
                  )}
                </strong>
              </div>

            </div>

          )}

        </section>

        {/* AI ADVISOR */}

        <section className="advisor-panel">

          <div className="advisor-title">

            <div className="ai-orb">
              ✦
            </div>

            <div>

              <span className="section-label">
                INTELLIGENCE ENGINE
              </span>

              <h2>
                {t.advisorTitle}
              </h2>

              <p>
                Grounded recommendations based
                on your uploaded transaction data.
              </p>

            </div>

          </div>

          <button
            className="advisor-button"
            onClick={
              generateAdvice
            }
            disabled={
              adviceLoading
            }
          >
            {adviceLoading
              ? "GENERATING..."
              : `${t.generate} ✦`}
          </button>

          {advice && (

            <div className="advice-output">

              <div className="advice-label">
                AI ANALYSIS
              </div>

              <pre>
                {advice}
              </pre>

            </div>

          )}

        </section>

        <footer>

          <span>
            © 2026 WealthBridge
          </span>

          <span>
            FINANCIAL INTELLIGENCE PLATFORM
          </span>

          <span>
            SECURE • PRIVATE • AI-POWERED
          </span>

        </footer>

      </main>

    </div>
  );
}