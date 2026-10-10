import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { login } from '@/routes';
import { register as registerAction } from '@/actions/App/Http/Controllers/AuthController';
import AuthShell from '../../components/AuthShell';

function captureFaceFrame(video: HTMLVideoElement): Promise<File> {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        return Promise.reject(new Error('The camera frame is not ready. Please try again.'));
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
        return Promise.reject(new Error('Could not capture a camera frame. Please try again.'));
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Could not capture a camera frame. Please try again.'));
                return;
            }

            resolve(new File([blob], 'face-verification.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
    });
}

type FaceLivenessPageProps = {
    faceLiveness: {
        configured: boolean;
        challengeToken: string | null;
        confidenceThreshold: number;
        region: string;
        identityPoolId: string | null;
        sessionId: string | null;
        verified: boolean;
    };
    pendingFacebookSignup: { name: string; email: string | null } | null;
};

export default function Register() {
    const { faceLiveness, pendingFacebookSignup } = usePage().props as unknown as FaceLivenessPageProps;
    const form = useForm({
        name: pendingFacebookSignup?.name ?? '',
        email: pendingFacebookSignup?.email ?? '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);
    const detectorRef = useRef<FaceDetector | null>(null);
    const challengeTokenRef = useRef(faceLiveness.challengeToken);
    const cameraGenerationRef = useRef(0);
    const cameraStartingRef = useRef(false);
    const verificationSubmittingRef = useRef(false);
    const isMountedRef = useRef(false);
    const faceVerificationSectionRef = useRef<HTMLElement | null>(null);
    challengeTokenRef.current = faceLiveness.challengeToken;
    const [verificationMessage, setVerificationMessage] = useState('Waiting for camera...');
    const [verificationTimedOut, setVerificationTimedOut] = useState(false);
    const [faceVerificationError, setFaceVerificationError] = useState<string | null>(null);
    const [isStartingVerification, setIsStartingVerification] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const requiredFaceConfidence = Math.min(
        1,
        Math.max(0.5, faceLiveness.confidenceThreshold / 100),
    );

    const stopCameraPreview = useCallback(() => {
        cameraGenerationRef.current += 1;
        cameraStartingRef.current = false;

        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.pause();
        }

        detectorRef.current?.close();
        detectorRef.current = null;

        if (isMountedRef.current) {
            setIsCameraLoading(false);
        }
    }, []);

    const finishVerification = useCallback(async (confidence: number): Promise<void> => {
        if (verificationSubmittingRef.current) {
            return;
        }

        verificationSubmittingRef.current = true;
        const generation = cameraGenerationRef.current;

        try {
            const video = videoRef.current;

            if (!video) {
                throw new Error('The camera preview is unavailable. Please try again.');
            }

            const capture = await captureFaceFrame(video);

            if (generation !== cameraGenerationRef.current || !isMountedRef.current) {
                return;
            }

            stopCameraPreview();
            setVerificationMessage('Submitting your face verification...');

            await new Promise<void>((resolve) => {
                router.post('/register/face-verification', {
                    challenge_token: challengeTokenRef.current,
                    capture,
                    face_confidence: confidence,
                    face_count: 1,
                }, {
                    forceFormData: true,
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setVerificationMessage('Verification successful');
                    },
                    onError: (errors) => {
                        const message = (errors as Record<string, string>).face_verification
                            ?? (errors as Record<string, string>).capture
                            ?? 'Verification failed. Please try again.';
                        setFaceVerificationError(message);
                        setVerificationMessage(message);
                    },
                    onHttpException: () => {
                        const message = 'The verification service returned an error. Please try again.';
                        setFaceVerificationError(message);
                        setVerificationMessage(message);
                        resolve();
                    },
                    onNetworkError: () => {
                        const message = 'Could not reach the verification service. Check your connection and try again.';
                        setFaceVerificationError(message);
                        setVerificationMessage(message);
                        resolve();
                    },
                    onFinish: () => resolve(),
                });
            });
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Could not capture a camera frame. Please try again.';
            setFaceVerificationError(message);
            setVerificationMessage(message);
            stopCameraPreview();
        } finally {
            verificationSubmittingRef.current = false;
        }
    }, [isMountedRef, stopCameraPreview]);

    const startCameraPreview = useCallback(async (): Promise<void> => {
        if (cameraStartingRef.current || streamRef.current) {
            return;
        }

        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            const message = 'This browser cannot access a camera here. Use localhost or HTTPS and allow camera access.';
            setFaceVerificationError(message);
            setVerificationMessage(message);

            return;
        }

        const generation = ++cameraGenerationRef.current;
        let stream: MediaStream | null = null;
        let stage: 'camera' | 'preview' | 'detection' = 'camera';
        cameraStartingRef.current = true;
        setIsCameraLoading(true);
        setFaceVerificationError(null);
        setVerificationMessage('Requesting camera access...');

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            if (generation !== cameraGenerationRef.current) {
                stream.getTracks().forEach((track) => track.stop());

                return;
            }

            stage = 'preview';
            const video = videoRef.current;

            if (!video) {
                stream.getTracks().forEach((track) => track.stop());
                stream = null;
                throw new Error('The camera preview is not ready yet. Please try again.');
            }

            streamRef.current = stream;

            video.srcObject = stream;
            await video.play();

            if (generation !== cameraGenerationRef.current) {
                return;
            }

            setVerificationMessage('Loading local face detection...');
            stage = 'detection';
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm',
            );
            const detector = await FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                },
                runningMode: 'VIDEO',
                minDetectionConfidence: requiredFaceConfidence,
            });

            if (generation !== cameraGenerationRef.current) {
                detector.close();

                return;
            }

            detectorRef.current = detector;
            setVerificationMessage('Please look at the camera and keep your face in view.');
            let positiveFrames = 0;
            intervalRef.current = window.setInterval(() => {
                if (!videoRef.current || !detectorRef.current || faceLiveness.verified) {
                    return;
                }

                try {
                    const detections = detectorRef.current.detectForVideo(videoRef.current, performance.now()).detections;
                    const faceCount = detections.length;
                    const confidence = detections[0]?.categories[0]?.score ?? 0;

                    if (faceCount === 1 && confidence >= requiredFaceConfidence) {
                        positiveFrames += 1;

                        if (positiveFrames >= 8) {
                            setVerificationMessage('Face detected. Finalizing verification...');
                            void finishVerification(confidence);
                            return;
                        }

                        setVerificationMessage(`Face detected. Hold still for a moment (${Math.max(0, 8 - positiveFrames)} checks left).`);
                    } else {
                        positiveFrames = 0;
                        setVerificationMessage(faceCount > 1
                            ? 'More than one face is visible. Make sure only you are in view.'
                            : 'Please look at the camera and keep your face in view.');
                    }
                } catch {
                    setFaceVerificationError('Face detection stopped. Please restart verification.');
                    setVerificationMessage('Face detection stopped. Please restart verification.');
                    stopCameraPreview();
                }
            }, 500);
        } catch (error) {
            if (generation !== cameraGenerationRef.current) {
                return;
            }

            const errorName = error instanceof DOMException ? error.name : '';
            let message: string;

            if (stage === 'detection') {
                message = 'Could not load face detection. Check your internet connection and try again.';
            } else if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
                message = 'Camera permission was denied. Allow camera access for this site, then try again.';
            } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
                message = 'No camera was found. Connect or enable a camera, then try again.';
            } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
                message = 'The camera is unavailable or already in use by another app. Close other camera apps and try again.';
            } else if (stage === 'preview') {
                message = 'The camera opened but the video preview could not start. Check browser permissions and try again.';
            } else {
                message = 'Could not start the camera. Check browser camera permissions and try again.';
            }

            setFaceVerificationError(message);
            setVerificationMessage(message);
            stopCameraPreview();
        } finally {
            if (generation === cameraGenerationRef.current) {
                cameraStartingRef.current = false;

                if (isMountedRef.current) {
                    setIsCameraLoading(false);
                }
            }
        }
    }, [faceLiveness.verified, finishVerification, stopCameraPreview]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            stopCameraPreview();
        };
    }, [stopCameraPreview]);

    useEffect(() => {
        if (!faceLiveness.sessionId || faceLiveness.verified || verificationTimedOut) {
            stopCameraPreview();

            return;
        }

        setVerificationTimedOut(false);
        void startCameraPreview();
    }, [
        faceLiveness.sessionId,
        faceLiveness.verified,
        verificationTimedOut,
        startCameraPreview,
        stopCameraPreview,
    ]);

    useEffect(() => {
        if (!faceLiveness.sessionId || faceLiveness.verified) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setVerificationTimedOut(true);
            setFaceVerificationError('Verification timed out. Please try again.');
            setVerificationMessage('Verification timed out. Please try again.');
            stopCameraPreview();
            router.post('/register/face-cancel', {}, { preserveScroll: true });
        }, 160_000);

        return () => window.clearTimeout(timeout);
    }, [faceLiveness.sessionId, faceLiveness.verified, stopCameraPreview]);

    function startVerification() {
        if (isStartingVerification) {
            return;
        }

        setFaceVerificationError(null);

        if (!faceLiveness.configured) {
            setFaceVerificationError('Face verification is currently unavailable. Please try again later.');
            setVerificationMessage('Face verification is currently unavailable. Please try again later.');

            return;
        }

        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            const message = 'This browser cannot access a camera here. Use localhost or HTTPS and allow camera access.';
            setFaceVerificationError(message);
            setVerificationMessage(message);

            return;
        }

        setIsStartingVerification(true);
        setVerificationMessage('Preparing face verification...');
        router.post('/register/face-session', {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFaceVerificationError(null);
                setVerificationMessage('Starting camera preview...');
            },
            onError: (errors) => {
                const message = (errors as Record<string, string>).face_verification;
                setFaceVerificationError(message ?? 'Verification failed. Please try again.');
                setVerificationMessage(message ?? 'Verification failed. Please try again.');
            },
            onFinish: () => setIsStartingVerification(false),
        });
    }

    function cancelVerification() {
        setFaceVerificationError('Verification canceled. Start again when you are ready.');
        setVerificationMessage('Verification canceled. Start again when you are ready.');
        stopCameraPreview();
        router.post('/register/face-cancel', {}, { preserveScroll: true });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!faceLiveness.verified) {
            if (pendingFacebookSignup) {
                startVerification();
                faceVerificationSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                return;
            }

            setVerificationMessage('Complete face verification before continuing.');

            return;
        }

        form.post(registerAction().url, {
            onError: (errors) => {
                const message = (errors as Record<string, string>).face_verification;

                if (message) {
                    setFaceVerificationError(message);
                    setVerificationMessage(message);
                }
            },
        });
    }

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
            <section ref={faceVerificationSectionRef} className="mb-6 space-y-4 border border-[#dce3dc] bg-white p-5 text-[#173c34] sm:p-6" aria-labelledby="face-verification-title">
                <div>
                    <h3 id="face-verification-title" className="text-lg font-semibold">Face Verification</h3>
                    <p className="mt-1 text-sm text-[#68766f]">To protect your account, please verify that you are a real person.</p>
                    <p className="mt-1 text-xs text-[#68766f]">This checks your camera view locally in the browser and does not store a recording.</p>
                </div>
                <div className="min-h-56 overflow-hidden bg-[#f8f3e8]">
                    {faceLiveness.sessionId && !faceLiveness.verified && !verificationTimedOut ? (
                        <video
                            ref={videoRef}
                            className="h-56 w-full object-cover"
                            autoPlay
                            muted
                            playsInline
                        />
                    ) : (
                        <div className="flex min-h-56 items-center justify-center px-5 py-8 text-center text-sm text-[#68766f]">
                            {faceLiveness.verified ? 'Verification successful. Continue to create your account.' : 'Camera preview will appear here when verification starts.'}
                        </div>
                    )}
                </div>
                <p className="text-sm" role="status" aria-live="polite">Status: {verificationMessage}</p>
                {(faceVerificationError || (!faceLiveness.configured && !faceLiveness.verified)) && (
                    <p className="text-sm text-[#a3483f]" role="alert">
                        {faceVerificationError ?? 'Face verification is currently unavailable. Please try again later.'}
                    </p>
                )}
                <div className="flex flex-wrap gap-3">
                    {!faceLiveness.verified && (
                        <>
                            <button className="button button--primary rounded-none" type="button" onClick={startVerification} disabled={form.processing || isStartingVerification || isCameraLoading || !faceLiveness.configured}>
                                {isStartingVerification ? 'Preparing verification...' : isCameraLoading ? 'Starting camera...' : faceLiveness.sessionId ? 'Try Again' : 'Start Verification'}
                            </button>
                            {faceLiveness.sessionId && (
                                <button className="button rounded-none" type="button" onClick={cancelVerification}>
                                    Cancel Verification
                                </button>
                            )}
                        </>
                    )}
                </div>
                <p className="text-xs text-[#68766f]">Your camera is used temporarily for verification. The system does not permanently record your camera video.</p>
            </section>
            <form className="auth-form" onSubmit={submit}>
                <label htmlFor="name">Full name</label>
                <input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    autoComplete="name"
                    autoFocus
                    readOnly={Boolean(pendingFacebookSignup)}
                />
                {form.errors.name && (
                    <span className="field-error">{form.errors.name}</span>
                )}
                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    autoComplete="email"
                    required
                    readOnly={Boolean(pendingFacebookSignup?.email)}
                />
                {pendingFacebookSignup && !pendingFacebookSignup.email && (
                    <p className="field-hint" role="status">
                        Facebook did not provide an email address. Enter an email you can access to finish creating your account.
                    </p>
                )}
                {form.errors.email && (
                    <span className="field-error">{form.errors.email}</span>
                )}
                <label htmlFor="contact_number">Contact number</label>
                <input
                    id="contact_number"
                    type="tel"
                    value={form.data.contact_number}
                    onChange={(event) =>
                        form.setData('contact_number', event.target.value)
                    }
                    autoComplete="tel"
                    required={Boolean(pendingFacebookSignup)}
                />
                {form.errors.contact_number && (
                    <span className="field-error">
                        {form.errors.contact_number}
                    </span>
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
                        onChange={(event) =>
                            form.setData('terms', event.target.checked)
                        }
                    />
                    <span>
                        I agree to the <a href="#terms">Terms</a> and{' '}
                        <a href="#privacy">Privacy Policy</a>.
                    </span>
                </label>
                {form.errors.terms && (
                    <span className="field-error">{form.errors.terms}</span>
                )}
                <button
                    className="button button--primary"
                    type="submit"
                                        disabled={form.processing || isStartingVerification || isCameraLoading || (!pendingFacebookSignup && !faceLiveness.verified)}
                >
                                        {isStartingVerification
                                                ? 'Preparing verification...'
                                                : isCameraLoading
                                                    ? 'Starting camera...'
                                                    : form.processing
                                                        ? 'Creating account...'
                                                        : pendingFacebookSignup && !faceLiveness.verified
                                                            ? 'Continue to face verification'
                                                            : 'Continue'}
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
        </AuthShell>
    );
}
