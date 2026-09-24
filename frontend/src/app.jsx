import React, {
  useEffect,
  useRef,
  useState
} from "react";

const API =
  "http://127.0.0.1:8000";

const languages = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Malayalam",
  "Kannada"
];

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

  const [audit, setAudit] =
    useState(null);

  const [plan, setPlan] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [fileName, setFileName] =
    useState("");

  const [source, setSource] =
    useState("");

  const [language, setLanguage] =
    useState("English");

  const [saas, setSaas] =
    useState(15);

  const [contractor, setContractor] =
    useState(10);

  const [simulation, setSimulation] =
    useState(null);

  const fileInput =
    useRef(null);

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {

    try {

      const response =
        await fetch(
          `${API}/api/audit`
        );

      const data =
        await response.json();

      setAudit(data);

      runSimulation(
        15,
        10
      );

    } catch (error) {

      console.error(error);
    }
  }

  async function runSimulation(
    saasValue,
    contractorValue
  ) {

    try {

      const response =
        await fetch(
          `${API}/api/what-if`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              saas_reduction_pct:
                Number(saasValue),

              contractor_reduction_pct:
                Number(contractorValue)
            })
          }
        );

      const data =
        await response.json();

      setSimulation(data);

    } catch (error) {

      console.error(error);
    }
  }

  async function uploadFile(file) {

    if (!file) return;

    setUploading(true);

    setFileName(
      file.name
    );

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    let endpoint =
      "/api/upload-csv";

    if (
      file.type.startsWith(
        "image/"
      )
    ) {
      endpoint =
        "/api/upload-image";
    } else if (
      file.type.startsWith(
        "audio/"
      ) ||
      /\.(mp3|wav|m4a|webm|mpeg)$/i.test(
        file.name
      )
    ) {
      endpoint =
        "/api/upload-audio";
    }

    try {

      const response =
        await fetch(
          `${API}${endpoint}`,
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

      setAudit(
        data.audit
      );

      setSource(
        data.source
      );

      setPlan("");

      await runSimulation(
        saas,
        contractor
      );

    } catch (error) {

      alert(
        error.message
      );

    } finally {

      setUploading(false);
    }
  }

  function chooseFile() {

    fileInput.current?.click();
  }

  async function generateAdvice() {

    setLoading(true);

    try {

      const response =
        await fetch(
          `${API}/api/generate-plan`,
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

      setPlan(
        data.plan || ""
      );

    } catch (error) {

      alert(
        "Could not generate advice."
      );

    } finally {

      setLoading(false);
    }
  }

  async function translatePlan() {

    if (!plan) return;

    if (language === "English") {
      return;
    }

    try {

      const response =
        await fetch(
          `${API}/api/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              text: plan,
              language
            })
          }
        );

      const data =
        await response.json();

      setPlan(
        data.translation
      );

    } catch (error) {

      alert(
        "Translation failed."
      );
    }
  }

  function speakPlan() {

    if (!plan) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        plan
      );

    utterance.rate = 0.9;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function handleSliderChange(
    type,
    value
  ) {

    const numeric =
      Number(value);

    if (type === "saas") {
      setSaas(numeric);
      runSimulation(
        numeric,
        contractor
      );
    } else {
      setContractor(numeric);
      runSimulation(
        saas,
        numeric
      );
    }
  }

  const anomalies =
    audit?.anomalies || [];

  const recurring =
    audit?.recurring_charges || [];

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            W
          </div>

          <div>
            <strong>
              WealthBridge
            </strong>

            <span>
              FINANCIAL INTELLIGENCE
            </span>
          </div>

        </div>

        <div className="side-status">
          <span></span>
          AI ENGINE ONLINE
        </div>

        <nav>

          <div className="nav-item active">
            <b>◈</b>
            Overview
          </div>

          <div className="nav-item">
            <b>◫</b>
            Transactions
          </div>

          <div className="nav-item">
            <b>◉</b>
            Cash Flow
          </div>

          <div className="nav-item">
            <b>◇</b>
            AI Advisor
          </div>

          <div className="nav-item">
            <b>◎</b>
            What-If Lab
          </div>

        </nav>

        <div className="sidebar-bottom">

          <div>
            WEALTHBRIDGE
          </div>

          <small>
            SME COMMAND CENTER
          </small>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>
            <span className="eyebrow">
              BUSINESS COMMAND CENTER
            </span>

            <h1>
              Financial Intelligence
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

              {languages.map(
                (item) => (
                  <option
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

            <div className="online">
              <span></span>
              AI ONLINE
            </div>

          </div>

        </header>


        {/* UPLOAD PANEL */}

        <section className="import-panel">

          <div className="import-copy">

            <span className="number">
              01
            </span>

            <div>

              <span className="eyebrow">
                IMPORT YOUR DATA
              </span>

              <h2>
                Bring your business
                <br />
                ledger into focus.
              </h2>

              <p>
                Upload a CSV, receipt,
                bank statement image,
                or financial voice note.
              </p>

            </div>

          </div>

          <div className="upload-zone">

            <input
              ref={fileInput}
              type="file"
              hidden
              accept="
                .csv,
                image/png,
                image/jpeg,
                image/webp,
                audio/mpeg,
                audio/wav,
                audio/mp4,
                audio/webm,
                .mp3,
                .wav,
                .m4a
              "
              onChange={(e) =>
                uploadFile(
                  e.target.files[0]
                )
              }
            />

            <button
              className="upload-button"
              onClick={chooseFile}
              disabled={uploading}
            >

              <span className="upload-icon">
                ↑
              </span>

              <span>

                {uploading
                  ? "PROCESSING..."
                  : "CHOOSE DATA"}

              </span>

            </button>

            <div className="formats">

              CSV
              <span>•</span>
              IMAGE
              <span>•</span>
              VOICE

            </div>

          </div>

        </section>


        {fileName && (

          <div className="file-status">

            <span>
              ✓
            </span>

            <strong>
              {fileName}
            </strong>

            <small>
              {source
                ? `${source.toUpperCase()} ANALYZED`
                : "READY"}
            </small>

          </div>

        )}


        {/* METRICS */}

        <section className="metrics">

          <Metric
            label="TOTAL INFLOW"
            value={money(
              audit?.total_inflow
            )}
            icon="↑"
          />

          <Metric
            label="TOTAL OUTFLOW"
            value={money(
              audit?.total_outflow
            )}
            icon="↓"
          />

          <Metric
            label="NET CASH FLOW"
            value={money(
              audit?.net_cash_flow
            )}
            icon="◆"
          />

          <Metric
            label="REVENUE VOLATILITY"
            value={
              audit?.revenue_volatility ||
              "—"
            }
            icon="!"
            risk
          />

        </section>


        {/* ANALYSIS GRID */}

        <section className="analysis-grid">

          <div className="panel">

            <div className="panel-heading">

              <div>
                <span className="eyebrow">
                  RISK SIGNALS
                </span>

                <h3>
                  Spending anomalies
                </h3>
              </div>

              <span className="count">
                {anomalies.length}
              </span>

            </div>

            <div className="anomaly-list">

              {anomalies.length === 0 ? (

                <div className="empty">
                  No statistical anomalies detected.
                </div>

              ) : (

                anomalies
                  .slice(0, 6)
                  .map(
                    (item) => (

                      <div
                        className="anomaly"
                        key={item.tx_id}
                      >

                        <div className="warning">
                          !
                        </div>

                        <div>

                          <strong>
                            {item.merchant}
                          </strong>

                          <small>
                            [{item.tx_id}]
                          </small>

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


          <div className="panel">

            <div className="panel-heading">

              <div>
                <span className="eyebrow">
                  FIXED COMMITMENTS
                </span>

                <h3>
                  Recurring costs
                </h3>
              </div>

            </div>

            <div className="recurring-list">

              {recurring
                .slice(0, 6)
                .map(
                  (item) => (

                    <div
                      className="recurring"
                      key={item.merchant}
                    >

                      <div>

                        <strong>
                          {item.merchant}
                        </strong>

                        <small>
                          {item.category}
                        </small>

                      </div>

                      <div>

                        <b>
                          {money(
                            item.monthly_avg
                          )}
                        </b>

                        <small>
                          / MONTH
                        </small>

                      </div>

                    </div>

                  )
                )}

            </div>

          </div>

        </section>


        {/* WHAT IF */}

        <section className="whatif">

          <div className="section-title">

            <span className="number">
              02
            </span>

            <div>

              <span className="eyebrow">
                SCENARIO SIMULATION
              </span>

              <h2>
                What-If Finance Lab
              </h2>

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

            <Slider
              label="SaaS reduction"
              value={saas}
              onChange={(value) =>
                handleSliderChange(
                  "saas",
                  value
                )
              }
            />

            <Slider
              label="Contractor reduction"
              value={contractor}
              onChange={(value) =>
                handleSliderChange(
                  "contractor",
                  value
                )
              }
            />

          </div>


          <div className="scenario-footer">

            <span>
              Current net
              <b>
                {money(
                  simulation?.original_net
                )}
              </b>
            </span>

            <span>
              Simulated net
              <b className="green">
                {money(
                  simulation?.adjusted_net
                )}
              </b>
            </span>

          </div>

        </section>


        {/* AI ADVISOR */}

        <section className="advisor">

          <div className="advisor-heading">

            <div>

              <span className="number">
                03
              </span>

              <span className="eyebrow">
                AI FINANCIAL ADVISOR
              </span>

              <h2>
                Turn the ledger into
                <br />
                an action plan.
              </h2>

            </div>

            <div className="advisor-actions">

              <button
                className="primary"
                onClick={
                  generateAdvice
                }
                disabled={loading}
              >

                {loading
                  ? "ANALYZING..."
                  : "GENERATE ADVICE →"}

              </button>

              {plan && (

                <>
                  <button
                    className="secondary"
                    onClick={
                      translatePlan
                    }
                  >
                    🌐 {language}
                  </button>

                  <button
                    className="secondary"
                    onClick={
                      speakPlan
                    }
                  >
                    🔊 Listen
                  </button>
                </>

              )}

            </div>

          </div>


          {plan ? (

            <div className="advice">

              <div className="ai-badge">
                ✦ AI ANALYSIS
              </div>

              <pre>
                {plan}
              </pre>

            </div>

          ) : (

            <div className="advice-placeholder">

              <span>
                ✦
              </span>

              <p>
                Generate an evidence-based
                financial action plan from
                the current ledger.
              </p>

            </div>

          )}

        </section>


        <footer>

          <span>
            WEALTHBRIDGE
          </span>

          <span>
            AI-POWERED SME FINANCIAL INTELLIGENCE
          </span>

          <span>
            2026
          </span>

        </footer>

      </main>

    </div>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function Metric({
  label,
  value,
  icon,
  risk
}) {

  return (

    <div className="metric">

      <div className="metric-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong
          className={
            risk ? "risk-value" : ""
          }
        >
          {value}
        </strong>

      </div>

    </div>

  );
}


function Slider({
  label,
  value,
  onChange
}) {

  return (

    <div className="slider-row">

      <div className="slider-label">

        <span>
          {label}
        </span>

        <b>
          {value}%
        </b>

      </div>

      <input
        type="range"
        min="0"
        max="50"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      />

    </div>

  );
}