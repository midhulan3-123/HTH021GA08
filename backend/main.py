import os
import io
import pandas as pd

from typing import Optional

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
    generate_synthetic_transactions,
    audit_transactions,
    synthesize_advice
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="WealthBridge SME Financial Advisor",
    description=(
        "AI-powered SME financial analysis, "
        "CSV auditing, What-If simulation and translation API"
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# GLOBAL DATA
# ============================================================

current_df = generate_synthetic_transactions(800)


# ============================================================
# REQUEST MODELS
# ============================================================

class AdviceRequest(BaseModel):
    api_key: Optional[str] = None


class WhatIfRequest(BaseModel):
    saas_reduction_pct: float
    contractor_reduction_pct: float


class TranslateRequest(BaseModel):
    text: str
    language: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "project": "WealthBridge",
        "service": "SME Financial Advisor",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "online",
        "openai_configured": bool(OPENAI_API_KEY)
    }


# ============================================================
# TRANSACTIONS
# ============================================================

@app.get("/api/transactions")
def get_transactions():

    return current_df.to_dict(
        orient="records"
    )


# ============================================================
# AUDIT
# ============================================================

@app.get("/api/audit")
def get_audit():

    global current_df

    return audit_transactions(
        current_df
    )


# ============================================================
# REGENERATE DEMO DATA
# ============================================================

@app.post("/api/regenerate")
def regenerate_data(rows: int = 800):

    global current_df

    if rows < 10:
        raise HTTPException(
            status_code=400,
            detail="Minimum 10 rows required"
        )

    if rows > 10000:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10,000 rows allowed"
        )

    current_df = generate_synthetic_transactions(
        rows
    )

    return {
        "status": "success",
        "count": len(current_df)
    }


# ============================================================
# CSV UPLOAD
# ============================================================

@app.post("/api/upload")
async def upload_csv(
    file: UploadFile = File(...)
):

    global current_df

    # --------------------------------------------------------
    # Check filename
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported"
        )

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    try:

        file_content = await file.read()

        # 10 MB limit
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size cannot exceed 10 MB"
            )

        df = pd.read_csv(
            io.BytesIO(file_content)
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )


    # --------------------------------------------------------
    # Clean column names
    # --------------------------------------------------------

    df.columns = [
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        for column in df.columns
    ]


    # --------------------------------------------------------
    # Detect common column names
    # --------------------------------------------------------

    column_aliases = {

        "date": [
            "date",
            "transaction_date",
            "txn_date",
            "transactiondate"
        ],

        "amount": [
            "amount",
            "value",
            "transaction_amount",
            "transactionamount"
        ],

        "merchant": [
            "merchant",
            "description",
            "vendor",
            "payee",
            "name"
        ],

        "category": [
            "category",
            "type",
            "expense_category",
            "expense_type"
        ],

        "transaction_id": [
            "tx_id",
            "transaction_id",
            "transactionid",
            "id"
        ]
    }


    def find_column(
        possible_names
    ):

        for name in possible_names:

            if name in df.columns:
                return name

        return None


    date_column = find_column(
        column_aliases["date"]
    )

    amount_column = find_column(
        column_aliases["amount"]
    )

    merchant_column = find_column(
        column_aliases["merchant"]
    )

    category_column = find_column(
        column_aliases["category"]
    )

    transaction_id_column = find_column(
        column_aliases["transaction_id"]
    )


    # --------------------------------------------------------
    # Required columns
    # --------------------------------------------------------

    missing = []

    if not date_column:
        missing.append("date")

    if not amount_column:
        missing.append("amount")

    if not merchant_column:
        missing.append("merchant")

    if not category_column:
        missing.append("category")


    if missing:

        raise HTTPException(
            status_code=400,
            detail=(
                "Missing required columns: "
                + ", ".join(missing)
                + ". Required columns are: "
                "date, amount, merchant, category"
            )
        )


    # --------------------------------------------------------
    # Normalize dataframe
    # --------------------------------------------------------

    normalized = pd.DataFrame()


    # DATE

    normalized["date"] = pd.to_datetime(
        df[date_column],
        errors="coerce"
    )


    # AMOUNT

    normalized["amount"] = pd.to_numeric(
        df[amount_column],
        errors="coerce"
    )


    # MERCHANT

    normalized["merchant"] = (
        df[merchant_column]
        .fillna("Unknown Merchant")
        .astype(str)
    )


    # CATEGORY

    normalized["category"] = (
        df[category_column]
        .fillna("Uncategorized")
        .astype(str)
    )


    # TRANSACTION ID

    if transaction_id_column:

        normalized["tx_id"] = (
            df[transaction_id_column]
            .fillna("")
            .astype(str)
        )

    else:

        normalized["tx_id"] = [
            f"UPLOAD-{index + 1:05d}"
            for index in range(len(normalized))
        ]


    # --------------------------------------------------------
    # Remove invalid rows
    # --------------------------------------------------------

    normalized = normalized.dropna(
        subset=[
            "date",
            "amount"
        ]
    )


    if normalized.empty:

        raise HTTPException(
            status_code=400,
            detail="No valid transaction rows found"
        )


    # --------------------------------------------------------
    # Convert date
    # --------------------------------------------------------

    normalized["date"] = (
        normalized["date"]
        .dt.strftime("%Y-%m-%d")
    )


    # --------------------------------------------------------
    # Transaction type
    # --------------------------------------------------------

    normalized["type"] = normalized[
        "amount"
    ].apply(
        lambda value:
            "CREDIT"
            if value > 0
            else "DEBIT"
    )


    # --------------------------------------------------------
    # Sort
    # --------------------------------------------------------

    normalized = normalized.sort_values(
        by="date"
    ).reset_index(
        drop=True
    )


    # --------------------------------------------------------
    # Store uploaded data
    # --------------------------------------------------------

    current_df = normalized


    # --------------------------------------------------------
    # Run audit
    # --------------------------------------------------------

    audit_data = audit_transactions(
        current_df
    )


    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {

        "status": "success",

        "filename": file.filename,

        "count": len(current_df),

        "audit": audit_data,

        "transactions":
            current_df.to_dict(
                orient="records"
            )
    }


