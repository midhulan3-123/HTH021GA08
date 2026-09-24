import os
import io
import pandas as pd

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from dotenv import load_dotenv

from engine import (
    audit_transactions,
    synthesize_advice
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="WealthBridge API",
    description="SME Financial Intelligence API",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# GLOBAL AUDIT DATA
# ============================================================

current_audit = None


# ============================================================
# REQUEST MODEL
# ============================================================

class WhatIfRequest(BaseModel):

    saas_reduction_pct: float = 15

    contractor_reduction_pct: float = 10


class AdviceRequest(BaseModel):

    api_key: str | None = None


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "online",
        "service": "WealthBridge",
        "version": "2.0.0"
    }


# ============================================================
# GET CURRENT AUDIT
# ============================================================

@app.get("/api/audit")
def get_audit():

    global current_audit

    if current_audit is None:

        demo_df = create_demo_data()

        current_audit = audit_transactions(
            demo_df
        )

    return current_audit


# ============================================================
# CSV UPLOAD
# ============================================================

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    global current_audit

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    extension = (
        os.path.splitext(
            file.filename
        )[1]
        .lower()
    )

    if extension != ".csv":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV files are currently "
                "supported by the backend."
            )
        )

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    try:

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded CSV is empty."
            )

        # 10 MB limit
        if len(contents) > (
            10 * 1024 * 1024
        ):

            raise HTTPException(
                status_code=400,
                detail="Maximum file size is 10 MB."
            )

        df = pd.read_csv(
            io.BytesIO(contents)
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Could not read CSV: {str(e)}"
            )
        )

    # --------------------------------------------------------
    # Check rows
    # --------------------------------------------------------

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail="CSV contains no transaction rows."
        )

    # --------------------------------------------------------
    # Analyze
    # --------------------------------------------------------

    try:

        audit = audit_transactions(
            df
        )

        current_audit = audit

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Transaction analysis failed: {str(e)}"
            )
        )

    return {

        "success": True,

        "message":
            "CSV analyzed successfully.",

        "filename":
            file.filename,

        "rows":
            len(df),

        "audit":
            audit
    }


# ============================================================
# DEMO DATA
# ============================================================

@app.post("/api/regenerate")
def regenerate_demo():

    global current_audit

    df = create_demo_data()

    current_audit = audit_transactions(
        df
    )

    return {

        "success": True,

        "message":
            "Demo data generated.",

        "audit":
            current_audit
    }


# ============================================================
# WHAT-IF ANALYSIS
# ============================================================

@app.post("/api/what-if")
def what_if(
    request: WhatIfRequest
):

    global current_audit

    if current_audit is None:

        current_audit = audit_transactions(
            create_demo_data()
        )

    # Prevent invalid percentages
    saas_pct = max(
        0,
        min(
            100,
            request.saas_reduction_pct
        )
    )

    contractor_pct = max(
        0,
        min(
            100,
            request.contractor_reduction_pct
        )
    )

    original_net = float(
        current_audit[
            "net_cash_flow"
        ]
    )

    recurring = current_audit.get(
        "recurring_charges",
        []
    )

    saas_total = 0

    contractor_total = 0

    for item in recurring:

        category = (
            item
            .get("category", "")
            .lower()
        )

        merchant = (
            item
            .get("merchant", "")
            .lower()
        )

        monthly = float(
            item.get(
                "monthly_avg",
                0
            )
        )

        if (
            "saas" in category
            or "software" in category
            or "subscription" in category
            or "software" in merchant
        ):

            saas_total += monthly

        if (
            "contract" in category
            or "contractor" in category
            or "developer" in category
        ):

            contractor_total += monthly

    # If no categorized recurring expenses
    # were detected, use 0 rather than inventing data.

    saas_savings = (
        saas_total *
        saas_pct /
        100
    )

    contractor_savings = (
        contractor_total *
        contractor_pct /
        100
    )

    projected_savings = (
        saas_savings +
        contractor_savings
    )

    adjusted_net = (
        original_net +
        projected_savings
    )

    return {

        "saas_reduction_pct":
            saas_pct,

        "contractor_reduction_pct":
            contractor_pct,

        "saas_monthly_base":
            round(
                saas_total,
                2
            ),

        "contractor_monthly_base":
            round(
                contractor_total,
                2
            ),

        "saas_savings":
            round(
                saas_savings,
                2
            ),

        "contractor_savings":
            round(
                contractor_savings,
                2
            ),

        "projected_savings":
            round(
                projected_savings,
                2
            ),

        "original_net":
            round(
                original_net,
                2
            ),

        "adjusted_net":
            round(
                adjusted_net,
                2
            )
    }


