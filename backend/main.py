import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from pydantic import BaseModel

from file_processor import (
    process_uploaded_file
)

from engine import (
    synthesize_advice
)


app = FastAPI(
    title="WealthBridge Multimodal SME Advisor",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


CURRENT_AUDIT = None


class WhatIfRequest(BaseModel):

    saas_reduction_pct: float = 15

    contractor_reduction_pct: float = 10


class AdviceRequest(BaseModel):

    language: str = "English"


@app.get("/api/health")
def health():

    return {
        "status": "online",
        "service": "WealthBridge",
        "gemini_configured": bool(
            os.getenv("GEMINI_API_KEY")
        )
    }


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    global CURRENT_AUDIT

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    allowed = {
        ".csv",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".mp3",
        ".wav",
        ".m4a",
        ".mpeg",
        ".mpga"
    }

    if extension not in allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                "Supported files: CSV, JPG, "
                "PNG, WEBP, MP3, WAV, M4A."
            )
        )

    try:

        result = process_uploaded_file(
            file
        )

        CURRENT_AUDIT = result["audit"]

        return {
            "success": True,
            "source_type":
                result["source_type"],
            "audit": CURRENT_AUDIT
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.get("/api/audit")
def get_audit():

    if CURRENT_AUDIT is None:

        return {
            "total_inflow": 0,
            "total_outflow": 0,
            "net_cash_flow": 0,
            "revenue_volatility": "Stable",
            "anomalies": [],
            "recurring_charges": [],
            "category_totals": {},
            "transactions": []
        }

    return CURRENT_AUDIT


@app.post("/api/what-if")
def what_if(
    request: WhatIfRequest
):

    if CURRENT_AUDIT is None:

        raise HTTPException(
            status_code=400,
            detail="Upload financial data first."
        )

    current_net = float(
        CURRENT_AUDIT[
            "net_cash_flow"
        ]
    )

    recurring = CURRENT_AUDIT.get(
        "recurring_charges",
        []
    )

    total_saas = 0
    total_contractors = 0

    for item in recurring:

        category = str(
            item.get("category", "")
        ).lower()

        amount = float(
            item.get("monthly_avg", 0)
        )

        if (
            "saas" in category
            or "software" in category
        ):
            total_saas += amount

        if (
            "contract" in category
            or "contractor" in category
        ):
            total_contractors += amount

    saas_saving = (
        total_saas
        * request.saas_reduction_pct
        / 100
    )

    contractor_saving = (
        total_contractors
        * request.contractor_reduction_pct
        / 100
    )

    projected_savings = (
        saas_saving
        + contractor_saving
    )

    adjusted_net = (
        current_net
        + projected_savings
    )

    return {
        "original_net": round(
            current_net,
            2
        ),

        "projected_savings": round(
            projected_savings,
            2
        ),

        "adjusted_net": round(
            adjusted_net,
            2
        ),

        "saas_saving": round(
            saas_saving,
            2
        ),

        "contractor_saving": round(
            contractor_saving,
            2
        )
    }


@app.post("/api/generate-plan")
def generate_plan(
    request: AdviceRequest
):

    if CURRENT_AUDIT is None:

        raise HTTPException(
            status_code=400,
            detail="Upload financial data first."
        )

    plan = synthesize_advice(
        CURRENT_AUDIT,
        request.language
    )

    return {
        "plan": plan
    }


@app.post("/api/regenerate")
def regenerate():

    global CURRENT_AUDIT

    CURRENT_AUDIT = {
        "total_inflow": 113000,
        "total_outflow": 19651,
        "net_cash_flow": 93349,
        "revenue_volatility": "Stable",

        "anomalies": [
            {
                "tx_id": "TX-1010",
                "merchant":
                    "Dev Studio LLC",
                "amount": 6500,
                "category":
                    "Contractors"
            }
        ],

        "recurring_charges": [
            {
                "merchant":
                    "Dev Studio LLC",
                "category":
                    "Contractors",
                "monthly_avg": 2577,
                "total_spent": 7731
            },
            {
                "merchant":
                    "HubSpot",
                "category":
                    "Software/SaaS",
                "monthly_avg": 800,
                "total_spent": 1600
            },
            {
                "merchant":
                    "QA Services",
                "category":
                    "Contractors",
                "monthly_avg": 567,
                "total_spent": 1701
            }
        ],

        "category_totals": {},

        "transactions": []
    }

    return {
        "success": True,
        "audit": CURRENT_AUDIT
    }