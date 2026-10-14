import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AuthShell from '../../components/AuthShell';

export default function ForgotPassword({ status }: { status?: string | null }) {
    const form = useForm({ email: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/forgot-password');
    }

    return (
        <AuthShell
            eyebrow="Account recovery"
            title="Find your way back."
            description="A secure reset link can help you continue your Abuyog journey."
            visualBackground="/Abuyog-14.jpg"
        >
            <div className="auth-heading">
                <p className="eyebrow">Member access</p>
                <h2>Forgot your password?</h2>
                <p>
                    Enter the email address registered to your account and
                    we&apos;ll send you a password reset link.
                </p>
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
                    required
                />
                {form.errors.email && (
                    <span className="field-error">{form.errors.email}</span>
                )}
                <button
                    className="button button--primary"
                    type="submit"
                    disabled={form.processing}
                >
                    {form.processing ? 'Sending...' : 'Send Reset Link'}
                    <span aria-hidden="true">↗</span>
                </button>
            </form>
            <p className="auth-switch">
                <Link href="/login">Back to Login</Link>
            </p>
        </AuthShell>
    );
}
