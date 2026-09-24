import React, { useState } from "react";

import "./index.css";

const BACKEND_URL =
  "http://127.0.0.1:8000";

const LANGUAGES = [
  ["en", "English"],
  ["ta", "தமிழ்"],
  ["hi", "हिन्दी"],
  ["te", "తెలుగు"],
  ["ml", "മലയാളം"],
  ["kn", "ಕನ್ನಡ"],
  ["bn", "বাংলা"],
  ["fr", "Français"],
  ["es", "Español"],
  ["de", "Deutsch"],
  ["ja", "日本語"]
];

const TEXT = {
  en: {
    overview: "Overview",
    transactions: "Transactions",
    cashflow: "Cash Flow",
    advisor: "AI Advisor",
    whatif: "What-If",
    language: "Language",
    command: "Business Command Center",
    upload: "Import Your Business Data",
    description:
      "Upload CSV files, receipt images or voice recordings.",
    choose: "Choose File",
    analyze: "Analyze Data →",
    demo: "Use Demo Data",
    inflow: "Inflow",
    outflow: "Outflow",
    net: "Net",
    risk: "Risk",
    anomalies: "Spending Anomalies",
    recurring: "Recurring Costs",
    ledger: "Transaction Ledger",
    lab: "What-If Finance Lab",
    generate: "Generate Advice →",
    adviceText:
      "Grounded financial recommendations generated from your business data."
  },

  ta: {
    overview: "மேலோட்டம்",
    transactions: "பரிவர்த்தனைகள்",
    cashflow: "பணப்புழக்கம்",
    advisor: "AI ஆலோசகர்",
    whatif: "What-If",
    language: "மொழி",
    command: "வணிக கட்டுப்பாட்டு மையம்",
    upload: "வணிக தரவை பதிவேற்றவும்",
    description:
      "CSV கோப்புகள், ரசீது படங்கள் அல்லது குரல் பதிவுகளை பதிவேற்றவும்.",
    choose: "கோப்பை தேர்வு செய்க",
    analyze: "தரவை பகுப்பாய்வு செய்க →",
    demo: "Demo தரவு",
    inflow: "வரவு",
    outflow: "செலவு",
    net: "நிகர",
    risk: "ஆபத்து",
    anomalies: "அசாதாரண செலவுகள்",
    recurring: "தொடர்ச்சியான செலவுகள்",
    ledger: "பரிவர்த்தனை பதிவு",
    lab: "What-If நிதி ஆய்வகம்",
    generate: "ஆலோசனையை உருவாக்கு →",
    adviceText:
      "உங்கள் வணிக தரவை அடிப்படையாகக் கொண்ட நிதி பரிந்துரைகள்."
  },

  hi: {
    overview: "अवलोकन",
    transactions: "लेन-देन",
    cashflow: "कैश फ्लो",
    advisor: "AI सलाहकार",
    whatif: "What-If",
    language: "भाषा",
    command: "बिजनेस कमांड सेंटर",
    upload: "बिजनेस डेटा अपलोड करें",
    description:
      "CSV, रसीद की तस्वीर या वॉइस रिकॉर्डिंग अपलोड करें।",
    choose: "फाइल चुनें",
    analyze: "डेटा का विश्लेषण करें →",
    demo: "डेमो डेटा",
    inflow: "आवक",
    outflow: "खर्च",
    net: "नेट",
    risk: "जोखिम",
    anomalies: "असामान्य खर्च",
    recurring: "आवर्ती खर्च",
    ledger: "लेन-देन रिकॉर्ड",
    lab: "What-If वित्त लैब",
    generate: "सलाह बनाएं →",
    adviceText:
      "आपके बिजनेस डेटा से वित्तीय सुझाव।"
  }
};

