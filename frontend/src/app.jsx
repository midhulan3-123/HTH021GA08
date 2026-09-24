import React, { useEffect, useState } from "react";
import "./index.css";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function App() {

  const [audit, setAudit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [saasCut, setSaasCut] = useState(15);
  const [contractorCut, setContractorCut] = useState(10);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {

    try {

      const response = await fetch(
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

      runWhatIf(
        15,
        10
      );

    } catch (error) {

      setError(
        "Backend connection failed. Start FastAPI on port 8000."
      );
    }
  }

  function validateFile(file) {

    if (!file) return;

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    const allowed = [
      "csv",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "mp3",
      "wav",
      "m4a"
    ];

    if (!allowed.includes(extension)) {

      setError(
        "Use CSV, JPG, JPEG, PNG, WEBP, MP3, WAV or M4A."
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Maximum file size is 10 MB."
      );

      return;
    }

    setSelectedFile(file);

    if (extension === "csv") {
      setFileType("csv");
    } else if (
      ["jpg", "jpeg", "png", "webp"]
        .includes(extension)
    ) {
      setFileType("image");
    } else {
      setFileType("audio");
    }

    setError("");
  }

  function handleFileChange(event) {

    const file =
      event.target.files?.[0];

    validateFile(file);
  }

  async function handleAnalyzeFile() {

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

      if (
        data.file_type === "csv" &&
        data.audit
      ) {

        setAudit(
          data.audit
        );
      }

      setError("");

      console.log(
        "Upload result:",
        data
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        error.message ||
        "Unable to upload file."
      );

    } finally {

      setUploading(false);
    }
  }

  async function runWhatIf(
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
        error
      );
    }
  }

  function changeSaas(value) {

    const number =
      Number(value);

    setSaasCut(number);

    runWhatIf(
      number,
      contractorCut
    );
  }

  function changeContractor(value) {

    const number =
      Number(value);

    setContractorCut(number);

    runWhatIf(
      saasCut,
      number
    );
  }

  async function generateAdvice() {

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
                "application/json"
            },
            body: JSON.stringify({
              api_key: null
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Advice generation failed."
        );
      }

      setPlan(
        data.plan || ""
      );

    } catch (error) {

      setError(
        error.message
      );

    } finally {

      setLoadingPlan(false);
    }
  }

  const money = (value) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }
    ).format(
      Number(value || 0)
    );

  return (
    <div className="app-shell">

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

          <button className="nav-item active">
            ◈ Overview
          </button>

          <button className="nav-item">
            ◫ Transactions
          </button>

          <button className="nav-item">
            ◉ Cash Flow
          </button>

          <button className="nav-item">
            ◇ AI Advisor
          </button>

          <button className="nav-item">
            ◎ What-If
          </button>

        </nav>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <div className="eyebrow">
              FINANCIAL INTELLIGENCE
            </div>

            <h1>
              Business Command Center
            </h1>
          </div>

          <div className="top-status">
            ● AI ONLINE
          </div>

        </header>

        {error && (
          <div className="error-banner">
            ⚠ {error}
          </div>
        )}

        <section className="upload-card">

          <div className="section-tag">
            DATA INGESTION
          </div>

          <h2>
            Import Your Business Data
          </h2>

          <p>
            Upload CSV, image or audio files.
            WealthBridge will process your data.
          </p>

          <div className="drop-zone">

            <div className="upload-icon">
              ↑
            </div>

            <strong>
              Drop your file here
            </strong>

            <span>
              or browse files
            </span>

            <label
              htmlFor="file-upload"
              className="browse-button"
            >
              Choose File
            </label>

            <input
              id="file-upload"
              type="file"
              hidden
              accept=".csv,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a"
              onChange={handleFileChange}
            />

            <small>
              CSV • JPG • PNG • WEBP • MP3 • WAV • M4A
              <br />
              Maximum 10 MB
            </small>

          </div>

          {selectedFile && (
            <div className="selected-file">

              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {fileType.toUpperCase()}
              </span>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileType("");
                }}
              >
                ×
              </button>

            </div>
          )}

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
              : "Analyze Data →"}
          </button>

        </section>

        {audit && (
          <section className="kpi-grid">

            <div className="kpi-card">
              <span>↑ INFLOW</span>

              <strong>
                {money(
                  audit.total_inflow
                )}
              </strong>

              <small>
                Recorded revenue
              </small>
            </div>

            <div className="kpi-card">
              <span>↓ OUTFLOW</span>

              <strong>
                {money(
                  audit.total_outflow
                )}
              </strong>

              <small>
                Operational spending
              </small>
            </div>

            <div className="kpi-card highlight">
              <span>◆ NET</span>

              <strong>
                {money(
                  audit.net_cash_flow
                )}
              </strong>

              <small>
                Cash position
              </small>
            </div>

            <div className="kpi-card">
              <span>! RISK</span>

              <strong>
                {audit.revenue_volatility}
              </strong>

              <small>
                Revenue volatility
              </small>
            </div>

          </section>
        )}

        <section className="finance-lab">

          <div className="section-tag">
            SCENARIO ENGINE
          </div>

          <h2>
            What-If Finance Lab
          </h2>

          <p>
            Test expense reductions before
            making a decision.
          </p>

          <div className="slider-row">

            <span>
              SaaS Reduction
            </span>

            <strong>
              {saasCut}%
            </strong>

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

            <span>
              Contractor Reduction
            </span>

            <strong>
              {contractorCut}%
            </strong>

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

          {simulation && (
            <div className="scenario-bottom">

              <div>
                <span>
                  PROJECTED SAVINGS
                </span>

                <strong>
                  {money(
                    simulation.projected_savings
                  )}
                </strong>
              </div>

              <div>
                <span>
                  ADJUSTED NET
                </span>

                <strong>
                  {money(
                    simulation.adjusted_net
                  )}
                </strong>
              </div>

            </div>
          )}

        </section>

        <section className="advisor-panel">

          <div className="section-tag">
            INTELLIGENCE LAYER
          </div>

          <h2>
            AI Advisor
          </h2>

          <p>
            Grounded financial recommendations
            generated from your ledger.
          </p>

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
              : "Generate Advice →"}
          </button>

          {plan && (
            <div className="advice-box">
              {plan}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}