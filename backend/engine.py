import json
import os

from google import genai


def synthesize_advice(
    audit_data: dict,
    language: str = "English"
):

    api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    if not api_key:
        return (
            "Gemini API key is not configured. "
            "Add GEMINI_API_KEY to backend/.env."
        )

    client = genai.Client(
        api_key=api_key
    )

    prompt = f"""
You are WealthBridge, an SME financial advisor.

Analyze this audited business data:

{json.dumps(audit_data, indent=2)}

Write a practical financial action plan.

Language:
{language}

Requirements:

1. Mention important transaction IDs.
2. Mention exact amounts.
3. Explain inflow and outflow.
4. Explain revenue volatility.
5. Identify unusual spending.
6. Identify recurring expenses.
7. Suggest realistic cost-saving actions.
8. Do not invent information.
9. Keep the advice easy to understand.
10. Use headings and bullet points.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        return response.text

    except Exception as error:

        return (
            "Gemini advice generation failed.\n\n"
            + str(error)
        )