export default function App() {

  const [language, setLanguage] =
    useState("en");

  const [activePage, setActivePage] =
    useState("overview");

  const [file, setFile] =
    useState(null);

  const [audit, setAudit] =
    useState(null);

  const [plan, setPlan] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saas, setSaas] =
    useState(15);

  const [contractor, setContractor] =
    useState(10);

  const [simulation, setSimulation] =
    useState(null);

  const t =
    TEXT[language] || TEXT.en;

  const money = (value) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }
    ).format(Number(value || 0));

  const uploadFile = async () => {

    if (!file) {
      setError(
        "Please select a file."
      );
      return;
    }

    setLoading(true);
    setError("");

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
          "Upload failed."
        );
      }

      setAudit(
        data.audit
      );

      setActivePage(
        "overview"
      );

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);
    }
  };

  const useDemo = async () => {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/regenerate`,
          {
            method: "POST"
          }
        );

      const data =
        await response.json();

      setAudit(
        data.audit
      );

    } catch (err) {

      setError(
        "Backend is not running."
      );
    }
  };

  const runWhatIf =
    async (
      saasValue = saas,
      contractorValue = contractor
    ) => {

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
                  Number(saasValue),

                contractor_reduction_pct:
                  Number(
                    contractorValue
                  )
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail
          );
        }

        setSimulation(
          data
        );

      } catch (err) {

        setError(
          err.message
        );
      }
    };

  const generateAdvice =
    async () => {

      setLoading(true);
      setError("");

      try {

        const languageName =
          LANGUAGES.find(
            x =>
              x[0] === language
          )?.[1] ||
          "English";

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
                language:
                  languageName
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail
          );
        }

        setPlan(
          data.plan
        );

      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);
      }
    };

  const nav = [
    [
      "overview",
      "◈",
      t.overview
    ],
    [
      "transactions",
      "◫",
      t.transactions
    ],
    [
      "cashflow",
      "◉",
      t.cashflow
    ],
    [
      "advisor",
      "◇",
      t.advisor
    ],
    [
      "whatif",
      "◎",
      t.whatif
    ]
  ];

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            W
          </div>

          <div>
            <strong>
              WealthBridge
            </strong>

            <small>
              SME FINANCIAL AI
            </small>
          </div>

        </div>

        <div className="engine">
          <span />
          AI ENGINE ONLINE
        </div>

        <nav>

          {nav.map(item => (

            <button
              key={item[0]}
              className={
                activePage === item[0]
                  ? "nav active"
                  : "nav"
              }
              onClick={() =>
                setActivePage(
                  item[0]
                )
              }
            >
              <span>
                {item[1]}
              </span>

              {item[2]}
            </button>

          ))}

        </nav>

        <div className="language">

          <label>
            {t.language}
          </label>

          <select
            value={language}
            onChange={e =>
              setLanguage(
                e.target.value
              )
            }
          >

            {LANGUAGES.map(
              item => (

                <option
                  key={item[0]}
                  value={item[0]}
                >
                  {item[1]}
                </option>

              )
            )}

          </select>

          <small>
            🔒 Secure local analysis
          </small>

        </div>

      </aside>

      <main>

        <header>

          <div>
            <span>
              FINANCIAL INTELLIGENCE
            </span>

            <h1>
              {t.command}
            </h1>
          </div>

          <b>
            ● AI ONLINE
          </b>

        </header>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {activePage ===
          "overview" && (

          <>

            <section className="upload-card">

              <div>

                <span className="tag">
                  DATA INGESTION
                </span>

                <h2>
                  {t.upload}
                </h2>

                <p>
                  {t.description}
                </p>

                <div className="dropbox">

                  <div className="upload-icon">
                    ↑
                  </div>

                  <strong>
                    {file
                      ? file.name
                      : "Drop your file here"}
                  </strong>

                  <span>
                    CSV • JPG • PNG • WEBP
                    • MP3 • WAV • M4A
                  </span>

                  <label>
                    {t.choose}

                    <input
                      type="file"
                      accept=".csv,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.mpeg,.mpga"
                      onChange={e =>
                        setFile(
                          e.target.files?.[0] ||
                          null
                        )
                      }
                    />
                  </label>

                </div>

                <div className="actions">

                  <button
                    onClick={
                      uploadFile
                    }
                    disabled={
                      loading ||
                      !file
                    }
                  >
                    {loading
                      ? "ANALYZING..."
                      : t.analyze}
                  </button>

                  <button
                    className="secondary"
                    onClick={
                      useDemo
                    }
                  >
                    {t.demo}
                  </button>

                </div>

              </div>

              <div className="pipeline">

                <span>
                  DATA PIPELINE
                </span>

                <div>
                  <b>01</b>
                  <strong>
                    IMPORT
                  </strong>
                  <small>
                    CSV / Image / Audio
                  </small>
                </div>

                <div>
                  <b>02</b>
                  <strong>
                    AUDIT
                  </strong>
                  <small>
                    Patterns
                  </small>
                </div>

                <div>
                  <b>03</b>
                  <strong>
                    ADVISE
                  </strong>
                  <small>
                    Gemini AI
                  </small>
                </div>

              </div>

            </section>

            {audit && (
              <Dashboard
                audit={audit}
                money={money}
                t={t}
              />
            )}

          </>
        )}

        {activePage ===
          "transactions" && (

          <section className="page-panel">

            <span className="tag">
              TRANSACTIONS
            </span>

            <h2>
              {t.ledger}
            </h2>

            <p>
              Business transactions from
              your uploaded data.
            </p>

            {!audit?.transactions?.length ? (

              <div className="empty">
                Upload a CSV, image or
                audio file first.
              </div>

            ) : (

              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>DATE</th>
                      <th>MERCHANT</th>
                      <th>CATEGORY</th>
                      <th>TYPE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>

                  <tbody>

                    {audit.transactions.map(
                      (row, i) => (

                        <tr key={i}>

                          <td>
                            {row.tx_id}
                          </td>

                          <td>
                            {row.date}
                          </td>

                          <td>
                            {row.merchant}
                          </td>

                          <td>
                            {row.category}
                          </td>

                          <td>
                            {row.transaction_type}
                          </td>

                          <td>
                            {money(
                              row.amount
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>
        )}

        {activePage ===
          "cashflow" && (

          <section className="page-panel">

            <span className="tag">
              CASH FLOW
            </span>

            <h2>
              Business Cash Position
            </h2>

            <p>
              Monitor the movement of
              business money.
            </p>

            <div className="cash-grid">

              <Stat
                title={t.inflow}
                value={money(
                  audit?.total_inflow
                )}
              />

              <Stat
                title={t.outflow}
                value={money(
                  audit?.total_outflow
                )}
              />

              <Stat
                title={t.net}
                value={money(
                  audit?.net_cash_flow
                )}
              />

            </div>

          </section>
        )}

        {activePage ===
          "whatif" && (

          <WhatIf
            audit={audit}
            saas={saas}
            contractor={contractor}
            setSaas={setSaas}
            setContractor={
              setContractor
            }
            simulation={simulation}
            runWhatIf={runWhatIf}
            money={money}
            t={t}
          />
        )}

        {activePage ===
          "advisor" && (

          <section className="page-panel advisor">

            <span className="tag">
              FINANCIAL INTELLIGENCE
            </span>

            <h2>
              {t.advisor}
            </h2>

            <p>
              {t.adviceText}
            </p>

            <button
              onClick={
                generateAdvice
              }
              disabled={loading}
            >
              {loading
                ? "GENERATING..."
                : t.generate}
            </button>

            {plan && (
              <div className="advice">
                {plan}
              </div>
            )}

          </section>
        )}

        <footer>
          WEALTHBRIDGE / SME FINANCIAL
          INTELLIGENCE
          <span>
            MULTIMODAL DATA ENGINE
          </span>
        </footer>

      </main>

    </div>
  );
}


function Dashboard({
  audit,
  money,
  t
}) {

  return (
    <>

      <section className="kpis">

        <Stat
          title={t.inflow}
          value={money(
            audit.total_inflow
          )}
        />

        <Stat
          title={t.outflow}
          value={money(
            audit.total_outflow
          )}
        />

        <Stat
          title={t.net}
          value={money(
            audit.net_cash_flow
          )}
        />

        <Stat
          title={t.risk}
          value={
            audit.revenue_volatility
              ?.includes("High")
              ? "HIGH"
              : "STABLE"
          }
        />

      </section>

      <section className="two-col">

        <div className="panel">

          <div className="panel-title">

            <div>
              <span>
                AUDIT SIGNALS
              </span>

              <h3>
                {t.anomalies}
              </h3>
            </div>

            <b>
              {audit.anomalies?.length ||
                0}
            </b>

          </div>

          {audit.anomalies?.map(
            (item, index) => (

              <div
                className="list-row"
                key={index}
              >

                <i>!</i>

                <div>
                  <strong>
                    {item.merchant}
                  </strong>

                  <small>
                    {item.tx_id}
                  </small>
                </div>

                <b>
                  {money(
                    item.amount
                  )}
                </b>

              </div>

            )
          )}

        </div>

        <div className="panel">

          <div className="panel-title">

            <div>
              <span>
                FIXED COMMITMENTS
              </span>

              <h3>
                {t.recurring}
              </h3>
            </div>

            <b>
              {audit.recurring_charges
                ?.length || 0}
            </b>

          </div>

          {audit.recurring_charges?.map(
            (item, index) => (

              <div
                className="list-row"
                key={index}
              >

                <i>$</i>

                <div>
                  <strong>
                    {item.merchant}
                  </strong>

                  <small>
                    {item.category}
                  </small>
                </div>

                <b>
                  {money(
                    item.monthly_avg
                  )}
                  /month
                </b>

              </div>

            )
          )}

        </div>

      </section>

    </>
  );
}


function Stat({
  title,
  value
}) {

  return (
    <div className="stat">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function WhatIf({
  audit,
  saas,
  contractor,
  setSaas,
  setContractor,
  simulation,
  runWhatIf,
  money,
  t
}) {

  return (
    <section className="page-panel">

      <span className="tag">
        SCENARIO ENGINE
      </span>

      <h2>
        {t.lab}
      </h2>

      <p>
        Test expense reductions before
        making a decision.
      </p>

      <div className="slider">

        <label>
          SaaS Reduction
          <b>{saas}%</b>
        </label>

        <input
          type="range"
          min="0"
          max="50"
          value={saas}
          onChange={e => {
            const value =
              Number(
                e.target.value
              );

            setSaas(value);

            runWhatIf(
              value,
              contractor
            );
          }}
        />

      </div>

      <div className="slider">

        <label>
          Contractor Reduction
          <b>
            {contractor}%
          </b>
        </label>

        <input
          type="range"
          min="0"
          max="50"
          value={contractor}
          onChange={e => {
            const value =
              Number(
                e.target.value
              );

            setContractor(value);

            runWhatIf(
              saas,
              value
            );
          }}
        />

      </div>

      <div className="cash-grid">

        <Stat
          title="CURRENT NET"
          value={money(
            simulation?.original_net ??
            audit?.net_cash_flow
          )}
        />

        <Stat
          title="PROJECTED SAVINGS"
          value={money(
            simulation?.projected_savings
          )}
        />

        <Stat
          title="ADJUSTED NET"
          value={money(
            simulation?.adjusted_net
          )}
        />

      </div>

    </section>
  );
}