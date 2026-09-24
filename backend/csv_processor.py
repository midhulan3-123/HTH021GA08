import io
import pandas as pd


REQUIRED_COLUMNS = [
    "date",
    "amount",
    "merchant",
    "category"
]


def process_csv(file_bytes: bytes) -> pd.DataFrame:
    """
    Convert uploaded CSV into the standard
    WealthBridge transaction format.
    """

    df = pd.read_csv(io.BytesIO(file_bytes))

    # Clean column names
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # Check required columns
    missing = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing CSV columns: "
            + ", ".join(missing)
        )

    # Transaction ID
    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"TX-UPLOAD-{i + 1}"
            for i in range(len(df))
        ]

    # Amount
    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["amount"]
    )

    # Transaction type
    if "type" not in df.columns:
        df["type"] = df["amount"].apply(
            lambda amount:
            "CREDIT"
            if amount > 0
            else "DEBIT"
        )

    # Date
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    df = df.dropna(
        subset=["date"]
    )

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