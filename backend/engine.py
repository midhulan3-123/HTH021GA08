import os
import json
import numpy as np
import pandas as pd

from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# 1. GENERATE SYNTHETIC TRANSACTIONS
# ============================================================

def generate_synthetic_transactions(
    num_records: int = 800
) -> pd.DataFrame:

    np.random.seed(42)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

    dates = [
        start_date + timedelta(
            days=int(x)
        )
        for x in np.random.uniform(
            0, 180, num_records
        )
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

        cur_month_date = (
            start_date
            + timedelta(days=30 * month + 5)
        )

        records.append({
            "tx_id":
                f"TX-SUB-AWS-{month}",

            "date":
                cur_month_date,

            "merchant":
                "AWS Cloud",

            "category":
                "Software/SaaS",

            "amount":
                -450.0,

            "type":
                "DEBIT"
        })

        records.append({
            "tx_id":
                f"TX-SUB-HUB-{month}",

            "date":
                cur_month_date
                + timedelta(days=2),

            "merchant":
                "HubSpot",

            "category":
                "Software/SaaS",

            "amount":
                -800.0,

            "type":
                "DEBIT"
        })

    # --------------------------------------------------------
    # Revenue
    # --------------------------------------------------------

    for m in range(6):

        rev_date = (
            start_date
            + timedelta(
                days=30 * m
                + int(
                    np.random.choice(
                        [2, 18, 27]
                    )
                )
            )
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
            "tx_id":
                f"TX-REV-{m}",

            "date":
                rev_date,

            "merchant":
                "Client Alpha Settlement",

            "category":
                "Revenue/Client Invoices",

            "amount":
                rev_amount,

            "type":
                "CREDIT"
        })

    # --------------------------------------------------------
    # Known anomalies
    # --------------------------------------------------------

    records.append({
        "tx_id":
            "TX-ANOMALY-01",

        "date":
            end_date - timedelta(days=12),

        "merchant":
            "Dev Studio LLC",

        "category":
            "Contractors",

        "amount":
            -6500.0,

        "type":
            "DEBIT"
    })

    records.append({
        "tx_id":
            "TX-ANOMALY-02",

        "date":
            end_date - timedelta(days=20),

        "merchant":
            "Starbucks",

        "category":
            "Travel & Meals",

        "amount":
            -480.0,

        "type":
            "DEBIT"
    })

    # --------------------------------------------------------
    # Remaining transactions
    # --------------------------------------------------------

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

            amt = round(
                float(
                    np.random.uniform(
                        2000,
                        8000
                    )
                ),
                2
            )

            ttype = "CREDIT"

        else:

            amt = -round(
                float(
                    np.random.exponential(
                        scale=120
                    ) + 15
                ),
                2
            )

            ttype = "DEBIT"

        records.append({
            "tx_id":
                f"TX-{i + 1000}",

            "date":
                dates[
                    i % len(dates)
                ],

            "merchant":
                merchant,

            "category":
                cat,

            "amount":
                amt,

            "type":
                ttype
        })

    df = pd.DataFrame(records)

    df["date"] = (
        pd.to_datetime(
            df["date"]
        )
        .dt.strftime("%Y-%m-%d")
    )

    return (
        df
        .sort_values("date")
        .reset_index(drop=True)
    )


# ============================================================
# 2. AUDIT TRANSACTIONS
# ============================================================

def audit_transactions(
    df: pd.DataFrame
) -> dict:

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
        abs(
            debits["amount"].sum()
        )
    )

    net_cash_flow = (
        total_inflow
        - total_outflow
    )

    # --------------------------------------------------------
    # Anomaly detection
    # --------------------------------------------------------

    anomalies = []

    for cat, group in debits.groupby(
        "category"
    ):

        if len(group) >= 5:

            median = (
                group["amount"]
                .median()
            )

            diff = (
                group["amount"]
                - median
            ).abs()

            mad = diff.median()

            if mad > 0:

                mod_z = (
                    0.6745
                    * diff
                    / mad
                )

                outliers = group[
                    mod_z > 3.0
                ]

                for _, r in outliers.iterrows():

                    anomalies.append({
                        "tx_id":
                            str(r["tx_id"]),

                        "date":
                            str(r["date"]),

                        "merchant":
                            str(r["merchant"]),

                        "category":
                            str(r["category"]),

                        "amount":
                            abs(
                                float(
                                    r["amount"]
                                )
                            ),

                        "reason":
                            (
                                "Spike against "
                                f"median "
                                f"(${abs(median):.2f})"
                            )
                    })

    # --------------------------------------------------------
    # Recurring charges
    # --------------------------------------------------------

    recurring = []

    for merchant, group in debits.groupby(
        "merchant"
    ):

        if len(group) >= 3:

            monthly_est = (
                abs(
                    group["amount"].sum()
                )
                / 6.0
            )

            recurring.append({
                "merchant":
                    str(merchant),

                "category":
                    str(
                        group[
                            "category"
                        ].iloc[0]
                    ),

                "frequency":
                    (
                        f"{len(group)} "
                        "transactions over "
                        "6 months"
                    ),

                "total_spent":
                    round(
                        float(
                            abs(
                                group[
                                    "amount"
                                ].sum()
                            )
                        ),
                        2
                    ),

                "monthly_avg":
                    round(
                        float(
                            monthly_est
                        ),
                        2
                    ),

                "sample_tx_id":
                    str(
                        group[
                            "tx_id"
                        ].iloc[0]
                    )
            })

    # --------------------------------------------------------
    # Revenue volatility
    # --------------------------------------------------------

    credits_copy = credits.copy()

    credits_copy[
        "month_year"
    ] = pd.to_datetime(
        credits_copy["date"]
    ).dt.to_period("M")

    monthly_rev = (
        credits_copy
        .groupby("month_year")["amount"]
        .sum()
    )

    rev_mean = (
        float(monthly_rev.mean())
        if len(monthly_rev) > 0
        else 0.0
    )

    rev_std = (
        float(monthly_rev.std())
        if len(monthly_rev) > 0
        else 0.0
    )

    volatility_ratio = (
        rev_std / rev_mean
        if rev_mean > 0
        else 0.0
    )

    # --------------------------------------------------------
    # Category totals
    # --------------------------------------------------------

    cat_totals = {
        k: round(
            float(abs(v)),
            2
        )

        for k, v in (
            debits
            .groupby("category")["amount"]
            .sum()
            .items()
        )
    }

    return {

        "total_inflow":
            round(
                total_inflow,
                2
            ),

        "total_outflow":
            round(
                total_outflow,
                2
            ),

        "net_cash_flow":
            round(
                net_cash_flow,
                2
            ),

        "revenue_volatility":
            (
                "High (Irregular SME)"
                if volatility_ratio > 0.4
                else "Stable"
            ),

        "anomalies":
            anomalies,

        "recurring_charges":
            sorted(
                recurring,
                key=lambda x:
                    x["total_spent"],
                reverse=True
            ),

        "category_totals":
            cat_totals
    }


