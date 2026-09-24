from pathlib import Path
import uuid


ALLOWED_IMAGE_TYPES = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def process_image(
    file_bytes: bytes,
    filename: str
):

    extension = Path(
        filename
    ).suffix.lower()

    if extension not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            "Unsupported image format."
        )

    upload_dir = Path("uploads")

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    new_name = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = upload_dir / new_name

    with open(
        file_path,
        "wb"
    ) as file:

        file.write(file_bytes)

    return {
        "status": "uploaded",
        "file_type": "image",
        "filename": filename,
        "saved_path": str(file_path),
        "message": (
            "Image uploaded successfully."
        )
    }