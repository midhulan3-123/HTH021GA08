import pandas as pd
import numpy as np


def normalize_columns(df):
    df = df.copy()

    df.columns = [
        str(column).strip().lower().replace(" ", "_")
        for column in df.columns
    ]

    aliases = {
        "transaction_id": "tx_id",
        "transactionid": "tx_id",
        "id": "tx_id",
        "merchant_name": "merchant",
        "vendor": "merchant",
        "description": "merchant",
        "type": "transaction_type",
        "amount_usd": "amount",
    }

    for old, new in aliases.items():
        if old in df.columns and new not in df.columns:
            df.rename(columns={old: new}, inplace=True)

    return df


def process_csv(file_path):
    df = pd.read_csv(file_path)

    df = normalize_columns(df)

    if "amount" not in df.columns:
        raise ValueError(
            "CSV must contain an amount column."
        )

    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"TX-{1000 + i}"
            for i in range(len(df))
        ]

    if "merchant" not in df.columns:
        df["merchant"] = "Unknown Merchant"

    if "category" not in df.columns:
        df["category"] = "Uncategorized"

    if "date" not in df.columns:
        df["date"] = pd.Timestamp.today().strftime(
            "%Y-%m-%d"
        )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    ).fillna(0)

    if "transaction_type" not in df.columns:
        df["transaction_type"] = np.where(
            df["amount"] >= 0,
            "income",
            "expense"
        )

    df["transaction_type"] = (
        df["transaction_type"]
        .astype(str)
        .str.lower()
    )

    return df


def audit_transactions(df):
    df = df.copy()

    income_types = [
        "income",
        "inflow",
        "credit",
        "revenue",
        "sale",
        "sales"
    ]

    expense_types = [
        "expense",
        "outflow",
        "debit",
        "cost",
        "purchase",
        "payment"
    ]

    df["signed_amount"] = df["amount"]

    for index in df.index:

        transaction_type = str(
            df.loc[index, "transaction_type"]
        ).lower()

        if transaction_type in expense_types:
            df.loc[index, "signed_amount"] = -abs(
                df.loc[index, "amount"]
            )

        elif transaction_type in income_types:
            df.loc[index, "signed_amount"] = abs(
                df.loc[index, "amount"]
            )

    total_inflow = df.loc[
        df["signed_amount"] > 0,
        "signed_amount"
    ].sum()

    total_outflow = abs(
        df.loc[
            df["signed_amount"] < 0,
            "signed_amount"
        ].sum()
    )

    net_cash_flow = (
        total_inflow - total_outflow
    )

    # Revenue volatility
    income_values = df.loc[
        df["signed_amount"] > 0,
        "signed_amount"
    ]

    if len(income_values) > 1:
        mean_income = income_values.mean()

        if mean_income:
            volatility_ratio = (
                income_values.std()
                / mean_income
            )
        else:
            volatility_ratio = 0
    else:
        volatility_ratio = 0

    revenue_volatility = (
        "High (Irregular SME)"
        if volatility_ratio > 0.4
        else "Stable"
    )

    # Anomalies
    expense_df = df[
        df["signed_amount"] < 0
    ].copy()

    anomalies = []

    if not expense_df.empty:

        threshold = (
            expense_df["amount"].mean()
            + 1.5 * expense_df["amount"].std()
        )

        if pd.isna(threshold):
            threshold = expense_df["amount"].mean()

        for _, row in expense_df.iterrows():

            if row["amount"] >= threshold:

                anomalies.append({
                    "tx_id": str(row["tx_id"]),
                    "merchant": str(row["merchant"]),
                    "amount": round(
                        float(row["amount"]),
                        2
                    ),
                    "category": str(
                        row["category"]
                    ),
                })

    # Recurring costs
    recurring = []

    merchant_groups = df.groupby(
        "merchant"
    )

    for merchant, group in merchant_groups:

        expense_group = group[
            group["signed_amount"] < 0
        ]

        if len(expense_group) >= 2:

            total_spent = expense_group[
                "amount"
            ].sum()

            monthly_avg = (
                total_spent
                / max(len(expense_group), 1)
            )

            recurring.append({
                "merchant": str(merchant),
                "category": str(
                    expense_group.iloc[0]["category"]
                ),
                "monthly_avg": round(
                    float(monthly_avg),
                    2
                ),
                "total_spent": round(
                    float(total_spent),
                    2
                ),
            })

    # Categories
    category_totals = {}

    for category, group in df.groupby(
        "category"
    ):

        category_totals[str(category)] = round(
            float(
                group["amount"].sum()
            ),
            2
        )

    # Clean transactions for JSON
    transactions = []

    for _, row in df.iterrows():

        transactions.append({
            "tx_id": str(row["tx_id"]),
            "date": str(row["date"]),
            "merchant": str(row["merchant"]),
            "category": str(row["category"]),
            "amount": round(
                float(row["amount"]),
                2
            ),
            "transaction_type": str(
                row["transaction_type"]
            ),
        })

    return {
        "total_inflow": round(
            float(total_inflow),
            2
        ),

        "total_outflow": round(
            float(total_outflow),
            2
        ),

        "net_cash_flow": round(
            float(net_cash_flow),
            2
        ),

        "revenue_volatility":
            revenue_volatility,

        "anomalies": anomalies,

        "recurring_charges": sorted(
            recurring,
            key=lambda x: x["total_spent"],
            reverse=True
        ),

        "category_totals":
            category_totals,

        "transactions":
            transactions
    }