# ============================================================
# 3. AI FINANCIAL ADVICE
# ============================================================

def synthesize_advice(
    audit_data: dict,
    api_key: str = None
) -> str:

    # IMPORTANT:
    # API key is NOT stored directly in this file.

    resolved_key = (
        api_key
        or os.getenv(
            "OPENAI_API_KEY"
        )
    )

    prompt = f"""
You are a senior SME CFO.

Analyze this audited client
transaction ledger:

{json.dumps(
    audit_data,
    indent=2
)}

TASK:

Write an actionable financial
action plan.

RULES:

1. Cite transaction IDs.
2. Include exact dollar amounts.
3. Discuss revenue volatility.
4. Identify unusual spending.
5. Identify recurring expenses.
6. Give practical cost-saving actions.
7. Avoid unsupported claims.
8. Base every recommendation
   on the supplied ledger.
"""

    # --------------------------------------------------------
    # OpenAI
    # --------------------------------------------------------

    if resolved_key:

        try:

            from openai import OpenAI

            client = OpenAI(
                api_key=resolved_key
            )

            response = (
                client.chat.completions.create(
                    model="gpt-4o-mini",

                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],

                    temperature=0.2
                )
            )

            return (
                response
                .choices[0]
                .message
                .content
            )

        except Exception as e:

            return (
                "AI API failed.\n\n"
                f"{e}\n\n"
                + _local_rules_engine(
                    audit_data
                )
            )

    # --------------------------------------------------------
    # No API key
    # --------------------------------------------------------

    return _local_rules_engine(
        audit_data
    )


# ============================================================
# 4. LOCAL FINANCIAL RULES ENGINE
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

    if anomalies:

        anomaly_text = "\n".join(
            [
                (
                    f"- [{a['tx_id']}] "
                    f"{a['merchant']} "
                    f"(${a['amount']:,.2f}) "
                    f"at {a['category']}"
                )

                for a in anomalies[:5]
            ]
        )

    else:

        anomaly_text = (
            "- No major anomalies detected."
        )

    if recurring:

        recurring_text = "\n".join(
            [
                (
                    f"- [{r['sample_tx_id']}] "
                    f"{r['merchant']}: "
                    f"${r['monthly_avg']:,.2f}/month"
                )

                for r in recurring[:5]
            ]
        )

    else:

        recurring_text = (
            "- No recurring charges detected."
        )

    # --------------------------------------------------------
    # Top recurring expense
    # --------------------------------------------------------

    if recurring:

        top = recurring[0]

        top_recurring = (
            f"{top['merchant']} "
            f"([{top['sample_tx_id']}]) "
            f"approximately "
            f"${top['monthly_avg']:,.2f}/month"
        )

    else:

        top_recurring = "None identified"

    # --------------------------------------------------------
    # Liquidity buffer
    # --------------------------------------------------------

    buffer_amount = min(
        data["total_outflow"] * 0.30,
        15000.0
    )

    return f"""
# Grounded Financial Plan

## 1. Cash Flow

Total recorded inflow:

${data['total_inflow']:,.2f}

Total recorded outflow:

${data['total_outflow']:,.2f}

Net cash flow:

${data['net_cash_flow']:,.2f}

Revenue volatility:

{data['revenue_volatility']}

---

## 2. Spending Anomalies

The following transactions require
review:

{anomaly_text}

---

## 3. Recurring Costs

{recurring_text}

Top recurring commitment:

{top_recurring}

---

## 4. Recommended Actions

1. Review the flagged anomaly
   transactions and verify their
   invoices or contracts.

2. Review recurring commitments,
   particularly the highest recurring
   merchant identified above.

3. Because revenue is
   {data['revenue_volatility'].lower()},
   maintain a liquidity buffer of
   approximately
   ${buffer_amount:,.2f}.

4. Compare SaaS and contractor
   spending against actual business
   usage before reducing expenses.

5. Continue monitoring unusual
   transaction amounts each month.

---

## 5. Evidence

This plan is based on the
transaction IDs and financial
figures contained in the
audited ledger.
"""