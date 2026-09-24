import os
import json
import pandas as pd
import numpy as np

from dotenv import load_dotenv

load_dotenv()


# ============================================================
# NORMALIZE CSV
# ============================================================

def normalize_transactions(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # Clean column names
    df.columns = [
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        for column in df.columns
    ]

    # Different possible names -> standard names
    aliases = {
        "transaction_id": "tx_id",
        "transactionid": "tx_id",
        "transaction": "tx_id",
        "id": "tx_id",

        "transaction_date": "date",
        "datetime": "date",

        "vendor": "merchant",
        "company": "merchant",
        "description": "merchant",

        "expense_category": "category",
        "type_category": "category",

        "value": "amount",
        "price": "amount",
        "total": "amount",

        "transaction_type": "type",
        "direction": "type",
    }

    for old_name, new_name in aliases.items():

        if (
            old_name in df.columns
            and new_name not in df.columns
        ):
            df[new_name] = df[old_name]

    # ========================================================
    # DEFAULT COLUMNS
    # ========================================================

    if "tx_id" not in df.columns:

        df["tx_id"] = [
            f"TX-{1001 + i}"
            for i in range(len(df))
        ]

    if "date" not in df.columns:
        df["date"] = pd.Timestamp.now()

    if "merchant" not in df.columns:
        df["merchant"] = "Unknown Merchant"

    if "category" not in df.columns:
        df["category"] = "Other"

    if "amount" not in df.columns:
        df["amount"] = 0

    if "type" not in df.columns:
        df["type"] = "expense"

    # ========================================================
    # AMOUNT
    # ========================================================

    df["amount"] = (
        df["amount"]
        .astype(str)
        .str.replace("$", "", regex=False)
        .str.replace("₹", "", regex=False)
        .str.replace("€", "", regex=False)
        .str.replace("£", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
    )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    ).fillna(0)

    # Absolute positive amount
    df["amount"] = df["amount"].abs()

    # ========================================================
    # TYPE
    # ========================================================

    df["type"] = (
        df["type"]
        .fillna("expense")
        .astype(str)
        .str.lower()
        .str.strip()
    )

    df["type"] = df["type"].replace({

        "income": "income",
        "revenue": "income",
        "credit": "income",
        "inflow": "income",
        "sale": "income",
        "sales": "income",

        "expense": "expense",
        "expenses": "expense",
        "debit": "expense",
        "outflow": "expense",
        "cost": "expense",
        "purchase": "expense",
    })

    # Unknown types become expense
    df.loc[
        ~df["type"].isin(
            ["income", "expense"]
        ),
        "type"
    ] = "expense"

    # ========================================================
    # DATE
    # ========================================================

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["date"] = df["date"].fillna(
        pd.Timestamp.now()
    )

    df["date"] = df["date"].dt.strftime(
        "%Y-%m-%d"
    )

    # ========================================================
    # TEXT FIELDS
    # ========================================================

    for column in [
        "tx_id",
        "merchant",
        "category"
    ]:

        df[column] = (
            df[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
        )

    # ========================================================
    # STANDARD ORDER
    # ========================================================

    return df[
        [
            "tx_id",
            "date",
            "merchant",
            "category",
            "amount",
            "type"
        ]
    ]


# ============================================================
# AUDIT TRANSACTIONS
# ============================================================

def audit_transactions(
    df: pd.DataFrame
) -> dict:

    df = normalize_transactions(df)

    # ========================================================
    # INFLOW / OUTFLOW
    # ========================================================

    income_df = df[
        df["type"] == "income"
    ]

    expense_df = df[
        df["type"] == "expense"
    ]

    total_inflow = float(
        income_df["amount"].sum()
    )

    total_outflow = float(
        expense_df["amount"].sum()
    )

    net_cash_flow = (
        total_inflow -
        total_outflow
    )

    # ========================================================
    # REVENUE VOLATILITY
    # ========================================================

    if len(income_df) >= 2:

        mean_revenue = float(
            income_df["amount"].mean()
        )

        std_revenue = float(
            income_df["amount"].std()
        )

        if mean_revenue > 0:

            volatility_ratio = (
                std_revenue /
                mean_revenue
            )

        else:

            volatility_ratio = 0

    else:

        volatility_ratio = 0

    if volatility_ratio > 0.40:

        revenue_volatility = (
            "High (Irregular SME)"
        )

    else:

        revenue_volatility = "Stable"

    # ========================================================
    # ANOMALIES
    # ========================================================

    anomalies = []

    if len(expense_df) > 0:

        mean_expense = float(
            expense_df["amount"].mean()
        )

        std_expense = float(
            expense_df["amount"].std()
        )

        if np.isnan(std_expense):
            std_expense = 0

        threshold = (
            mean_expense +
            (2 * std_expense)
        )

        anomaly_df = expense_df[
            expense_df["amount"] >
            threshold
        ]

        for _, row in anomaly_df.iterrows():

            anomalies.append({

                "tx_id": str(
                    row["tx_id"]
                ),

                "merchant": str(
                    row["merchant"]
                ),

                "category": str(
                    row["category"]
                ),

                "amount": round(
                    float(row["amount"]),
                    2
                ),

                "reason":
                    "Unusually high transaction"
            })

    # ========================================================
    # RECURRING COSTS
    # ========================================================

    recurring = []

    if len(expense_df) > 0:

        grouped = (
            expense_df
            .groupby(
                [
                    "merchant",
                    "category"
                ],
                dropna=False
            )
            .agg(
                count=("amount", "count"),
                total_spent=("amount", "sum"),
                monthly_avg=("amount", "mean")
            )
            .reset_index()
        )

        recurring_df = grouped[
            grouped["count"] >= 2
        ]

        for _, row in recurring_df.iterrows():

            recurring.append({

                "merchant": str(
                    row["merchant"]
                ),

                "category": str(
                    row["category"]
                ),

                "count": int(
                    row["count"]
                ),

                "total_spent": round(
                    float(
                        row["total_spent"]
                    ),
                    2
                ),

                "monthly_avg": round(
                    float(
                        row["monthly_avg"]
                    ),
                    2
                )
            })

    # ========================================================
    # CATEGORY TOTALS
    # ========================================================

    category_totals = {}

    if len(expense_df) > 0:

        category_group = (
            expense_df
            .groupby("category")["amount"]
            .sum()
        )

        for category, amount in (
            category_group.items()
        ):

            category_totals[
                str(category)
            ] = round(
                float(amount),
                2
            )

    # ========================================================
    # TRANSACTIONS
    # ========================================================

    transactions = []

    for _, row in df.iterrows():

        transactions.append({

            "tx_id": str(
                row["tx_id"]
            ),

            "date": str(
                row["date"]
            ),

            "merchant": str(
                row["merchant"]
            ),

            "category": str(
                row["category"]
            ),

            "amount": round(
                float(row["amount"]),
                2
            ),

            "type": str(
                row["type"]
            )
        })

    # ========================================================
    # FINAL AUDIT
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

        "revenue_volatility":
            revenue_volatility,

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
            category_totals,

        # IMPORTANT
        # Used by React Transactions page
        "transactions":
            transactions
    }


# ============================================================
# LOCAL ADVICE ENGINE
# ============================================================

def _local_rules_engine(
    audit_data: dict
) -> str:

    inflow = audit_data.get(
        "total_inflow",
        0
    )

    outflow = audit_data.get(
        "total_outflow",
        0
    )

    net = audit_data.get(
        "net_cash_flow",
        0
    )

    volatility = audit_data.get(
        "revenue_volatility",
        "Unknown"
    )

    anomalies = audit_data.get(
        "anomalies",
        []
    )

    recurring = audit_data.get(
        "recurring_charges",
        []
    )

    lines = []

    lines.append(
        "WEALTHBRIDGE FINANCIAL ADVISOR"
    )

    lines.append("")

    lines.append(
        f"Recorded inflow: "
        f"${inflow:,.2f}"
    )

    lines.append(
        f"Recorded outflow: "
        f"${outflow:,.2f}"
    )

    lines.append(
        f"Net cash flow: "
        f"${net:,.2f}"
    )

    lines.append(
        f"Revenue volatility: "
        f"{volatility}"
    )

    if anomalies:

        lines.append("")
        lines.append(
            "UNUSUAL TRANSACTIONS:"
        )

        for item in anomalies[:5]:

            lines.append(
                f"- {item['tx_id']} | "
                f"{item['merchant']} | "
                f"${item['amount']:,.2f}"
            )

    if recurring:

        lines.append("")
        lines.append(
            "RECURRING EXPENSES:"
        )

        for item in recurring[:5]:

            lines.append(
                f"- {item['merchant']} | "
                f"${item['monthly_avg']:,.2f}/month"
            )

    lines.append("")
    lines.append("RECOMMENDED ACTIONS:")

    if net < 0:

        lines.append(
            "1. Review major operating expenses."
        )

        lines.append(
            "2. Review recurring subscriptions."
        )

        lines.append(
            "3. Protect short-term cash reserves."
        )

    else:

        lines.append(
            "1. Review unusual transactions."
        )

        lines.append(
            "2. Review recurring expenses "
            "for possible savings."
        )

        lines.append(
            "3. Monitor revenue volatility."
        )

    return "\n".join(lines)


# ============================================================
# AI ADVICE
# ============================================================

def synthesize_advice(
    audit_data: dict,
    api_key: str = None
) -> str:

    resolved_key = (
        api_key
        or os.getenv(
            "OPENAI_API_KEY"
        )
    )

    prompt = f"""
You are a senior SME financial advisor.

Analyze this audited business data:

{json.dumps(audit_data, indent=2)}

Create a practical financial action plan.

Rules:

1. Cite transaction IDs when discussing transactions.
2. Include exact amounts.
3. Discuss revenue volatility.
4. Identify unusual spending.
5. Identify recurring expenses.
6. Suggest practical cost-saving actions.
7. Do not invent financial information.
8. Keep the answer easy to understand.
"""

    if not resolved_key:

        return _local_rules_engine(
            audit_data
        )

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

    except Exception:

        return _local_rules_engine(
            audit_data
        )