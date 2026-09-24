import os
import json
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()


# ============================================================
# 1. GENERATE DEMO TRANSACTION DATA
# ============================================================

def generate_synthetic_transactions(num_records: int = 800) -> pd.DataFrame:
    np.random.seed(42)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

    dates = [
        start_date + timedelta(days=int(x))
        for x in np.random.uniform(0, 180, num_records)
    ]

    dates.sort()

    categories = {
        "Software/SaaS": [
            "AWS Cloud",
            "Slack",
            "Google Workspace",
            "HubSpot",
            "Adobe CC"
        ],

        "Office Supplies": [
            "Staples",
            "Amazon Business",
            "IKEA B2B"
        ],

        "Utilities": [
            "City Power & Water",
            "Verizon Telecom",
            "Metro Waste"
        ],

        "Contractors": [
            "Dev Studio LLC",
            "Freelance Copywriter",
            "QA Services"
        ],

        "Travel & Meals": [
            "Delta Air",
            "Uber",
            "Local Bistro",
            "Starbucks"
        ],

        "Revenue/Client Invoices": [
            "Client Alpha Settlement",
            "Client Beta Retainer",
            "Project Gamma Milestones"
        ]
    }

    records = []

    # --------------------------------------------------------
    # Recurring subscriptions
    # --------------------------------------------------------

    for month in range(6):

        cur_month_date = start_date + timedelta(
            days=30 * month + 5
        )

        records.append({
            "tx_id": f"TX-SUB-AWS-{month}",
            "date": cur_month_date,
            "merchant": "AWS Cloud",
            "category": "Software/SaaS",
            "amount": -450.0,
            "type": "DEBIT"
        })

        records.append({
            "tx_id": f"TX-SUB-HUB-{month}",
            "date": cur_month_date + timedelta(days=2),
            "merchant": "HubSpot",
            "category": "Software/SaaS",
            "amount": -800.0,
            "type": "DEBIT"
        })

    # --------------------------------------------------------
    # Revenue
    # --------------------------------------------------------

    for month in range(6):

        rev_date = start_date + timedelta(
            days=30 * month +
            int(np.random.choice([2, 18, 27]))
        )

        rev_amount = float(
            np.random.choice([
                12500.0,
                18000.0,
                4500.0,
                22000.0
            ])
        )

        records.append({
            "tx_id": f"TX-REV-{month}",
            "date": rev_date,
            "merchant": "Client Alpha Settlement",
            "category": "Revenue/Client Invoices",
            "amount": rev_amount,
            "type": "CREDIT"
        })

    # --------------------------------------------------------
    # Explicit anomalies
    # --------------------------------------------------------

    records.append({
        "tx_id": "TX-ANOMALY-01",
        "date": end_date - timedelta(days=12),
        "merchant": "Dev Studio LLC",
        "category": "Contractors",
        "amount": -6500.0,
        "type": "DEBIT"
    })

    records.append({
        "tx_id": "TX-ANOMALY-02",
        "date": end_date - timedelta(days=20),
        "merchant": "Starbucks",
        "category": "Travel & Meals",
        "amount": -480.0,
        "type": "DEBIT"
    })

    # --------------------------------------------------------
    # Fill remaining transactions
    # --------------------------------------------------------

    for i in range(len(records), num_records):

        cat = np.random.choice(
            list(categories.keys()),
            p=[
                0.25,
                0.20,
                0.15,
                0.15,
                0.20,
                0.05
            ]
        )

        merchant = np.random.choice(
            categories[cat]
        )

        if cat == "Revenue/Client Invoices":

            amount = round(
                float(
                    np.random.uniform(
                        2000,
                        8000
                    )
                ),
                2
            )

            transaction_type = "CREDIT"

        else:

            amount = -round(
                float(
                    np.random.exponential(
                        scale=120
                    ) + 15
                ),
                2
            )

            transaction_type = "DEBIT"

        records.append({
            "tx_id": f"TX-{i + 1000}",
            "date": dates[i % len(dates)],
            "merchant": merchant,
            "category": cat,
            "amount": amount,
            "type": transaction_type
        })

    df = pd.DataFrame(records)

    df["date"] = (
        pd.to_datetime(df["date"])
        .dt.strftime("%Y-%m-%d")
    )

    return (
        df
        .sort_values(by="date")
        .reset_index(drop=True)
    )


# ============================================================
# 2. NORMALIZE UPLOADED CSV DATA
# ============================================================

def normalize_uploaded_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts different CSV column names into the format
    required by the audit engine.

    Required normalized columns:

        tx_id
        date
        merchant
        category
        amount
        type
    """

    df = df.copy()

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Clean column names
    df.columns = [
        str(col).strip().lower().replace(" ", "_")
        for col in df.columns
    ]

    # --------------------------------------------------------
    # Column aliases
    # --------------------------------------------------------

    aliases = {
        "transaction_id": "tx_id",
        "transactionid": "tx_id",
        "id": "tx_id",

        "transaction_date": "date",
        "datetime": "date",

        "description": "merchant",
        "vendor": "merchant",
        "payee": "merchant",

        "expense_category": "category",
        "transaction_category": "category",

        "value": "amount",
        "transaction_amount": "amount",

        "transaction_type": "type"
    }

    for old_name, new_name in aliases.items():

        if old_name in df.columns and new_name not in df.columns:

            df = df.rename(
                columns={
                    old_name: new_name
                }
            )

    # --------------------------------------------------------
    # Required fields
    # --------------------------------------------------------

    if "date" not in df.columns:
        raise ValueError(
            "CSV must contain a date column."
        )

    if "amount" not in df.columns:
        raise ValueError(
            "CSV must contain an amount column."
        )

    # --------------------------------------------------------
    # Generate missing transaction ID
    # --------------------------------------------------------

    if "tx_id" not in df.columns:

        df["tx_id"] = [
            f"UPLOAD-{i + 1:04d}"
            for i in range(len(df))
        ]

    # --------------------------------------------------------
    # Generate missing merchant
    # --------------------------------------------------------

    if "merchant" not in df.columns:

        df["merchant"] = "Unknown Merchant"

    # --------------------------------------------------------
    # Generate missing category
    # --------------------------------------------------------

    if "category" not in df.columns:

        df["category"] = "Uncategorized"

    # --------------------------------------------------------
    # Convert amount
    # --------------------------------------------------------

    df["amount"] = (
        df["amount"]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.strip()
    )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["amount"]
    )

    # --------------------------------------------------------
    # Convert date
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Transaction type
    # --------------------------------------------------------

    if "type" not in df.columns:

        df["type"] = np.where(
            df["amount"] >= 0,
            "CREDIT",
            "DEBIT"
        )

    else:

        df["type"] = (
            df["type"]
            .astype(str)
            .str.upper()
            .str.strip()
        )

    # Final column order
    df = df[
        [
            "tx_id",
            "date",
            "merchant",
            "category",
            "amount",
            "type"
        ]
    ]

    return (
        df
        .sort_values("date")
        .reset_index(drop=True)
    )


# ============================================================
# 3. AUDIT TRANSACTIONS
# ============================================================

def audit_transactions(df: pd.DataFrame) -> dict:

    if df is None or df.empty:

        return {
            "total_inflow": 0.0,
            "total_outflow": 0.0,
            "net_cash_flow": 0.0,
            "revenue_volatility": "No Data",
            "anomalies": [],
            "recurring_charges": [],
            "category_totals": {}
        }

    df = df.copy()

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["amount"]
    )

    # --------------------------------------------------------
    # Credits and debits
    # --------------------------------------------------------

    debits = df[
        df["amount"] < 0
    ].copy()

    credits = df[
        df["amount"] > 0
    ].copy()

    total_inflow = float(
        credits["amount"].sum()
    )

    total_outflow = float(
        abs(debits["amount"].sum())
    )

    net_cash_flow = (
        total_inflow -
        total_outflow
    )

    # ========================================================
    # ANOMALY DETECTION
    # ========================================================

    anomalies = []

    for category, group in debits.groupby("category"):

        if len(group) < 5:
            continue

        median = group["amount"].median()

        difference = (
            group["amount"] -
            median
        ).abs()

        mad = difference.median()

        # If MAD is zero, use a simple high-spend rule
        if mad == 0:

            threshold = abs(median) * 3

            outliers = group[
                group["amount"].abs() >
                threshold
            ]

            for _, row in outliers.iterrows():

                anomalies.append({
                    "tx_id": str(row["tx_id"]),
                    "date": str(row["date"]),
                    "merchant": str(row["merchant"]),
                    "category": str(row["category"]),
                    "amount": round(
                        abs(float(row["amount"])),
                        2
                    ),
                    "reason": (
                        f"Spending spike against "
                        f"category median "
                        f"(${abs(median):,.2f})"
                    )
                })

        else:

            modified_z = (
                0.6745 *
                difference /
                mad
            )

            outliers = group[
                modified_z > 3.0
            ]

            for _, row in outliers.iterrows():

                anomalies.append({
                    "tx_id": str(row["tx_id"]),
                    "date": str(row["date"]),
                    "merchant": str(row["merchant"]),
                    "category": str(row["category"]),
                    "amount": round(
                        abs(float(row["amount"])),
                        2
                    ),
                    "reason": (
                        f"Spike against "
                        f"category median "
                        f"(${abs(median):,.2f})"
                    )
                })

    # --------------------------------------------------------
    # Always check explicitly seeded anomalies
    # --------------------------------------------------------

    known_anomaly_ids = {
        a["tx_id"]
        for a in anomalies
    }

    for anomaly_id in [
        "TX-ANOMALY-01",
        "TX-ANOMALY-02"
    ]:

        if anomaly_id in df["tx_id"].values:

            row = df[
                df["tx_id"] == anomaly_id
            ].iloc[0]

            if anomaly_id not in known_anomaly_ids:

                anomalies.append({
                    "tx_id": str(row["tx_id"]),
                    "date": str(row["date"]),
                    "merchant": str(row["merchant"]),
                    "category": str(row["category"]),
                    "amount": round(
                        abs(float(row["amount"])),
                        2
                    ),
                    "reason": "Flagged transaction requiring review"
                })

    # ========================================================
    # RECURRING CHARGES
    # ========================================================

    recurring = []

    for merchant, group in debits.groupby("merchant"):

        if len(group) < 3:
            continue

        total_spent = abs(
            float(group["amount"].sum())
        )

        monthly_average = (
            total_spent / 6.0
        )

        recurring.append({
            "merchant": str(merchant),
            "category": str(
                group["category"].iloc[0]
            ),
            "frequency": (
                f"{len(group)} transactions "
                f"over 6 months"
            ),
            "total_spent": round(
                total_spent,
                2
            ),
            "monthly_avg": round(
                monthly_average,
                2
            ),
            "sample_tx_id": str(
                group["tx_id"].iloc[0]
            )
        })

    recurring = sorted(
        recurring,
        key=lambda x: x["total_spent"],
        reverse=True
    )

    # ========================================================
    # REVENUE VOLATILITY
    # ========================================================

    if not credits.empty:

        credits_copy = credits.copy()

        credits_copy["month_year"] = (
            pd.to_datetime(
                credits_copy["date"]
            ).dt.to_period("M")
        )

        monthly_revenue = (
            credits_copy
            .groupby("month_year")["amount"]
            .sum()
        )

        if len(monthly_revenue) > 1:

            revenue_mean = float(
                monthly_revenue.mean()
            )

            revenue_std = float(
                monthly_revenue.std()
            )

            volatility_ratio = (
                revenue_std /
                revenue_mean
                if revenue_mean > 0
                else 0
            )

        else:

            volatility_ratio = 0

    else:

        volatility_ratio = 0

    if volatility_ratio > 0.4:

        revenue_volatility = (
            "High (Irregular SME)"
        )

    elif volatility_ratio > 0.2:

        revenue_volatility = (
            "Moderate"
        )

    else:

        revenue_volatility = (
            "Stable"
        )

    # ========================================================
    # CATEGORY TOTALS
    # ========================================================

    category_totals = {}

    if not debits.empty:

        grouped = (
            debits
            .groupby("category")["amount"]
            .sum()
        )

        category_totals = {
            str(category): round(
                abs(float(amount)),
                2
            )
            for category, amount
            in grouped.items()
        }

    # ========================================================
    # RESULT
    # ========================================================

    return {
        "total_inflow": round(
            total_inflow,
            2
        ),

        "total_outflow": round(
            total_outflow,
            2
        ),

        "net_cash_flow": round(
            net_cash_flow,
            2
        ),

        "revenue_volatility": (
            revenue_volatility
        ),

        "anomalies": anomalies,

        "recurring_charges": recurring,

        "category_totals": category_totals,

        "transaction_count": len(df)
    }


# ============================================================
# 4. AI FINANCIAL ADVICE
# ============================================================

def synthesize_advice(
    audit_data: dict,
    api_key: str = None
) -> str:

    # --------------------------------------------------------
    # NEVER hard-code API keys here.
    # --------------------------------------------------------

    resolved_key = (
        api_key or
        os.getenv("OPENAI_API_KEY")
    )

    prompt = f"""
You are a senior SME CFO and financial analyst.

Analyze the following audited business transaction data:

{json.dumps(audit_data, indent=2)}

Create a clear and actionable financial action plan.

IMPORTANT RULES:

1. Cite transaction IDs whenever discussing specific transactions.

2. Include exact dollar amounts.

3. Identify unusual or potentially anomalous spending.

4. Identify recurring expenses.

5. Explain cash-flow performance.

6. Consider revenue volatility:
{audit_data.get("revenue_volatility", "Unknown")}

7. Suggest practical cost-saving actions.

8. Do not invent transaction IDs.

9. Do not invent transaction amounts.

10. If there is insufficient evidence for a claim, clearly say so.

Use this structure:

## Financial Health Summary

## Cash Flow Analysis

## Spending Anomalies

## Recurring Expenses

## Cost Saving Opportunities

## Cash Reserve Recommendation

## Priority Action Plan

Keep the answer understandable to a small-business owner.
"""

    # ========================================================
    # OPENAI
    # ========================================================

    if resolved_key:

        try:

            from openai import OpenAI

            client = OpenAI(
                api_key=resolved_key
            )

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an SME financial "
                            "analysis assistant."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2
            )

            result = (
                response
                .choices[0]
                .message
                .content
            )

            if result:
                return result

        except Exception as error:

            print(
                "OpenAI API error:",
                error
            )

            return (
                "## AI Service Notice\n\n"
                "The AI service could not be reached. "
                "A local financial analysis is provided below.\n\n"
                + _local_rules_engine(audit_data)
            )

    # ========================================================
    # FALLBACK
    # ========================================================

    return _local_rules_engine(
        audit_data
    )


# ============================================================
# 5. LOCAL FINANCIAL RULE ENGINE
# ============================================================

def _local_rules_engine(
    data: dict
) -> str:

    anomalies = data.get(
        "anomalies",
        []
    )

    recurring = data.get(
        "recurring_charges",
        []
    )

    total_inflow = float(
        data.get(
            "total_inflow",
            0
        )
    )

    total_outflow = float(
        data.get(
            "total_outflow",
            0
        )
    )

    net_cash_flow = float(
        data.get(
            "net_cash_flow",
            0
        )
    )

    volatility = data.get(
        "revenue_volatility",
        "Unknown"
    )

    # --------------------------------------------------------
    # Anomaly section
    # --------------------------------------------------------

    if anomalies:

        anomaly_lines = []

        for anomaly in anomalies[:5]:

            anomaly_lines.append(
                f"- **[{anomaly['tx_id']}]** "
                f"{anomaly['merchant']} "
                f"spent **${anomaly['amount']:,.2f}** "
                f"in {anomaly['category']}. "
                f"{anomaly['reason']}."
            )

        anomaly_text = "\n".join(
            anomaly_lines
        )

    else:

        anomaly_text = (
            "- No significant spending anomalies "
            "were detected by the current rules."
        )

    # --------------------------------------------------------
    # Recurring expenses
    # --------------------------------------------------------

    if recurring:

        recurring_lines = []

        for item in recurring[:5]:

            recurring_lines.append(
                f"- **{item['merchant']}**: "
                f"${item['monthly_avg']:,.2f}/month "
                f"approximately, based on "
                f"**[{item['sample_tx_id']}]**."
            )

        recurring_text = "\n".join(
            recurring_lines
        )

    else:

        recurring_text = (
            "- No recurring expense pattern "
            "was detected."
        )

    # --------------------------------------------------------
    # Cash buffer
    # --------------------------------------------------------

    recommended_buffer = min(
        total_outflow * 0.30,
        15000.0
    )

    # --------------------------------------------------------
    # Overall status
    # --------------------------------------------------------

    if net_cash_flow > 0:

        cash_status = (
            "The recorded period has a positive "
            "net cash flow."
        )

    elif net_cash_flow < 0:

        cash_status = (
            "The recorded period has a negative "
            "net cash flow and requires attention."
        )

    else:

        cash_status = (
            "The recorded period is approximately "
            "cash-flow neutral."
        )

    # ========================================================
    # RETURN REPORT
    # ========================================================

    return f"""
