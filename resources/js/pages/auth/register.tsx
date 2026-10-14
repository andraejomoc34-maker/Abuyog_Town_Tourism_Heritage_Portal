import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { home, login } from '@/routes';
import { register as registerAction } from '@/actions/App/Http/Controllers/AuthController';
import AuthShell from '../../components/AuthShell';

type FaceVerificationProps = {
    available: boolean;
    model: string;
    warning: string;
};

type FaceVerificationPageProps = {
    faceProcessing: FaceVerificationProps;
    pendingFacebookSignup: { name: string; email: string | null } | null;
};

export default function Register() {
    const { faceProcessing, pendingFacebookSignup } = usePage()
        .props as unknown as FaceVerificationPageProps;
    const form = useForm({
        name: pendingFacebookSignup?.name ?? '',
        email: pendingFacebookSignup?.email ?? '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        terms: false,
        face_biometric_consent: false,
        face_image: null as File | null,
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!form.data.face_image) {
            setFacePreviewUrl(null);

            return;
        }

        const previewUrl = URL.createObjectURL(form.data.face_image);
        setFacePreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [form.data.face_image]);

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setCameraReady(false);
    }

    async function startCamera() {
        setCameraError(null);
        stopCamera();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });

            if (!videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());

                return;
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraReady(true);
        } catch {
            setCameraError(
                'Camera access was denied or unavailable. Allow camera permission and then try again.',
            );
            stopCamera();
        }
    }

    async function captureFaceImage() {
        if (!videoRef.current) {
            setCameraError('The camera preview is not ready yet.');

            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const context = canvas.getContext('2d');

        if (!context) {
            setCameraError('The camera preview could not be prepared. Please try again.');

            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.9),
        );

        if (!blob) {
            setCameraError('The photo could not be captured. Please try again.');

            return;
        }

        stopCamera();
        form.setData('face_image', new File([blob], 'registration-face.jpg', { type: 'image/jpeg' }));
        form.clearErrors('face_image');
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.data.face_biometric_consent) {
            form.setError(
                'face_biometric_consent',
                'Consent is required to continue registration.',
            );

            return;
        }

        if (!form.data.face_image) {
            form.setError('face_image', 'Capture a clear face image before creating your account.');

            return;
        }

        form.post(registerAction().url, {
            forceFormData: true,
            onError: (errors) => {
                if (errors.face_image) {
                    setCameraError(errors.face_image);
                }
            },
        });
    }

    const faceVerificationError = Object.entries(form.errors).find(
        ([field]) => field === 'face_verification',
    )?.[1];

    return (
        <AuthShell
            eyebrow="Make it yours"
            title="Start your Abuyog journey."
            description="Create an account to save places, plan meaningful trips, and share the stories you find along the way."
            visualBackground="/Abuyog-14.jpg"
        >
            <div className="auth-heading">
                <p className="eyebrow">New explorer</p>
                <h2>Create your account</h2>
                <p>Save the places and experiences that call you back.</p>
            </div>
            <section
                className="mb-6 space-y-4 border border-[#dce3dc] bg-white p-5 text-[#173c34] sm:p-6"
                aria-labelledby="face-verification-title"
            >
                <div>
                    <h3 id="face-verification-title" className="text-lg font-semibold">
                        Face enrollment
                    </h3>
                    <p className="mt-1 text-sm text-[#68766f]">
                        We check that the capture contains one usable face, then save an encrypted face template to help prevent duplicate registrations. We do not use face matching during login.
                    </p>
                    <p className="mt-2 text-xs text-[#68766f]">
                        {faceProcessing.warning}
                    </p>
                    <p className="mt-2 text-xs text-[#68766f]">
                        The temporary photo is deleted after processing. You can request deletion of the saved face data from your Profile. Face matching is not identity proof or liveness detection.
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#bd8b3d]">
                        Local model: {faceProcessing.model}
                    </p>
                    {!faceProcessing.available && (
                        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                            The local face service is unavailable. Registration cannot be completed until it is running.
                        </p>
                    )}
                </div>
                <label className="check-row check-row--terms">
                    <input
                        type="checkbox"
                        checked={form.data.face_biometric_consent}
                        onChange={(event) => {
                            form.setData('face_biometric_consent', event.target.checked);
                            form.clearErrors('face_biometric_consent');
                        }}
                    />
                    <span>
                        I understand and consent to local processing of this face capture and encrypted storage of a face template only for duplicate-registration prevention. I can withdraw consent and request deletion from my Profile.
                    </span>
                </label>
                {form.errors.face_biometric_consent && (
                    <span className="field-error">{form.errors.face_biometric_consent}</span>
                )}
                <div className="rounded-md border border-[#dce3dc] bg-[#f9fbf8] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#173c34]">Capture your face</p>
                        {form.data.face_image ? (
                            <button
                                type="button"
                                className="text-xs font-semibold text-[#123d36] underline"
                                onClick={() => {
                                    form.setData('face_image', null);
                                    form.clearErrors('face_image');
                                    void startCamera();
                                }}
                            >
                                Retake
                            </button>
                        ) : null}
                    </div>
                    {cameraError && (
                        <p className="mb-2 text-xs font-medium text-red-600" role="alert">{cameraError}</p>
                    )}
                    {faceVerificationError && (
                        <p className="mb-2 text-xs font-medium text-red-600" role="alert">{faceVerificationError}</p>
                    )}
                    {form.processing && (
                        <p className="mb-2 text-xs font-medium text-[#173c34]" role="status">
                            Processing the face capture and creating your account…
                        </p>
                    )}
                    <div className="overflow-hidden rounded-md border border-[#dce3dc] bg-[#eaf1eb]">
                        {facePreviewUrl ? (
                            <img src={facePreviewUrl} alt="Captured face preview" className="h-52 w-full object-cover" />
                        ) : (
                            <video ref={videoRef} className="h-52 w-full object-cover" playsInline muted />
                        )}
                    </div>
                    {!form.data.face_image && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" className="button button--secondary" onClick={() => void startCamera()}>
                                {cameraReady ? 'Camera ready' : 'Start camera'}
                            </button>
                            <button type="button" className="button button--secondary" onClick={() => void captureFaceImage()} disabled={!cameraReady}>
                                Capture face
                            </button>
                            {cameraReady && (
                                <button type="button" className="button button--secondary" onClick={stopCamera}>
                                    Cancel camera
                                </button>
                            )}
                        </div>
                    )}
                    {form.errors.face_image && (
                        <span className="field-error">{form.errors.face_image}</span>
                    )}
                </div>
            </section>
            <form className="auth-form" onSubmit={submit}>
                <label htmlFor="name">Full name</label>
                <input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    autoComplete="name"
                    autoFocus
                    readOnly={Boolean(pendingFacebookSignup)}
                />
                {form.errors.name && <span className="field-error">{form.errors.name}</span>}
                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) => form.setData('email', event.target.value)}
                    autoComplete="email"
                    required
                    readOnly={Boolean(pendingFacebookSignup?.email)}
                />
                {pendingFacebookSignup && !pendingFacebookSignup.email && (
                    <p className="field-hint" role="status">
                        Facebook did not provide an email address. Enter an email you can access to finish creating your account.
                    </p>
                )}
                {form.errors.email && <span className="field-error">{form.errors.email}</span>}
                <label htmlFor="contact_number">Contact number</label>
                <input
                    id="contact_number"
                    type="tel"
                    value={form.data.contact_number}
                    onChange={(event) => form.setData('contact_number', event.target.value)}
                    autoComplete="tel"
                    required={Boolean(pendingFacebookSignup)}
                />
                {form.errors.contact_number && (
                    <span className="field-error">{form.errors.contact_number}</span>
                )}
                {!pendingFacebookSignup && (
                    <>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            autoComplete="new-password"
                        />
                        {form.errors.password && (
                            <span className="field-error">{form.errors.password}</span>
                        )}
                        <label htmlFor="password_confirmation">Confirm password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            autoComplete="new-password"
                        />
                    </>
                )}
                <label className="check-row check-row--terms">
                    <input
                        type="checkbox"
                        checked={form.data.terms}
                        onChange={(event) => form.setData('terms', event.target.checked)}
                    />
                    <span>
                        I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
                    </span>
                </label>
                {form.errors.terms && <span className="field-error">{form.errors.terms}</span>}
                <button className="button button--primary" type="submit" disabled={form.processing}>
                    {form.processing ? 'Creating account...' : 'Continue'}
                    <span aria-hidden="true">↗</span>
                </button>
            </form>
            <div className="auth-divider">
                <span>or</span>
            </div>
            <a className="button button--social" href="/auth/facebook/redirect">
                <span className="facebook-mark">f</span> Continue with Facebook
            </a>
            <p className="auth-switch">
                Already have an account? <Link href={login().url}>Login</Link>
            </p>
            <Link className="guest-link" href={home().url}>
                Continue as guest <span aria-hidden="true">→</span>
            </Link>
        </AuthShell>
    );
}
