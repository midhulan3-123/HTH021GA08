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

from engine import (
    generate_synthetic_transactions,
    audit_transactions,
    synthesize_advice
)


app = FastAPI(
    title="WealthBridge SME Financial Advisor API",
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATA
# =========================================================

current_df = generate_synthetic_transactions(800)


# =========================================================
# MODELS
# =========================================================

class AdviceRequest(BaseModel):
    api_key: Optional[str] = None


class WhatIfRequest(BaseModel):
    saas_reduction_pct: float
    contractor_reduction_pct: float


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "service": "WealthBridge"
    }


# =========================================================
# TRANSACTIONS
# =========================================================

@app.get("/api/transactions")
def get_transactions():

    return current_df.to_dict(
        orient="records"
    )


# =========================================================
# AUDIT
# =========================================================

@app.get("/api/audit")
def get_audit():

    return audit_transactions(
        current_df
    )


# =========================================================
# UPLOAD CSV / IMAGE / AUDIO
# =========================================================

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    global current_df

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    filename = file.filename.lower()

    if "." not in filename:
        raise HTTPException(
            status_code=400,
            detail="File extension missing."
        )

    extension = (
        "."
        + filename.rsplit(".", 1)[1]
    )

    allowed = {
        ".csv",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".mp3",
        ".wav",
        ".m4a"
    }

    if extension not in allowed:

        raise HTTPException(
            status_code=400,
            detail=(
                "Supported files: "
                "CSV, JPG, PNG, WEBP, "
                "MP3, WAV and M4A."
            )
        )

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 10 MB."
        )


    # =====================================================
    # CSV
    # =====================================================

    if extension == ".csv":

        try:

            df = pd.read_csv(
                io.BytesIO(contents)
            )

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=f"Invalid CSV: {exc}"
            )


        # Normalize column names

        df.columns = [
            str(column)
            .strip()
            .lower()
            .replace(" ", "_")
            for column in df.columns
        ]


        # Common column names

        rename_map = {
            "transaction_id": "tx_id",
            "id": "tx_id",
            "transaction_date": "date",
            "timestamp": "date",
            "description": "merchant",
            "vendor": "merchant",
            "amount_usd": "amount",
            "value": "amount"
        }

        df = df.rename(
            columns=rename_map
        )


        required = {
            "date",
            "amount",
            "merchant",
            "category"
        }

        missing = required - set(
            df.columns
        )

        if missing:

            raise HTTPException(
                status_code=400,
                detail=(
                    "CSV is missing columns: "
                    + ", ".join(
                        sorted(missing)
                    )
                )
            )


        # Transaction ID

        if "tx_id" not in df.columns:

            df["tx_id"] = [
                f"UP-{i + 1:05d}"
                for i in range(len(df))
            ]


        # Amount

        df["amount"] = pd.to_numeric(
            df["amount"],
            errors="coerce"
        )

        df = df.dropna(
            subset=["amount"]
        )


        # Date

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


        # Type

        if "type" not in df.columns:

            df["type"] = df["amount"].apply(
                lambda x:
                    "CREDIT"
                    if x > 0
                    else "DEBIT"
            )


        current_df = df[
            [
                "tx_id",
                "date",
                "merchant",
                "category",
                "amount",
                "type"
            ]
        ].copy()


        audit_data = audit_transactions(
            current_df
        )


        return {
            "status": "success",
            "file_type": "csv",
            "filename": file.filename,
            "rows": len(current_df),
            "audit": audit_data
        }


    # =====================================================
    # IMAGE
    # =====================================================

    if extension in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }:

        return {
            "status": "success",
            "file_type": "image",
            "filename": file.filename,
            "message": (
                "Image received successfully. "
                "Connect OCR/Vision processing "
                "to extract transactions."
            )
        }


    # =====================================================
    # AUDIO
    # =====================================================

    if extension in {
        ".mp3",
        ".wav",
        ".m4a"
    }:

        return {
            "status": "success",
            "file_type": "audio",
            "filename": file.filename,
            "message": (
                "Audio received successfully. "
                "Connect speech-to-text processing "
                "to extract transactions."
            )
        }


# =========================================================
# REGENERATE DEMO DATA
# =========================================================

@app.post("/api/regenerate")
def regenerate_data(
    rows: int = 800
):

    global current_df

    current_df = (
        generate_synthetic_transactions(
            rows
        )
    )

    return {
        "status": "success",
        "count": len(current_df)
    }


# =========================================================
# AI FINANCIAL PLAN
# =========================================================

@app.post("/api/generate-plan")
def generate_plan(
    req: AdviceRequest
):

    audit_data = audit_transactions(
        current_df
    )

    plan = synthesize_advice(
        audit_data,
        api_key=req.api_key
    )

    return {
        "plan": plan
    }


# =========================================================
# WHAT-IF
# =========================================================

@app.post("/api/what-if")
def what_if(
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
        saas_total
        * (
            req.saas_reduction_pct
            / 100
        )
    ) + (
        contractor_total
        * (
            req.contractor_reduction_pct
            / 100
        )
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

        "original_net": round(
            audit_data[
                "net_cash_flow"
            ],
            2
        ),

        "adjusted_net": round(
            adjusted_net,
            2
        )
    }


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )