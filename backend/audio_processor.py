import json
import os

from google import genai


def process_audio(file_path):

    api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is missing."
        )

    client = genai.Client(
        api_key=api_key
    )

    uploaded = client.files.upload(
        file=file_path
    )

    prompt = """
You are a financial data extraction assistant.

Listen to this audio recording.

The recording may describe:
- sales
- revenue
- expenses
- payments
- purchases
- business transactions

Extract all financial transactions mentioned.

Return ONLY valid JSON:

{
  "transactions": [
    {
      "tx_id": "AUD-001",
      "date": "YYYY-MM-DD",
      "merchant": "merchant name",
      "category": "category",
      "amount": 0,
      "transaction_type": "income"
    }
  ]
}

Do not invent financial information.
If a value is unavailable, use an empty string.
"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=[
            prompt,
            uploaded
        ]
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace(
            "```json", ""
        ).replace(
            "```", ""
        ).strip()

    return json.loads(text)