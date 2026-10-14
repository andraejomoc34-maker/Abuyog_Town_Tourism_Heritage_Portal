import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AuthShell from '../../components/AuthShell';

export default function ResetPassword({
    email,
    token,
}: {
    email: string;
    token: string;
}) {
    const form = useForm({
        email,
        token,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/reset-password');
    }

    return (
        <AuthShell
            eyebrow="Account recovery"
            title="A fresh start awaits."
            description="Choose a new password to safely return to discovering Abuyog."
            visualBackground="/Abuyog-14.jpg"
        >
            <div className="auth-heading">
                <p className="eyebrow">Secure your account</p>
                <h2>Reset your password</h2>
                <p>Choose a new password for your account.</p>
            </div>
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
                    required
                />
                {form.errors.email && (
                    <span className="field-error">{form.errors.email}</span>
                )}
                <label htmlFor="password">New password</label>
                <input
                    id="password"
                    type="password"
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                    autoComplete="new-password"
                    required
                />
                {form.errors.password && (
                    <span className="field-error">{form.errors.password}</span>
                )}
                <label htmlFor="password_confirmation">
                    Confirm new password
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
                    required
                />
                <button
                    className="button button--primary"
                    type="submit"
                    disabled={form.processing}
                >
                    {form.processing ? 'Resetting...' : 'Reset Password'}
                    <span aria-hidden="true">↗</span>
                </button>
            </form>
        </AuthShell>
    );
}
