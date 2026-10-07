import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthShell from '../../components/AuthShell';

export default function CompleteProfile() {
    const { user } = usePage().props as {
        user?: { name?: string | null; email?: string | null };
    };

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        contact_number: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/auth/complete-profile');
    }

    return (
        <AuthShell
            eyebrow="Complete your account"
            title="Finish your profile."
            description="We need a contact number so you can book resorts and stay connected with your trips."
        >
            <div className="auth-heading">
                <p className="eyebrow">Account details</p>
                <h2>Complete Your Account</h2>
                <p>Finish setting up your profile before continuing.</p>
            </div>
            <form className="auth-form" onSubmit={submit}>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    value={form.data.name}
                    readOnly
                    className="read-only-field"
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={form.data.email}
                    readOnly
                    className="read-only-field"
                />

                <label htmlFor="contact_number">Contact Number</label>
                <input
                    id="contact_number"
                    type="tel"
                    value={form.data.contact_number}
                    onChange={(event) =>
                        form.setData('contact_number', event.target.value)
                    }
                    autoComplete="tel"
                    autoFocus
                />
                {form.errors.contact_number && (
                    <span className="field-error">
                        {form.errors.contact_number}
                    </span>
                )}

                <button
                    className="button button--primary"
                    type="submit"
                    disabled={form.processing}
                >
                    {form.processing ? 'Saving...' : 'Save and continue'}
                    <span aria-hidden="true">↗</span>
                </button>
            </form>
            <Head title="Complete your account" />
        </AuthShell>
    );
}