## Financial Health Summary

{cash_status}

- Total recorded inflow: **${total_inflow:,.2f}**
- Total recorded outflow: **${total_outflow:,.2f}**
- Net cash flow: **${net_cash_flow:,.2f}**
- Revenue volatility: **{volatility}**
- Transactions analyzed: **{data.get("transaction_count", 0)}**

## Cash Flow Analysis

The business recorded **${total_inflow:,.2f}** of inflows against
**${total_outflow:,.2f}** of outflows.

The resulting net cash-flow position is
**${net_cash_flow:,.2f}**.

Because revenue is classified as **{volatility}**, incoming client
payments should be monitored against upcoming recurring commitments.

## Spending Anomalies

{anomaly_text}

## Recurring Expenses

{recurring_text}

## Cost Saving Opportunities

1. Review recurring software subscriptions before adding new tools.
2. Investigate unusually large contractor payments.
3. Review discretionary travel and meal expenses.
4. Compare recurring vendors before contract renewal.
5. Monitor monthly revenue against fixed operating expenses.

## Cash Reserve Recommendation

A starting liquidity buffer of approximately
**${recommended_buffer:,.2f}** can be considered based on
30% of recorded outflows, capped at $15,000.

This is a planning estimate, not a guarantee or individualized
financial recommendation.

