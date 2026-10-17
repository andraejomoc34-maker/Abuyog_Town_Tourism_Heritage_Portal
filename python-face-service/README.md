# Local face-processing service

The registration camera captures a JPEG. The browser uploads it as the
`face_image` multipart file field to Laravel's registration endpoint. Laravel
validates that the upload is an image no larger than 5 MB, then sends the raw
file bytes to the configured `FACE_SERVICE_URL` followed by `/enroll`:

```http
POST /enroll
Authorization: Bearer <FACE_SERVICE_TOKEN>
Content-Type: application/json
```

```json
{
  "image_base64": "<base64-encoded image bytes, without a data-URL prefix>"
}
```

JPEG, PNG, and WEBP are accepted by the service. It validates the decoded image
with Pillow, rejects images larger than 16 megapixels, and passes the image
file to DeepFace/OpenCV for detection and alignment. Enrollment succeeds only
when exactly one face is detected. A successful response contains
`face_detected: true`, the configured model name, and a finite numeric
embedding. The service does not store the uploaded image.

## Start during local development

The pinned TensorFlow dependency requires Python 3.11. Create the service
environment and install its dependencies once if it does not already exist:

```powershell
py -3.11 -m venv python-face-service\.venv
python-face-service\.venv\Scripts\python.exe -m pip install -r python-face-service\requirements.txt
```

Set the same `FACE_SERVICE_TOKEN` in the project `.env` that Laravel uses. Run
`composer dev` to start Laravel, Vite, and this service together. To start only
the service, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File python-face-service\Start-FaceService.ps1
```

The local service listens at `http://127.0.0.1:8001`, matching the default
`FACE_SERVICE_URL` in `.env.example`. If that URL is changed, update the
service's bind address in `app.py` as well.
