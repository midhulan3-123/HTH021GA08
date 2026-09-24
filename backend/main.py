import os
import io
import json
import base64
import tempfile

import pandas as pd

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional

from dotenv import load_dotenv

from engine import (
    generate_synthetic_transactions,
    normalize_dataframe,
    audit_transactions,
    synthesize_advice
)

load_dotenv()


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="WealthBridge Financial Intelligence API",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATA
# ============================================================

current_df = generate_synthetic_transactions(
    800
)


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
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "online",
        "service": "WealthBridge",
        "version": "2.0.0"
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

    return audit_transactions(
        current_df
    )


# ============================================================
# CSV UPLOAD
# ============================================================

@app.post("/api/upload-csv")
async def upload_csv(
    file: UploadFile = File(...)
):

    global current_df

    filename = (
        file.filename or ""
    ).lower()

    if not filename.endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="File exceeds 10 MB."
        )

    try:

        df = pd.read_csv(
            io.BytesIO(contents)
        )

        current_df = normalize_dataframe(
            df
        )

        audit = audit_transactions(
            current_df
        )

        return {
            "status": "success",
            "source": "csv",
            "filename": file.filename,
            "count": len(current_df),
            "audit": audit
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"CSV processing failed: {error}"
        )


# ============================================================
# IMAGE UPLOAD
# ============================================================

@app.post("/api/upload-image")
async def upload_image(
    file: UploadFile = File(...)
):

    global current_df

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if not api_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "OPENAI_API_KEY is missing "
                "from backend/.env"
            )
        )

    allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed:

        raise HTTPException(
            status_code=400,
            detail="Use JPG, PNG or WEBP."
        )

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Image exceeds 10 MB."
        )

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=api_key
        )

        encoded = base64.b64encode(
            contents
        ).decode("utf-8")

        mime = file.content_type

        prompt = """
Extract financial transactions from this image.

The image may contain a bank statement,
invoice, receipt or ledger.

Return ONLY valid JSON.

Format:

{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "merchant": "merchant name",
      "category": "category",
      "amount": -100.00,
      "type": "DEBIT"
    }
  ]
}

Rules:

- Expenses must be negative.
- Income must be positive.
- Do not invent missing values.
- Use "Other" when category is unclear.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    f"data:{mime};"
                                    f"base64,{encoded}"
                                )
                            }
                        }
                    ]
                }
            ],
            temperature=0
        )

        text = (
            response.choices[0]
            .message
            .content
        )

        text = text.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        extracted = json.loads(
            text
        )

        transactions = extracted.get(
            "transactions",
            []
        )

        if not transactions:

            raise ValueError(
                "No transactions found in image."
            )

        df = pd.DataFrame(
            transactions
        )

        current_df = normalize_dataframe(
            df
        )

        audit = audit_transactions(
            current_df
        )

        return {
            "status": "success",
            "source": "image",
            "filename": file.filename,
            "count": len(current_df),
            "audit": audit
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Image processing failed: {error}"
        )


# ============================================================
# AUDIO / VOICE UPLOAD
# ============================================================

@app.post("/api/upload-audio")
async def upload_audio(
    file: UploadFile = File(...)
):

    global current_df

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if not api_key:

        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY missing."
        )

    allowed_extensions = [
        ".mp3",
        ".wav",
        ".m4a",
        ".webm",
        ".mp4",
        ".mpeg"
    ]

    filename = (
        file.filename or ""
    ).lower()

    if not any(
        filename.endswith(ext)
        for ext in allowed_extensions
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Use MP3, WAV, M4A, WEBM or MPEG audio."
            )
        )

    contents = await file.read()

    if len(contents) > 25 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Audio exceeds 25 MB."
        )

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=api_key
        )

        suffix = os.path.splitext(
            filename
        )[1] or ".mp3"

        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False
        ) as temp:

            temp.write(contents)
            temp_path = temp.name

        try:

            with open(
                temp_path,
                "rb"
            ) as audio_file:

                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )

            spoken_text = transcript.text

        finally:

            if os.path.exists(
                temp_path
            ):
                os.remove(
                    temp_path
                )

        extraction_prompt = f"""
Convert this spoken financial information
into transaction records.

Spoken information:

{spoken_text}

Return ONLY valid JSON:

{{
  "transactions": [
    {{
      "date": "YYYY-MM-DD",
      "merchant": "merchant",
      "category": "category",
      "amount": -100.00,
      "type": "DEBIT"
    }}
  ]
}}

Rules:
- Expenses are negative.
- Revenue is positive.
- Do not invent information.
- If date is not spoken, use today's date.
- Use "Other" when category is unclear.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": extraction_prompt
                }
            ],
            temperature=0
        )

        text = (
            response.choices[0]
            .message
            .content
        )

        text = text.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        extracted = json.loads(
            text
        )

        df = pd.DataFrame(
            extracted.get(
                "transactions",
                []
            )
        )

        if df.empty:

            raise ValueError(
                "No financial transactions found in voice."
            )

        current_df = normalize_dataframe(
            df
        )

        audit = audit_transactions(
            current_df
        )

        return {
            "status": "success",
            "source": "voice",
            "filename": file.filename,
            "transcript": spoken_text,
            "count": len(current_df),
            "audit": audit
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Voice processing failed: {error}"
        )


# ============================================================
# AI ADVICE
# ============================================================

@app.post("/api/generate-plan")
def generate_plan(
    req: AdviceRequest
):

    audit = audit_transactions(
        current_df
    )

    plan = synthesize_advice(
        audit,
        req.api_key
    )

    return {
        "plan": plan
    }


# ============================================================
# WHAT IF
# ============================================================

@app.post("/api/what-if")
def what_if(
    req: WhatIfRequest
):

    audit = audit_transactions(
        current_df
    )

    saas = audit[
        "category_totals"
    ].get(
        "Software/SaaS",
        0
    )

    contractors = audit[
        "category_totals"
    ].get(
        "Contractors",
        0
    )

    savings = (
        saas *
        req.saas_reduction_pct /
        100
    ) + (
        contractors *
        req.contractor_reduction_pct /
        100
    )

    adjusted = (
        audit["net_cash_flow"] +
        savings
    )

    return {
        "projected_savings": round(
            savings,
            2
        ),
        "original_net": audit[
            "net_cash_flow"
        ],
        "adjusted_net": round(
            adjusted,
            2
        )
    }


# ============================================================
# TRANSLATION
# ============================================================

@app.post("/api/translate")
def translate(
    req: TranslateRequest
):

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if not api_key:

        return {
            "translation": req.text
        }

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=api_key
        )

        prompt = f"""
Translate the following financial report
into {req.language}.

Keep:
- transaction IDs
- dollar amounts
- headings
- numbers
- financial meaning

Do not add information.

Text:

{req.text}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        return {
            "translation": (
                response.choices[0]
                .message
                .content
            )
        }

    except Exception:

        return {
            "translation": req.text
        }


# ============================================================
# REGENERATE DEMO
# ============================================================

@app.post("/api/regenerate")
def regenerate(
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


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )