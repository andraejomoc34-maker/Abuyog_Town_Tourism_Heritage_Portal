import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FlashMessages from '../../components/FlashMessages';

type Reason = 'fraudulent_bookings' | 'deceptive_activity' | 'abusive_submissions' | 'spam_or_misuse' | 'other';

const reasonLabels: Record<Reason, string> = {
    fraudulent_bookings: 'Suspected fraudulent bookings',
    deceptive_activity: 'Attempted scams or deceptive activity',
    abusive_submissions: 'Repeated abusive submissions',
    spam_or_misuse: 'Spam or misuse of portal features',
    other: 'Other concern',
};

export default function ReportConcern({ reasons }: { reasons: Reason[] }) {
    const form = useForm({
        reported_account: '',
        reason: '' as Reason | '',
        description: '',
        activity_reference: '',
    });
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/report-concern');
    }

    return (
        <>
            <Head title="Report a Concern" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-2xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/">Abuyog Tourism</Link>
                    <header className="mt-6 border-b border-[#ded7c8] pb-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">VISITOR SAFETY</p>
                        <h1 className="mt-2 font-serif text-3xl">Report a concern</h1>
                        <p className="mt-3 text-sm leading-6 text-[#53645d]">Share information about suspected scams or abusive activity connected with the portal. Reports are private and reviewed by authorized staff. A report is an allegation and does not automatically disable an account.</p>
                    </header>
                    <form className="mt-6 space-y-5 rounded-lg border border-[#e5ddce] bg-white p-5 sm:p-7" onSubmit={submit}>
                        <div>
                            <label className="mb-1 block text-sm font-medium" htmlFor="reported-account">Account name, email, or activity identifier</label>
                            <input className="w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id="reported-account" maxLength={255} onChange={(event) => form.setData('reported_account', event.target.value)} required value={form.data.reported_account} />
                            {form.errors.reported_account && <p className="mt-1 text-xs text-red-700">{form.errors.reported_account}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" htmlFor="report-reason">Reason</label>
                            <select className="w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id="report-reason" onChange={(event) => form.setData('reason', event.target.value as Reason)} required value={form.data.reason}>
                                <option value="">Choose a reason</option>
                                {reasons.map((reason) => <option key={reason} value={reason}>{reasonLabels[reason]}</option>)}
                            </select>
                            {form.errors.reason && <p className="mt-1 text-xs text-red-700">{form.errors.reason}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" htmlFor="report-description">What happened?</label>
                            <textarea className="min-h-32 w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id="report-description" maxLength={5000} minLength={20} onChange={(event) => form.setData('description', event.target.value)} required value={form.data.description} />
                            {form.errors.description && <p className="mt-1 text-xs text-red-700">{form.errors.description}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" htmlFor="activity-reference">Related booking, inquiry, or portal reference (optional)</label>
                            <input className="w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id="activity-reference" maxLength={120} onChange={(event) => form.setData('activity_reference', event.target.value)} value={form.data.activity_reference} />
                            {form.errors.activity_reference && <p className="mt-1 text-xs text-red-700">{form.errors.activity_reference}</p>}
                        </div>
                        <p className="text-xs leading-5 text-[#68766f]">Do not include passwords, payment-card details, or other sensitive information. Your contact information is not requested by this form.</p>
                        <button className="min-h-10 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={form.processing} type="submit">
                            {form.processing ? 'Submitting…' : 'Submit private report'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