# ============================================================
# AI ADVISOR
# ============================================================

@app.post("/api/generate-plan")
def generate_plan(
    request: AdviceRequest
):

    global current_audit

    if current_audit is None:

        current_audit = audit_transactions(
            create_demo_data()
        )

    # IMPORTANT:
    # API key can come from .env.
    # The frontend does not need to send it.

    api_key = (
        request.api_key
        or os.getenv(
            "OPENAI_API_KEY"
        )
    )

    plan = synthesize_advice(
        current_audit,
        api_key
    )

    return {

        "success": True,

        "plan":
            plan
    }


# ============================================================
# DEMO DATA
# ============================================================

def create_demo_data():

    data = [

        {
            "tx_id": "TX-1001",
            "date": "2026-09-01",
            "merchant": "Client Payment A",
            "category": "Sales",
            "amount": 15000,
            "type": "income"
        },

        {
            "tx_id": "TX-1002",
            "date": "2026-09-02",
            "merchant": "Dev Studio LLC",
            "category": "Contractors",
            "amount": 2400,
            "type": "expense"
        },

        {
            "tx_id": "TX-1003",
            "date": "2026-09-03",
            "merchant": "HubSpot",
            "category": "Software/SaaS",
            "amount": 800,
            "type": "expense"
        },

        {
            "tx_id": "TX-1004",
            "date": "2026-09-04",
            "merchant": "AWS Cloud",
            "category": "Software/SaaS",
            "amount": 1287,
            "type": "expense"
        },

        {
            "tx_id": "TX-1005",
            "date": "2026-09-05",
            "merchant": "Amazon Business",
            "category": "Office Supplies",
            "amount": 1715,
            "type": "expense"
        },

        {
            "tx_id": "TX-1006",
            "date": "2026-09-06",
            "merchant": "Client Payment B",
            "category": "Sales",
            "amount": 22000,
            "type": "income"
        },

        {
            "tx_id": "TX-1007",
            "date": "2026-09-07",
            "merchant": "Dev Studio LLC",
            "category": "Contractors",
            "amount": 2400,
            "type": "expense"
        },

        {
            "tx_id": "TX-1008",
            "date": "2026-09-08",
            "merchant": "HubSpot",
            "category": "Software/SaaS",
            "amount": 800,
            "type": "expense"
        },

        {
            "tx_id": "TX-1009",
            "date": "2026-09-09",
            "merchant": "Client Payment C",
            "category": "Sales",
            "amount": 18500,
            "type": "income"
        },

        {
            "tx_id": "TX-1010",
            "date": "2026-09-10",
            "merchant": "Dev Studio LLC",
            "category": "Contractors",
            "amount": 6500,
            "type": "expense"
        },

        {
            "tx_id": "TX-1011",
            "date": "2026-09-11",
            "merchant": "Starbucks",
            "category": "Travel & Meals",
            "amount": 1033,
            "type": "expense"
        },

        {
            "tx_id": "TX-1012",
            "date": "2026-09-12",
            "merchant": "Client Payment D",
            "category": "Sales",
            "amount": 19500,
            "type": "income"
        },

        {
            "tx_id": "TX-1013",
            "date": "2026-09-13",
            "merchant": "QA Services",
            "category": "Contractors",
            "amount": 673,
            "type": "expense"
        },

        {
            "tx_id": "TX-1014",
            "date": "2026-09-14",
            "merchant": "Dev Studio LLC",
            "category": "Contractors",
            "amount": 996,
            "type": "expense"
        },

        {
            "tx_id": "TX-1015",
            "date": "2026-09-15",
            "merchant": "Client Payment E",
            "category": "Sales",
            "amount": 17000,
            "type": "income"
        },

        {
            "tx_id": "TX-1016",
            "date": "2026-09-16",
            "merchant": "QA Services",
            "category": "Contractors",
            "amount": 460,
            "type": "expense"
        },

        {
            "tx_id": "TX-1017",
            "date": "2026-09-17",
            "merchant": "Dev Studio LLC",
            "category": "Contractors",
            "amount": 587,
            "type": "expense"
        },

        {
            "tx_id": "TX-1018",
            "date": "2026-09-18",
            "merchant": "Client Payment F",
            "category": "Sales",
            "amount": 21000,
            "type": "income"
        }

    ]

    return pd.DataFrame(data)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "WealthBridge API is running.",

        "docs":
            "/docs",

        "health":
            "/api/health"
    }