import base64
import binascii
import logging
import math
import os
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Any

from deepface import DeepFace
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

app = FastAPI(title='Local Registration Face Processing Service', version='1.0.0')
logger = logging.getLogger('abuyog.face-service')
MODEL_NAME = os.getenv('FACE_SERVICE_MODEL', 'Facenet')
DISTANCE_METRIC = os.getenv('FACE_SERVICE_DISTANCE_METRIC', 'cosine')
THRESHOLD = float(os.getenv('FACE_SERVICE_THRESHOLD', '0.40'))
SERVICE_TOKEN = (os.getenv('FACE_SERVICE_TOKEN') or '').strip()
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BASE64_LENGTH = 4 * ((MAX_IMAGE_BYTES + 2) // 3)
MAX_IMAGE_PIXELS = 16_000_000
IMAGE_FORMAT_SUFFIXES = {
    'JPEG': '.jpg',
    'PNG': '.png',
    'WEBP': '.webp',
}


class EnrollmentRequest(BaseModel):
    image_base64: str = Field(max_length=MAX_IMAGE_BASE64_LENGTH)


class LegacyComparisonRequest(BaseModel):
    image1_base64: str = Field(max_length=MAX_IMAGE_BASE64_LENGTH)
    image2_base64: str = Field(max_length=MAX_IMAGE_BASE64_LENGTH)


@app.middleware('http')
async def reject_oversized_requests(request: Request, call_next):
    if request.url.path in {'/enroll', '/verify'}:
        content_length = request.headers.get('content-length')

        if content_length is not None:
            try:
                request_size = int(content_length)
            except ValueError:
                return JSONResponse(status_code=400, content={'detail': 'Invalid request size.'})

            if request_size > MAX_IMAGE_BYTES * 3:
                return JSONResponse(status_code=413, content={'detail': 'The request is too large.'})

    return await call_next(request)


async def require_service_token(authorization: str | None = Header(default=None)) -> None:
    if not SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail='Face service authentication is not configured.')

    if authorization != f'Bearer {SERVICE_TOKEN}':
        raise HTTPException(status_code=401, detail='Unauthorized.')


def decode_image(encoded_image: str) -> tuple[bytes, str]:
    try:
        image_bytes = base64.b64decode(encoded_image, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail='Invalid image payload.') from None

    if not image_bytes:
        raise HTTPException(status_code=400, detail='An image is required.')

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail='The image is too large.')

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image_format = image.format
            if image_format not in IMAGE_FORMAT_SUFFIXES:
                raise HTTPException(status_code=415, detail='Use a JPEG, PNG, or WEBP image.')

            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise HTTPException(status_code=413, detail='The image dimensions are too large.')

            image.verify()
    except HTTPException:
        raise
    except (Image.DecompressionBombError, UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail='The uploaded image is invalid or unreadable.') from None

    return image_bytes, IMAGE_FORMAT_SUFFIXES[image_format]


def store_temporary_image(image_bytes: bytes, suffix: str, directory: str) -> str:
    image_path = Path(directory) / f'face{suffix}'
    image_path.write_bytes(image_bytes)

    return str(image_path)


def is_valid_embedding(embedding: Any) -> bool:
    return (
        isinstance(embedding, list)
        and 0 < len(embedding) <= 4096
        and all(
            isinstance(value, (int, float))
            and not isinstance(value, bool)
            and math.isfinite(value)
            for value in embedding
        )
    )


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/enroll')
def enroll(
    payload: EnrollmentRequest,
    _: None = Depends(require_service_token),
) -> dict[str, Any]:
    if DISTANCE_METRIC != 'cosine':
        raise HTTPException(status_code=503, detail='The configured face comparison metric is unsupported.')

    image_bytes, suffix = decode_image(payload.image_base64)

    try:
        with tempfile.TemporaryDirectory(prefix='abuyog-face-') as directory:
            image_path = store_temporary_image(image_bytes, suffix, directory)
            representations = DeepFace.represent(
                img_path=image_path,
                model_name=MODEL_NAME,
                detector_backend='opencv',
                enforce_detection=True,
                align=True,
                max_faces=2,
            )
    except ValueError as exc:
        if 'face' in str(exc).lower() and 'detect' in str(exc).lower():
            raise HTTPException(status_code=422, detail='A usable face could not be detected.') from None

        logger.error('Face model rejected an enrollment request (%s).', type(exc).__name__)
        raise HTTPException(status_code=503, detail='The face model could not process the image.') from None
    except HTTPException:
        raise
    except Exception as exc:
        logger.error('Face model failed to process an enrollment request (%s).', type(exc).__name__)
        raise HTTPException(status_code=503, detail='The face model is temporarily unavailable.') from None

    if not isinstance(representations, list) or len(representations) != 1:
        raise HTTPException(status_code=422, detail='Capture exactly one clear face.')

    embedding = representations[0].get('embedding')

    if not is_valid_embedding(embedding):
        raise HTTPException(status_code=503, detail='The face model returned an invalid enrollment result.')

    return {
        'face_detected': True,
        'model': MODEL_NAME,
        'embedding': [float(value) for value in embedding],
    }


@app.post('/verify')
def verify_legacy_reference(
    payload: LegacyComparisonRequest,
    _: None = Depends(require_service_token),
) -> dict[str, Any]:
    image1_bytes, image1_suffix = decode_image(payload.image1_base64)
    image2_bytes, image2_suffix = decode_image(payload.image2_base64)

    try:
        with tempfile.TemporaryDirectory(prefix='abuyog-face-') as directory:
            image1_path = store_temporary_image(image1_bytes, image1_suffix, directory)
            image2_path = str(Path(directory) / f'reference{image2_suffix}')
            Path(image2_path).write_bytes(image2_bytes)
            result = DeepFace.verify(
                img1_path=image1_path,
                img2_path=image2_path,
                model_name=MODEL_NAME,
                detector_backend='opencv',
                distance_metric=DISTANCE_METRIC,
                enforce_detection=True,
                align=True,
                silent=True,
                threshold=THRESHOLD,
            )
    except ValueError as exc:
        if 'face' in str(exc).lower() and 'detect' in str(exc).lower():
            raise HTTPException(status_code=422, detail='A usable face could not be detected in both images.') from None

        logger.error('Face model rejected a legacy comparison (%s).', type(exc).__name__)
        raise HTTPException(status_code=503, detail='The face model could not compare the images.') from None
    except HTTPException:
        raise
    except Exception as exc:
        logger.error('Face model failed a legacy comparison (%s).', type(exc).__name__)
        raise HTTPException(status_code=503, detail='The face model is temporarily unavailable.') from None

    if not isinstance(result, dict):
        raise HTTPException(status_code=503, detail='The face model returned an invalid comparison result.')

    distance = result.get('distance')
    threshold = result.get('threshold')
    if (not isinstance(distance, (int, float))
            or isinstance(distance, bool)
            or not math.isfinite(distance)
            or not isinstance(threshold, (int, float))
            or isinstance(threshold, bool)
            or not math.isfinite(threshold)):
        raise HTTPException(status_code=503, detail='The face model returned an invalid comparison result.')

    return {
        'comparison_succeeded': True,
        'face_detected': [True, True],
        'match': bool(result.get('verified')) and distance <= threshold,
    }


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app:app', host='127.0.0.1', port=8001, reload=False)
