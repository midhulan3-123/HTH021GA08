import json
import os

from google import genai


def process_image(file_path):

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

Analyze this uploaded financial image.

It may contain:
- receipt
- invoice
- bank transaction
- business expense
- payment information
- ledger screenshot

Extract useful financial information.

Return ONLY valid JSON in this structure:

{
  "transactions": [
    {
      "tx_id": "IMG-001",
      "date": "YYYY-MM-DD",
      "merchant": "merchant name",
      "category": "category",
      "amount": 0,
      "transaction_type": "expense"
    }
  ]
}

If a value is unavailable, make it an empty string.

Do not invent transactions.
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