# ============================================================
# AI FINANCIAL PLAN
# ============================================================

@app.post("/api/generate-plan")
def get_plan(
    req: AdviceRequest
):

    global current_df

    audit_data = audit_transactions(
        current_df
    )

    # Do not expose the API key to frontend.
    # engine.py will use OPENAI_API_KEY
    # from .env.

    plan_text = synthesize_advice(
        audit_data,
        api_key=None
    )

    return {
        "plan": plan_text
    }


# ============================================================
# WHAT-IF ANALYSIS
# ============================================================

@app.post("/api/what-if")
def simulate(
    req: WhatIfRequest
):

    global current_df

    if req.saas_reduction_pct < 0:
        raise HTTPException(
            status_code=400,
            detail="SaaS reduction cannot be negative"
        )

    if req.contractor_reduction_pct < 0:
        raise HTTPException(
            status_code=400,
            detail="Contractor reduction cannot be negative"
        )

    if req.saas_reduction_pct > 100:
        raise HTTPException(
            status_code=400,
            detail="SaaS reduction cannot exceed 100%"
        )

    if req.contractor_reduction_pct > 100:
        raise HTTPException(
            status_code=400,
            detail="Contractor reduction cannot exceed 100%"
        )


    audit_data = audit_transactions(
        current_df
    )


    saas_total = audit_data[
        "category_totals"
    ].get(
        "Software/SaaS",
        0.0
    )


    contractor_total = audit_data[
        "category_totals"
    ].get(
        "Contractors",
        0.0
    )


    saas_savings = (
        saas_total
        *
        (
            req.saas_reduction_pct
            / 100.0
        )
    )


    contractor_savings = (
        contractor_total
        *
        (
            req.contractor_reduction_pct
            / 100.0
        )
    )


    savings = (
        saas_savings
        +
        contractor_savings
    )


    adjusted_net = (
        audit_data["net_cash_flow"]
        +
        savings
    )


    return {

        "projected_savings":
            round(
                savings,
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

        "original_net":
            audit_data[
                "net_cash_flow"
            ],

        "adjusted_net":
            round(
                adjusted_net,
                2
            )
    }


# ============================================================
# TRANSLATION
# ============================================================

SUPPORTED_LANGUAGES = {

    "English": "English",

    "Tamil": "Tamil",

    "Hindi": "Hindi",

    "Telugu": "Telugu",

    "Malayalam": "Malayalam",

    "Kannada": "Kannada",

    "Bengali": "Bengali",

    "French": "French",

    "Spanish": "Spanish",

    "German": "German",

    "Japanese": "Japanese"
}


@app.post("/api/translate")
def translate_text(
    req: TranslateRequest
):

    # --------------------------------------------------------
    # Validate text
    # --------------------------------------------------------

    if not req.text.strip():

        return {
            "translated_text": ""
        }


    # --------------------------------------------------------
    # Validate language
    # --------------------------------------------------------

    if req.language not in SUPPORTED_LANGUAGES:

        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )


    # --------------------------------------------------------
    # English requires no translation
    # --------------------------------------------------------

    if req.language == "English":

        return {
            "translated_text":
                req.text
        }


    # --------------------------------------------------------
    # API key
    # --------------------------------------------------------

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )


    if not api_key:

        return {
            "translated_text":
                req.text,

            "error":
                "OPENAI_API_KEY is not configured"
        }


    # --------------------------------------------------------
    # OpenAI translation
    # --------------------------------------------------------

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=api_key
        )


        prompt = f"""
Translate the following SME financial
analysis into {req.language}.

Rules:

1. Preserve all transaction IDs exactly.
2. Preserve all dollar amounts exactly.
3. Preserve all percentages exactly.
4. Preserve company and merchant names.
5. Do not change numerical values.
6. Do not add new information.
7. Do not remove financial information.
8. Keep headings and bullet structure.
9. Return only the translated text.

TEXT:

{req.text}
"""


        response = (
            client
            .chat
            .completions
            .create(

                model="gpt-4o-mini",

                messages=[
                    {
                        "role": "system",
                        "content":
                            "You are a professional "
                            "financial report translator."
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }
                ],

                temperature=0
            )
        )


        translated = (
            response
            .choices[0]
            .message
            .content
        )


        return {
            "translated_text":
                translated
        }


    except Exception as e:

        return {

            "translated_text":
                req.text,

            "error":
                f"Translation failed: {str(e)}"
        }


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )