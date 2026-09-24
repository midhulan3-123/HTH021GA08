from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import io

from engine import (
    generate_synthetic_transactions,
    audit_transactions,
    synthesize_advice
)

app = FastAPI(
    title="WealthBridge Financial Intelligence API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default demo data
current_df = generate_synthetic_transactions(800)


class AdviceRequest(BaseModel):
    api_key: Optional[str] = None


class WhatIfRequest(BaseModel):
    saas_reduction_pct: float
    contractor_reduction_pct: float


def normalize_uploaded_csv(df: pd.DataFrame) -> pd.DataFrame:

    # Clean column names
    df.columns = [
        str(col).strip().lower().replace(" ", "_")
        for col in df.columns
    ]

    # Possible column names
    aliases = {
        "transaction_id": "tx_id",
        "id": "tx_id",
        "transaction": "tx_id",

        "transaction_date": "date",
        "timestamp": "date",

        "description": "merchant",
        "vendor": "merchant",
        "payee": "merchant",

        "type": "type",

        "value": "amount",
        "price": "amount",
        "transaction_amount": "amount"
    }

    df = df.rename(columns=aliases)

    required = ["date", "amount", "merchant", "category"]

    missing = [
        column for column in required
        if column not in df.columns
    ]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Missing columns: "
                + ", ".join(missing)
                + ". Required columns are: "
                + ", ".join(required)
            )
        )

    # Create transaction ID if missing
    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"UPLOAD-{i + 1:04d}"
            for i in range(len(df))
        ]

    # Convert amount
    df["amount"] = (
        df["amount"]
        .astype(str)
        .str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
    )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["amount"]
    )

    # Convert dates
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["date"]
    )

    df["date"] = (
        df["date"]
        .dt.strftime("%Y-%m-%d")
    )

    # Merchant/category cleanup
    df["merchant"] = (
        df["merchant"]
        .fillna("Unknown")
        .astype(str)
    )

    df["category"] = (
        df["category"]
        .fillna("Other")
        .astype(str)
    )

    # Determine transaction type
    if "type" not in df.columns:

        df["type"] = df["amount"].apply(
            lambda x:
            "CREDIT"
            if x > 0
            else "DEBIT"
        )

    else:

        df["type"] = (
            df["type"]
            .fillna("")
            .astype(str)
            .str.upper()
        )

        df.loc[
            df["type"].isin(["INCOME", "CREDIT", "CR"]),
            "type"
        ] = "CREDIT"

        df.loc[
            df["type"].isin(["EXPENSE", "DEBIT", "DR"]),
            "type"
        ] = "DEBIT"

    return df[
        [
            "tx_id",
            "date",
            "merchant",
            "category",
            "amount",
            "type"
        ]
    ].reset_index(drop=True)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "WealthBridge Financial Intelligence"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/api/transactions")
def get_transactions():
    return current_df.to_dict(
        orient="records"
    )


@app.post("/api/upload")
async def upload_csv(
    file: UploadFile = File(...)
):

    global current_df

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    try:

        content = await file.read()

        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File must be smaller than 10 MB."
            )

        uploaded_df = pd.read_csv(
            io.BytesIO(content)
        )

        current_df = normalize_uploaded_csv(
            uploaded_df
        )

        audit = audit_transactions(
            current_df
        )

        return {
            "status": "success",
            "filename": file.filename,
            "rows": len(current_df),
            "audit": audit
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Could not process CSV: {str(e)}"
        )


@app.post("/api/regenerate")
def regenerate_data(rows: int = 800):

    global current_df

    current_df = generate_synthetic_transactions(
        rows
    )

    return {
        "status": "success",
        "count": len(current_df)
    }


@app.get("/api/audit")
def get_audit():

    return audit_transactions(
        current_df
    )


@app.post("/api/generate-plan")
def get_plan(
    req: AdviceRequest
):

    audit_data = audit_transactions(
        current_df
    )

    plan_text = synthesize_advice(
        audit_data,
        api_key=req.api_key
    )

    return {
        "plan": plan_text
    }


@app.post("/api/what-if")
def simulate(
    req: WhatIfRequest
):

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

    savings = (
        saas_total *
        (req.saas_reduction_pct / 100)
    ) + (
        contractor_total *
        (req.contractor_reduction_pct / 100)
    )

    adjusted_net = (
        audit_data["net_cash_flow"]
        + savings
    )

    return {
        "projected_savings": round(
            savings,
            2
        ),
        "original_net": audit_data[
            "net_cash_flow"
        ],
        "adjusted_net": round(
            adjusted_net,
            2
        )
    }


if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )