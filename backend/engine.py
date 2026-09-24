import os
import json
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# NORMALIZE TRANSACTIONS
# ============================================================

def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # Normalize column names
    df.columns = [
        str(col).strip().lower().replace(" ", "_")
        for col in df.columns
    ]

    # Common column aliases
    aliases = {
        "transaction_id": "tx_id",
        "id": "tx_id",
        "transaction_date": "date",
        "datetime": "date",
        "description": "merchant",
        "vendor": "merchant",
        "payee": "merchant",
        "value": "amount",
        "price": "amount",
        "cost": "amount",
        "type_of_transaction": "type",
    }

    for old, new in aliases.items():
        if old in df.columns and new not in df.columns:
            df.rename(columns={old: new}, inplace=True)

    # Required fields
    if "date" not in df.columns:
        df["date"] = datetime.now().strftime("%Y-%m-%d")

    if "merchant" not in df.columns:
        df["merchant"] = "Unknown"

    if "category" not in df.columns:
        df["category"] = "Other"

    if "amount" not in df.columns:
        raise ValueError(
            "Your file must contain an amount/value column."
        )

    # Convert amount
    df["amount"] = (
        df["amount"]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.replace("₹", "", regex=False)
        .str.replace("€", "", regex=False)
        .str.replace("£", "", regex=False)
        .str.strip()
    )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(subset=["amount"])

    # Date
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["date"] = df["date"].fillna(
        pd.Timestamp(datetime.now())
    )

    df["date"] = df["date"].dt.strftime("%Y-%m-%d")

    # ID
    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"TX-UPLOAD-{i + 1:04d}"
            for i in range(len(df))
        ]

    # Type
    if "type" not in df.columns:

        df["type"] = np.where(
            df["amount"] >= 0,
            "CREDIT",
            "DEBIT"
        )

    df["type"] = df["type"].astype(str).str.upper()

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


# ============================================================
# SYNTHETIC DEMO DATA
# ============================================================

def generate_synthetic_transactions(
    num_records: int = 800
) -> pd.DataFrame:

    np.random.seed(42)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

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

    for month in range(6):

        date = start_date + timedelta(
            days=30 * month + 5
        )

        records.append({
            "tx_id": f"TX-SUB-AWS-{month}",
            "date": date,
            "merchant": "AWS Cloud",
            "category": "Software/SaaS",
            "amount": -450.0,
            "type": "DEBIT"
        })

        records.append({
            "tx_id": f"TX-SUB-HUB-{month}",
            "date": date + timedelta(days=2),
            "merchant": "HubSpot",
            "category": "Software/SaaS",
            "amount": -800.0,
            "type": "DEBIT"
        })

    for m in range(6):

        rev_date = start_date + timedelta(
            days=30 * m + 10
        )

        rev_amount = float(
            np.random.choice(
                [12500, 18000, 4500, 22000]
            )
        )

        records.append({
            "tx_id": f"TX-REV-{m}",
            "date": rev_date,
            "merchant": "Client Alpha Settlement",
            "category": "Revenue/Client Invoices",
            "amount": rev_amount,
            "type": "CREDIT"
        })

    records.append({
        "tx_id": "TX-ANOMALY-01",
        "date": end_date - timedelta(days=12),
        "merchant": "Dev Studio LLC",
        "category": "Contractors",
        "amount": -6500,
        "type": "DEBIT"
    })

    records.append({
        "tx_id": "TX-ANOMALY-02",
        "date": end_date - timedelta(days=20),
        "merchant": "Starbucks",
        "category": "Travel & Meals",
        "amount": -480,
        "type": "DEBIT"
    })

    for i in range(
        len(records),
        num_records
    ):

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
            "date": start_date + timedelta(
                days=int(
                    np.random.uniform(
                        0,
                        180
                    )
                )
            ),
            "merchant": merchant,
            "category": cat,
            "amount": amount,
            "type": transaction_type
        })

    return normalize_dataframe(
        pd.DataFrame(records)
    )


# ============================================================
# FINANCIAL AUDIT
# ============================================================

