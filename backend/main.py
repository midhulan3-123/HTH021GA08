import os

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from typing import Optional

from engine import (
    generate_synthetic_transactions,
    audit_transactions,
    synthesize_advice
)

from file_processor import (
    process_uploaded_file
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="WealthBridge Financial Advisor API",
    description="SME Financial Intelligence Backend",
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
# CURRENT DATA
# =========================================================

current_df = generate_synthetic_transactions(
    800
)


# =========================================================
# MODELS
# =========================================================

class AdviceRequest(BaseModel):

    api_key: Optional[str] = None


class WhatIfRequest(BaseModel):

    saas_reduction_pct: float

    contractor_reduction_pct: float


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "project": "WealthBridge",
        "message": "Financial Advisor API is running"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "service": "WealthBridge Backend"
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
# UPLOAD
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

    allowed_extensions = {
        ".csv",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".mp3",
        ".wav",
        ".m4a"
    }

    extension = os.path.splitext(
        filename
    )[1]

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use CSV, JPG, JPEG, PNG, "
                "WEBP, MP3, WAV or M4A."
            )
        )

    file_bytes = await file.read()

    # 10 MB
    if len(file_bytes) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=413,
            detail="Maximum file size is 10 MB."
        )

    try:

        result = process_uploaded_file(
            file_bytes,
            file.filename
        )

        # =================================================
        # CSV
        # =================================================

        if result.get("file_type") == "csv":

            uploaded_df = result["data"]

            if uploaded_df.empty:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "CSV contains no valid transactions."
                    )
                )

            current_df = uploaded_df

            audit_data = audit_transactions(
                current_df
            )

            return {
                "status": "success",
                "message": (
                    "CSV uploaded and analyzed successfully."
                ),
                "file_type": "csv",
                "filename": file.filename,
                "rows": len(current_df),
                "audit": audit_data
            }

        # =================================================
        # IMAGE
        # =================================================

        if result.get("file_type") == "image":

            return {
                "status": "success",
                "message": (
                    "Image uploaded successfully."
                ),
                "file_type": "image",
                "filename": file.filename,
                "saved_path": result.get(
                    "saved_path"
                )
            }

        # =================================================
        # AUDIO
        # =================================================

        if result.get("file_type") == "audio":

            return {
                "status": "success",
                "message": (
                    "Audio uploaded successfully."
                ),
                "file_type": "audio",
                "filename": file.filename,
                "saved_path": result.get(
                    "saved_path"
                )
            }

        raise HTTPException(
            status_code=400,
            detail="Unable to process file."
        )

    except HTTPException:
        raise

    except Exception as e:

        print(
            "UPLOAD ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# DEMO DATA
# =========================================================

@app.post("/api/regenerate")
def regenerate_data(
    rows: int = 800
):

    global current_df

    rows = max(
        10,
        min(rows, 10000)
    )

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
# AI PLAN
# =========================================================

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
        "status": "success",
        "plan": plan_text
    }


# =========================================================
# WHAT IF
# =========================================================

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
        (
            req.saas_reduction_pct /
            100.0
        )
    ) + (
        contractor_total *
        (
            req.contractor_reduction_pct /
            100.0
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
        "original_net": audit_data[
            "net_cash_flow"
        ],
        "adjusted_net": round(
            adjusted_net,
            2
        )
    }


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )