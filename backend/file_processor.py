from pathlib import Path

from csv_processor import process_csv
from image_processor import process_image
from audio_processor import process_audio


CSV_EXTENSIONS = {
    ".csv"
}

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a"
}


def process_uploaded_file(
    file_bytes: bytes,
    filename: str
):

    extension = Path(
        filename
    ).suffix.lower()

    # CSV
    if extension in CSV_EXTENSIONS:

        df = process_csv(
            file_bytes
        )

        return {
            "file_type": "csv",
            "filename": filename,
            "data": df
        }

    # IMAGE
    if extension in IMAGE_EXTENSIONS:

        return process_image(
            file_bytes,
            filename
        )

    # AUDIO
    if extension in AUDIO_EXTENSIONS:

        return process_audio(
            file_bytes,
            filename
        )

    raise ValueError(
        "Unsupported file type. "
        "Supported formats: "
        "CSV, JPG, JPEG, PNG, WEBP, "
        "MP3, WAV, M4A."
    )