import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { login } from '@/routes';
import { register as registerAction } from '@/actions/App/Http/Controllers/AuthController';
import AuthShell from '../../components/AuthShell';
import FaceLivenessChallenge from '../../components/FaceLivenessChallenge';

type FaceLivenessPageProps = {
    faceLiveness: {
        configured: boolean;
        availabilityMessage: string | null;
        region: string;
        sessionId: string | null;
        verified: boolean;
    };
    pendingFacebookSignup: { name: string; email: string | null } | null;
};

export default function Register() {
    const { faceLiveness, pendingFacebookSignup } = usePage()
        .props as unknown as FaceLivenessPageProps;
    const form = useForm({
        name: pendingFacebookSignup?.name ?? '',
        email: pendingFacebookSignup?.email ?? '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        terms: false,
        face_biometric_consent: false,
    });
    const [isStartingVerification, setIsStartingVerification] = useState(false);
    const [faceVerificationError, setFaceVerificationError] = useState<
        string | null
    >(null);

    function handleFaceRequestHttpError(status: number) {
        if (status === 419) {
            setFaceVerificationError(
                'Your registration session expired. Refresh the page and try again.',
            );

            return;
        }

        if (status === 429) {
            setFaceVerificationError(
                'Too many verification attempts. Please wait a minute and try again.',
            );

            return;
        }

        if (status === 401 || status === 403) {
            setFaceVerificationError(
                'Your registration session could not be authorized. Refresh the page and try again.',
            );

            return;
        }

        if (status >= 500) {
            setFaceVerificationError(
                'The verification service could not complete your request. Please try again shortly.',
            );

            return;
        }

        setFaceVerificationError(
            `The verification request failed (HTTP ${status}). Refresh the page and try again.`,
        );
    }

    function handleFaceRequestNetworkError() {
        setFaceVerificationError(
            'Could not reach the portal. Check your internet connection and try again.',
        );
    }

    function startVerification() {
        if (!form.data.face_biometric_consent) {
            setFaceVerificationError(
                'Consent to biometric face matching before starting verification.',
            );

            return;
        }

        if (!faceLiveness.configured || isStartingVerification) {
            return;
        }

        setIsStartingVerification(true);
        setFaceVerificationError(null);
        router.post(
            '/register/face-session',
            { face_biometric_consent: true },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setFaceVerificationError(
                        errors.face_verification ??
                            'Face verification could not be started. Please try again.',
                    );
                },
                onHttpException: (response) =>
                    handleFaceRequestHttpError(response.status),
                onNetworkError: handleFaceRequestNetworkError,
                onFinish: () => setIsStartingVerification(false),
            },
        );
    }

    function cancelVerification() {
        setFaceVerificationError(null);
        router.post(
            '/register/face-cancel',
            {},
            {
                preserveScroll: true,
                onHttpException: (response) =>
                    handleFaceRequestHttpError(response.status),
                onNetworkError: handleFaceRequestNetworkError,
            },
        );
    }

    function completeVerification(): Promise<void> {
        return new Promise((resolve) => {
            router.post(
                '/register/face-verification',
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => setFaceVerificationError(null),
                    onError: (errors) => {
                        setFaceVerificationError(
                            errors.face_verification ??
                                'Face verification failed. Please try again.',
                        );
                    },
                    onHttpException: (response) =>
                        handleFaceRequestHttpError(response.status),
                    onNetworkError: handleFaceRequestNetworkError,
                    onFinish: () => resolve(),
                },
            );
        });
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

        if (!faceLiveness.verified) {
            if (!faceLiveness.sessionId) {
                startVerification();
            } else {
                setFaceVerificationError(
                    'Complete the face liveness check before creating your account.',
                );
            }

            return;
        }

        form.post(registerAction().url, {
            onError: (errors) => {
                if (errors.face_verification) {
                    setFaceVerificationError(errors.face_verification);
                }
            },
            onHttpException: (response) =>
                handleFaceRequestHttpError(response.status),
            onNetworkError: handleFaceRequestNetworkError,
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
            <section
                className="mb-6 space-y-4 border border-[#dce3dc] bg-white p-5 text-[#173c34] sm:p-6"
                aria-labelledby="face-verification-title"
            >
                <div>
                    <h3
                        id="face-verification-title"
                        className="text-lg font-semibold"
                    >
                        Face Verification
                    </h3>
                    <p className="mt-1 text-sm text-[#68766f]">
                        Verify that you are a real person and check for an
                        existing enrolled face identity.
                    </p>
                    <p className="mt-1 text-xs text-[#68766f]">
                        A live camera session is verified by AWS. The reference
                        image is used briefly for matching and is not saved by
                        this site. If you consent, an AWS face template is
                        retained in a private collection until you revoke
                        consent or delete your account.
                    </p>
                </div>
                <label className="check-row check-row--terms">
                    <input
                        type="checkbox"
                        checked={form.data.face_biometric_consent}
                        onChange={(event) => {
                            form.setData(
                                'face_biometric_consent',
                                event.target.checked,
                            );
                            form.clearErrors('face_biometric_consent');

                            if (
                                !event.target.checked &&
                                faceLiveness.sessionId
                            ) {
                                cancelVerification();
                            }
                        }}
                    />
                    <span>
                        I consent to AWS face matching and secure template
                        retention for duplicate-account prevention.
                    </span>
                </label>
                {form.errors.face_biometric_consent && (
                    <p className="text-sm text-[#a3483f]" role="alert">
                        {form.errors.face_biometric_consent}
                    </p>
                )}
                {faceLiveness.sessionId && !faceLiveness.verified && (
                    <FaceLivenessChallenge
                        sessionId={faceLiveness.sessionId}
                        region={faceLiveness.region}
                        onAnalysisComplete={completeVerification}
                        onCancel={cancelVerification}
                        onError={setFaceVerificationError}
                    />
                )}
                {faceLiveness.verified && (
                    <p className="text-sm text-[#173c34]" role="status">
                        Face verification successful. Continue to create your
                        account.
                    </p>
                )}
                {faceVerificationError && (
                    <p className="text-sm text-[#a3483f]" role="alert">
                        {faceVerificationError}
                    </p>
                )}
                {!faceLiveness.configured && (
                    <p className="text-sm text-[#a3483f]" role="alert">
                        {faceLiveness.availabilityMessage ??
                            'Face verification is not configured on this site. Please contact the site administrator.'}
                    </p>
                )}
                {!faceLiveness.verified && !faceLiveness.sessionId && (
                    <button
                        className="button button--primary rounded-none"
                        type="button"
                        onClick={startVerification}
                        disabled={
                            !faceLiveness.configured || isStartingVerification
                        }
                    >
                        {isStartingVerification
                            ? 'Preparing verification...'
                            : 'Start Face Verification'}
                    </button>
                )}
                {faceLiveness.sessionId && !faceLiveness.verified && (
                    <button
                        className="button rounded-none"
                        type="button"
                        onClick={cancelVerification}
                    >
                        Cancel Verification
                    </button>
                )}
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
                        Facebook did not provide an email address. Enter an
                        email you can access to finish creating your account.
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
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            autoComplete="new-password"
                        />
                        {form.errors.password && (
                            <span className="field-error">
                                {form.errors.password}
                            </span>
                        )}
                        <label htmlFor="password_confirmation">
                            Confirm password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
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
                    disabled={
                        form.processing ||
                        (!pendingFacebookSignup && !faceLiveness.verified)
                    }
                >
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
        </AuthShell>
    );
}
