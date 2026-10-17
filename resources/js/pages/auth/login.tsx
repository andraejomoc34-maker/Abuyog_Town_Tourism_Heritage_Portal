import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { home, register } from '@/routes';
import { login as loginAction } from '@/actions/App/Http/Controllers/AuthController';
import AuthShell from '../../components/AuthShell';

export default function Login({ status }: { status?: string | null }) {
    const form = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(loginAction().url);
    }

    return (
        <AuthShell
            eyebrow="Welcome back"
            title="Your next story starts here."
            description="Continue discovering the beauty, history, culture, and heritage of Abuyog."
            visualBackground="/Abuyog-14.jpg"
        >
            <div className="auth-heading">
                <p className="eyebrow">Member access</p>
                <h2>Sign in to your account</h2>
                <p>Pick up where your Abuyog journey left off.</p>
            </div>
            {status && (
                <p
                    className="mt-5 border border-[#d4e5d6] bg-[#f1f8f1] px-4 py-3 text-sm text-[#245b3d]"
                    role="status"
                >
                    {status}
                </p>
            )}
            <form className="auth-form" onSubmit={submit}>
                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    autoComplete="email"
                    autoFocus
                />
                {form.errors.email && (
                    <span className="field-error">{form.errors.email}</span>
                )}
                <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <Link href="/forgot-password">Forgot password?</Link>
                </div>
                <input
                    id="password"
                    type="password"
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                    autoComplete="current-password"
                />
                {form.errors.password && (
                    <span className="field-error">{form.errors.password}</span>
                )}
                <label className="check-row">
                    <input
                        type="checkbox"
                        checked={form.data.remember}
                        onChange={(event) =>
                            form.setData('remember', event.target.checked)
                        }
                    />
                    <span>Remember me</span>
                </label>
                <button
                    className="button button--primary"
                    type="submit"
                    disabled={form.processing}
                >
                    {form.processing ? 'Logging in...' : 'Login'}
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
                Don&apos;t have an account?{' '}
                <Link href={register().url}>Create an account</Link>
            </p>
            <p className="auth-switch">
                <Link href="/report-concern">Report suspected scam or abusive activity</Link>
            </p>
            <Link className="guest-link" href={home().url}>
                Continue as guest <span aria-hidden="true">→</span>
            </Link>
        </AuthShell>
    );
}
