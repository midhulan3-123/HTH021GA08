import os
import tempfile
import pandas as pd

from csv_processor import audit_transactions
from image_processor import process_image
from audio_processor import process_audio


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".mpeg",
    ".mpga"
}


def save_upload(upload_file):

    suffix = os.path.splitext(
        upload_file.filename
    )[1].lower()

    temp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    )

    content = upload_file.file.read()

    temp.write(content)
    temp.close()

    return temp.name


def records_to_audit(records):

    if not records:
        raise ValueError(
            "No financial transactions were detected."
        )

    df = pd.DataFrame(records)

    if "amount" not in df.columns:
        raise ValueError(
            "No amount information was found."
        )

    if "transaction_type" not in df.columns:
        df["transaction_type"] = "expense"

    if "merchant" not in df.columns:
        df["merchant"] = "Unknown"

    if "category" not in df.columns:
        df["category"] = "Uncategorized"

    if "date" not in df.columns:
        df["date"] = ""

    if "tx_id" not in df.columns:
        df["tx_id"] = [
            f"TX-{i + 1}"
            for i in range(len(df))
        ]

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    ).fillna(0)

    return audit_transactions(df)


def process_uploaded_file(upload_file):

    filename = (
        upload_file.filename or ""
    ).lower()

    extension = os.path.splitext(
        filename
    )[1]

    path = save_upload(
        upload_file
    )

    try:

        if extension == ".csv":

            from csv_processor import process_csv

            df = process_csv(path)

            return {
                "source_type": "csv",
                "audit": audit_transactions(df)
            }

        if extension in IMAGE_EXTENSIONS:

            result = process_image(
                path
            )

            audit = records_to_audit(
                result.get(
                    "transactions",
                    []
                )
            )

            return {
                "source_type": "image",
                "audit": audit
            }

        if extension in AUDIO_EXTENSIONS:

            result = process_audio(
                path
            )

            audit = records_to_audit(
                result.get(
                    "transactions",
                    []
                )
            )

            return {
                "source_type": "audio",
                "audit": audit
            }

        raise ValueError(
            "Unsupported file type."
        )

    finally:

        try:
            os.remove(path)
        except Exception:
            pass