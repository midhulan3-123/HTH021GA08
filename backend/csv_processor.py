import io
import pandas as pd


REQUIRED_COLUMNS = [
    "date",
    "amount",
    "merchant",
    "category"
]


def process_csv(file_bytes: bytes) -> pd.DataFrame:

    try:
        df = pd.read_csv(
            io.BytesIO(file_bytes)
        )
    except Exception as e:
        raise ValueError(
            f"Unable to read CSV file: {e}"
        )

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
            "Missing required CSV columns: "
            + ", ".join(missing)
        )

    # Create transaction ID if missing
    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"TX-UPLOAD-{i + 1}"
            for i in range(len(df))
        ]

    # Convert amount
    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["amount"]
    )

    # Convert date
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    df = df.dropna(
        subset=["date"]
    )

    # Clean merchant/category
    df["merchant"] = (
        df["merchant"]
        .fillna("Unknown Merchant")
        .astype(str)
        .str.strip()
    )

    df["category"] = (
        df["category"]
        .fillna("Other")
        .astype(str)
        .str.strip()
    )

    # Transaction type
    if "type" not in df.columns:

        df["type"] = df["amount"].apply(
            lambda value:
            "CREDIT"
            if value > 0
            else "DEBIT"
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