def audit_transactions(
    df: pd.DataFrame
) -> dict:

    df = normalize_dataframe(df)

    debits = df[df["amount"] < 0].copy()
    credits = df[df["amount"] > 0].copy()

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

    # --------------------------------------------------------
    # ANOMALIES
    # --------------------------------------------------------

    anomalies = []

    for category, group in debits.groupby(
        "category"
    ):

        if len(group) < 5:
            continue

        median = group["amount"].median()

        diff = (
            group["amount"] -
            median
        ).abs()

        mad = diff.median()

        if mad <= 0:
            continue

        modified_z = (
            0.6745 *
            diff /
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
                    f"Spending spike against "
                    f"median ${abs(median):,.2f}"
                )
            })

    # --------------------------------------------------------
    # RECURRING
    # --------------------------------------------------------

    recurring = []

    for merchant, group in debits.groupby(
        "merchant"
    ):

        if len(group) >= 3:

            total = abs(
                group["amount"].sum()
            )

            recurring.append({
                "merchant": str(merchant),
                "category": str(
                    group["category"].iloc[0]
                ),
                "frequency": (
                    f"{len(group)} transactions"
                ),
                "total_spent": round(
                    float(total),
                    2
                ),
                "monthly_avg": round(
                    float(total / 6),
                    2
                ),
                "sample_tx_id": str(
                    group["tx_id"].iloc[0]
                )
            })

    # --------------------------------------------------------
    # VOLATILITY
    # --------------------------------------------------------

    if len(credits) > 0:

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

        revenue_mean = float(
            monthly_revenue.mean()
        )

        revenue_std = float(
            monthly_revenue.std()
        ) if len(monthly_revenue) > 1 else 0

        volatility_ratio = (
            revenue_std /
            revenue_mean
            if revenue_mean > 0
            else 0
        )

    else:

        volatility_ratio = 0

    revenue_volatility = (
        "High"
        if volatility_ratio > 0.4
        else "Stable"
    )

    category_totals = {
        str(category): round(
            float(abs(total)),
            2
        )
        for category, total
        in debits.groupby(
            "category"
        )["amount"].sum().items()
    }

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
        "revenue_volatility": revenue_volatility,
        "anomalies": anomalies,
        "recurring_charges": sorted(
            recurring,
            key=lambda x:
                x["total_spent"],
            reverse=True
        ),
        "category_totals": category_totals,
        "transaction_count": len(df)
    }


# ============================================================
# LOCAL ADVICE
# ============================================================

def _local_rules_engine(
    data: dict
) -> str:

    anomaly_text = ""

    for anomaly in data["anomalies"][:5]:

        anomaly_text += (
            f"- [{anomaly['tx_id']}] "
            f"{anomaly['merchant']} "
            f"${anomaly['amount']:,.2f}: "
            f"{anomaly['reason']}\n"
        )

    if not anomaly_text:
        anomaly_text = (
            "No major statistical anomalies detected.\n"
        )

    recurring = (
        data["recurring_charges"][:5]
    )

    recurring_text = ""

    for item in recurring:

        recurring_text += (
            f"- {item['merchant']}: "
            f"${item['monthly_avg']:,.2f}/month "
            f"[{item['sample_tx_id']}]\n"
        )

    if not recurring_text:
        recurring_text = "No major recurring costs detected.\n"

    buffer = min(
        data["total_outflow"] * 0.30,
        15000
    )

    return f"""
## WealthBridge Financial Intelligence Report

### 1. Cash Flow

Total inflow: **${data['total_inflow']:,.2f}**

Total outflow: **${data['total_outflow']:,.2f}**

Net cash flow: **${data['net_cash_flow']:,.2f}**

Revenue pattern: **{data['revenue_volatility']}**

### 2. Spending Anomalies

{anomaly_text}

### 3. Recurring Costs

{recurring_text}

### 4. Recommended Actions

1. Review the flagged transactions with their transaction IDs.
2. Review recurring subscriptions and negotiate unnecessary costs.
3. Maintain approximately **${buffer:,.2f}** as a liquidity buffer.
4. Monitor revenue because the ledger shows **{data['revenue_volatility']}** revenue behavior.
5. Re-run the audit after importing the next accounting period.
"""


# ============================================================
# OPENAI ADVICE
# ============================================================

def synthesize_advice(
    audit_data: dict,
    api_key: str | None = None
) -> str:

    resolved_key = (
        api_key or
        os.getenv("OPENAI_API_KEY")
    )

    if not resolved_key:
        return _local_rules_engine(
            audit_data
        )

    prompt = f"""
You are a senior SME CFO.

Analyze the following audited financial data:

{json.dumps(audit_data, indent=2)}

Create a concise financial action plan.

Requirements:

1. Cite transaction IDs whenever discussing transactions.
2. Include exact dollar figures.
3. Discuss cash flow.
4. Discuss revenue volatility.
5. Identify anomalies.
6. Identify recurring expenses.
7. Suggest practical actions.
8. Do not invent transactions or amounts.
9. Clearly distinguish observations from recommendations.
"""

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=resolved_key
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        return (
            response.choices[0]
            .message
            .content
        )

    except Exception as error:

        print(
            "OpenAI error:",
            error
        )

        return _local_rules_engine(
            audit_data
        )