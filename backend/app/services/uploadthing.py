import httpx
import logging
from typing import Optional
import os

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

UPLOADTHING_API_URL = "https://api.uploadthing.com/v7"


async def upload_file_to_uploadthing(
    file_content: bytes,
    file_name: str,
    content_type: str = "application/octet-stream"
) -> Optional[str]:
    """
    Upload a file to UploadThing and return the URL.

    Returns the file URL on success, None on failure.
    """
    token = getattr(settings, 'uploadthing_token', None) or os.environ.get('UPLOADTHING_TOKEN')

    if not token:
        logger.warning("UPLOADTHING_TOKEN not configured, skipping cloud upload")
        return None

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Request presigned URL
            presign_response = await client.post(
                f"{UPLOADTHING_API_URL}/prepareUpload",
                headers={
                    "x-uploadthing-api-key": token,
                    "Content-Type": "application/json",
                },
                json={
                    "files": [
                        {
                            "name": file_name,
                            "size": len(file_content),
                            "type": content_type,
                        }
                    ],
                    "acl": "public-read",
                    "contentDisposition": "inline",
                },
                timeout=30.0,
            )

            if presign_response.status_code != 200:
                logger.error(f"UploadThing presign failed: {presign_response.status_code} - {presign_response.text}")
                return None

            presign_data = presign_response.json()

            if not presign_data.get("data") or len(presign_data["data"]) == 0:
                logger.error("UploadThing presign returned no data")
                return None

            file_data = presign_data["data"][0]
            presigned_url = file_data.get("presignedUrl")
            file_url = file_data.get("fileUrl")

            if not presigned_url or not file_url:
                logger.error("UploadThing presign missing required fields")
                return None

            # Step 2: Upload file to presigned URL
            upload_response = await client.put(
                presigned_url,
                content=file_content,
                headers={
                    "Content-Type": content_type,
                },
                timeout=120.0,
            )

            if upload_response.status_code not in [200, 201, 204]:
                logger.error(f"UploadThing upload failed: {upload_response.status_code}")
                return None

            logger.info(f"Successfully uploaded {file_name} to UploadThing")
            return file_url

    except Exception as e:
        logger.error(f"UploadThing upload error: {e}")
        return None


async def delete_file_from_uploadthing(file_url: str) -> bool:
    """
    Delete a file from UploadThing.

    Returns True on success, False on failure.
    """
    token = getattr(settings, 'uploadthing_token', None) or os.environ.get('UPLOADTHING_TOKEN')

    if not token:
        logger.warning("UPLOADTHING_TOKEN not configured, cannot delete from cloud")
        return False

    try:
        # Extract file key from URL
        # UploadThing URLs look like: https://utfs.io/f/{fileKey}
        file_key = file_url.split("/f/")[-1] if "/f/" in file_url else None

        if not file_key:
            logger.warning(f"Could not extract file key from URL: {file_url}")
            return False

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{UPLOADTHING_API_URL}/deleteFiles",
                headers={
                    "x-uploadthing-api-key": token,
                    "Content-Type": "application/json",
                },
                json={"fileKeys": [file_key]},
                timeout=30.0,
            )

            if response.status_code == 200:
                logger.info(f"Successfully deleted file from UploadThing: {file_key}")
                return True
            else:
                logger.error(f"UploadThing delete failed: {response.status_code} - {response.text}")
                return False

    except Exception as e:
        logger.error(f"UploadThing delete error: {e}")
        return False
