import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { login } from '@/routes';
import { register as registerAction } from '@/actions/App/Http/Controllers/AuthController';
import AuthShell from '../../components/AuthShell';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(registerAction().url);
    }

    return (
        <AuthShell
            eyebrow="Make it yours"
            title="Start your Abuyog journey."
            description="Create an account to save places, plan meaningful trips, and share the stories you find along the way."
        >
            <div className="auth-heading">
                <p className="eyebrow">New explorer</p>
                <h2>Create your account</h2>
                <p>Save the places and experiences that call you back.</p>
            </div>
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
                />
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
                />
                {form.errors.contact_number && (
                    <span className="field-error">
                        {form.errors.contact_number}
                    </span>
                )}
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
                    <span className="field-error">{form.errors.password}</span>
                )}
                <label htmlFor="password_confirmation">Confirm password</label>
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
                    disabled={form.processing}
                >
                    {form.processing ? 'Creating account...' : 'Create account'}
                    <span aria-hidden="true">↗</span>
                </button>
            </form>
            <div className="auth-divider">
                <span>or</span>
            </div>
            <a className="button button--social" href="/auth/facebook">
                <span className="facebook-mark">f</span> Continue with Facebook
            </a>
            <p className="auth-switch">
                Already have an account? <Link href={login().url}>Login</Link>
            </p>
        </AuthShell>
    );
}