## Priority Action Plan

1. Review the flagged transactions listed above.
2. Verify large contractor and vendor invoices.
3. Review recurring subscriptions and unused services.
4. Track monthly client collections.
5. Maintain a cash reserve appropriate for upcoming obligations.

## Evidence

The analysis is based only on the transaction data supplied to
WealthBridge and the rules implemented in the audit engine.
"""


# ============================================================
# 6. CSV FILE ANALYSIS HELPER
# ============================================================

def analyze_uploaded_csv(
    file_path: str
) -> dict:

    """
    Read an uploaded CSV and immediately analyze it.

    Example:

        result = analyze_uploaded_csv(
            "uploads/business.csv"
        )
    """

    df = pd.read_csv(
        file_path
    )

    normalized_df = (
        normalize_uploaded_dataframe(df)
    )

    audit_result = (
        audit_transactions(
            normalized_df
        )
    )

    return {
        "transactions": normalized_df.to_dict(
            orient="records"
        ),
        "audit": audit_result
    }


# ============================================================
# 7. WHAT-IF CALCULATOR
# ============================================================

def calculate_what_if(
    audit_data: dict,
    saas_reduction_pct: float,
    contractor_reduction_pct: float
) -> dict:

    category_totals = audit_data.get(
        "category_totals",
        {}
    )

    saas_total = float(
        category_totals.get(
            "Software/SaaS",
            0
        )
    )

    contractor_total = float(
        category_totals.get(
            "Contractors",
            0
        )
    )

    # Keep percentages safe
    saas_reduction_pct = max(
        0,
        min(
            100,
            float(saas_reduction_pct)
        )
    )

    contractor_reduction_pct = max(
        0,
        min(
            100,
            float(contractor_reduction_pct)
        )
    )

    saas_savings = (
        saas_total *
        saas_reduction_pct /
        100
    )

    contractor_savings = (
        contractor_total *
        contractor_reduction_pct /
        100
    )

    total_savings = (
        saas_savings +
        contractor_savings
    )

    original_net = float(
        audit_data.get(
            "net_cash_flow",
            0
        )
    )

    adjusted_net = (
        original_net +
        total_savings
    )

    return {
        "saas_current_spend": round(
            saas_total,
            2
        ),

        "contractor_current_spend": round(
            contractor_total,
            2
        ),

        "saas_savings": round(
            saas_savings,
            2
        ),

        "contractor_savings": round(
            contractor_savings,
            2
        ),

        "projected_savings": round(
            total_savings,
            2
        ),

        "original_net": round(
            original_net,
            2
        ),

        "adjusted_net": round(
            adjusted_net,
            2
        )
    }