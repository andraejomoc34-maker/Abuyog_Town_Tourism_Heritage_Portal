import { Check, Pencil, ShieldAlert, ShieldCheck, UserPlus, X } from 'lucide-react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import FlashMessages from '../../../components/FlashMessages';

type AdminAccount = {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'municipality_admin' | 'resort_admin';
    resort?: { name: string } | null;
    is_active: boolean;
    created_at: string;
    disabled_reason: string | null;
    disabled_at: string | null;
};

type AccountPage = {
    data: AdminAccount[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

type AccountStats = { total: number; active: number; disabled: number; new: number };

export default function AdminAccountsIndex({
    accounts,
    filters,
    statistics,
}: {
    accounts: AccountPage;
    filters: { search: string; role: string; status: string; date_order: string };
    statistics: AccountStats;
}) {
    const form = useForm(filters);
    const statusForm = useForm<{ is_active: boolean; reason: string }>({ is_active: false, reason: '' });
    const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
    const [isFiltering, setIsFiltering] = useState(false);
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;

    function visitFilters(data: typeof form.data) {
        setIsFiltering(true);
        router.get('/super-admin/accounts', data, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsFiltering(false),
        });
    }

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        visitFilters(form.data);
    }

    function openStatusDialog(account: AdminAccount) {
        statusForm.clearErrors();
        statusForm.setData({ is_active: !account.is_active, reason: '' });
        setSelectedAccount(account);
    }

    function changeAccountStatus(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedAccount) return;

        statusForm.patch(`/super-admin/accounts/${selectedAccount.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAccount(null);
                statusForm.reset();
            },
        });
    }

    const inputClass = 'w-full rounded-md border border-[#dcd5c8] bg-white px-3 py-2 text-sm text-[#173c34]';

    return (
        <>
            <Head title="Admin Accounts" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">SUPER ADMIN</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">User and Admin Accounts</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/super-admin">Dashboard</Link>
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/content-history">Content history</Link>
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/account-reports">Scam reports</Link>
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/account-security-history">Security history</Link>
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black" href="/super-admin/accounts/create">
                                <UserPlus className="h-4 w-4 text-[#edbd73]" />
                                Create Account
                            </Link>
                        </div>
                    </div>

                    <section aria-label="Account statistics" className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Total users', statistics.total],
                            ['Active', statistics.active],
                            ['Disabled', statistics.disabled],
                            ['New in 30 days', statistics.new],
                        ].map(([label, value]) => (
                            <div className="rounded-lg border border-[#e5ddce] bg-white p-4" key={label}>
                                <p className="text-xs text-[#68766f]">{label}</p>
                                <p className="mt-1 text-2xl font-semibold">{value}</p>
                            </div>
                        ))}
                    </section>

                    <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-lg border border-[#e5ddce] bg-white p-4 sm:grid-cols-[1fr_190px_160px_160px_auto_auto]">
                        <input aria-label="Search accounts" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" placeholder="Search name or email" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} />
                        <select aria-label="Filter by role" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.role} onChange={(event) => { form.setData('role', event.target.value); visitFilters({ ...form.data, role: event.target.value }); }}>
                            <option value="">All manageable roles</option>
                            <option value="user">Visitor</option>
                            <option value="municipality_admin">Municipality Admin</option>
                            <option value="resort_admin">Resort Admin</option>
                        </select>
                        <select aria-label="Filter by status" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.status} onChange={(event) => { form.setData('status', event.target.value); visitFilters({ ...form.data, status: event.target.value }); }}>
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                        </select>
                        <select aria-label="Sort registration date" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.date_order} onChange={(event) => { form.setData('date_order', event.target.value); visitFilters({ ...form.data, date_order: event.target.value }); }}>
                            <option value="newest">Newest registration</option>
                            <option value="oldest">Oldest registration</option>
                        </select>
                        <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isFiltering} type="submit">{isFiltering ? 'Searching…' : 'Search'}</button>
                        <Link className="self-center text-center text-sm text-[#53645d] underline" href="/super-admin/accounts">Clear</Link>
                    </form>

                    <div className="overflow-x-auto rounded-lg border border-[#e5ddce] bg-white">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                            <thead className="bg-[#f4f1e8] text-xs text-[#53645d]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Email</th>
                                    <th className="px-4 py-3 font-semibold">Role</th>
                                    <th className="px-4 py-3 font-semibold">Resort</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Registered</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eee7da]">
                                {accounts.data.map((account) => (
                                    <tr key={account.id}>
                                        <td className="px-4 py-4 font-medium">{account.name}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.email}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.role.replace('_', ' ')}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.resort?.name ?? (account.role === 'resort_admin' ? 'Unassigned' : '—')}</td>
                                        <td className="px-4 py-4">
                                            <span className={account.is_active ? 'rounded-full bg-[#edf4ed] px-2.5 py-1 text-xs font-semibold text-[#245548]' : 'rounded-full bg-[#fff0ed] px-2.5 py-1 text-xs font-semibold text-[#9b3427]'} title={account.disabled_reason ?? undefined}>
                                                {account.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                            {!account.is_active && account.disabled_at && <span className="mt-1 block text-xs text-[#68766f]">{new Date(account.disabled_at).toLocaleDateString()}</span>}
                                            {!account.is_active && account.disabled_reason && <span className="mt-1 block max-w-44 text-xs text-[#68766f]">{account.disabled_reason}</span>}
                                        </td>
                                        <td className="px-4 py-4 text-[#53645d]">{new Date(account.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-1">
                                                <Link aria-label={`Edit ${account.name}`} className="rounded-md p-2 text-[#53645d] hover:bg-[#f4f1e8]" href={`/super-admin/accounts/${account.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button aria-label={`${account.is_active ? 'Disable' : 'Enable'} ${account.name}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => openStatusDialog(account)} type="button">
                                                    {account.is_active ? <X className="h-4 w-4 text-red-700" /> : <Check className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {accounts.data.length === 0 && (
                                    <tr><td className="px-4 py-10 text-center text-[#68766f]" colSpan={7}>No user accounts match these filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {accounts.from ?? 0}–{accounts.to ?? 0} of {accounts.total}</span>
                        <nav aria-label="Account pages" className="flex gap-1">
                            {accounts.links.map((link, index) => (
                                <button key={`${link.label}-${index}`} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>
                            ))}
                        </nav>
                    </div>
                </div>
            </main>
            {selectedAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a24]/60 p-4" role="presentation">
                    <form aria-labelledby="account-status-heading" aria-modal="true" className="w-full max-w-lg space-y-4 rounded-lg border border-[#e5ddce] bg-[#fffdf8] p-5 text-[#173c34] shadow-xl sm:p-7" onSubmit={changeAccountStatus} role="dialog">
                        <div className="flex items-start gap-3">
                            {statusForm.data.is_active ? <ShieldCheck className="mt-1 h-5 w-5 text-[#245548]" /> : <ShieldAlert className="mt-1 h-5 w-5 text-[#9b3427]" />}
                            <div>
                                <h2 className="font-serif text-2xl" id="account-status-heading">{statusForm.data.is_active ? 'Enable this account?' : 'Disable this account?'}</h2>
                                <p className="mt-2 text-sm text-[#53645d]">Target account: <strong>{selectedAccount.name}</strong> ({selectedAccount.email})</p>
                                <p className="mt-1 text-xs text-[#68766f]">Role: {selectedAccount.role.replaceAll('_', ' ')}</p>
                            </div>
                        </div>
                        {!statusForm.data.is_active && (
                            <div>
                                <label className="mb-1 block text-sm font-medium" htmlFor="suspension-reason">Reason for suspension (required)</label>
                                <select className={inputClass} id="suspension-reason" onChange={(event) => statusForm.setData('reason', event.target.value)} value={statusForm.data.reason}>
                                    <option value="">Choose a reason</option>
                                    <option value="Suspected fraudulent bookings">Suspected fraudulent bookings</option>
                                    <option value="Attempted scams or deceptive activity">Attempted scams or deceptive activity</option>
                                    <option value="Repeated abusive submissions">Repeated abusive submissions</option>
                                    <option value="Spam or misuse of portal features">Spam or misuse of portal features</option>
                                    <option value="Other documented violation of portal rules">Other documented violation of portal rules</option>
                                </select>
                                {statusForm.errors.reason && <p className="mt-1 text-xs text-red-700">{statusForm.errors.reason}</p>}
                                <p className="mt-2 text-xs text-[#68766f]">This is an administrative suspension, not a public finding of wrongdoing.</p>
                            </div>
                        )}
                        {statusForm.data.is_active && <p className="text-sm text-[#53645d]">The saved suspension reason remains in security history. Re-enabling will not change this person&apos;s role or publish content.</p>}
                        <div className="flex justify-end gap-2 border-t border-[#eee7da] pt-4">
                            <button className="rounded-md border border-[#dcd5c8] px-4 py-2 text-sm" onClick={() => setSelectedAccount(null)} type="button">Cancel</button>
                            <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={statusForm.processing} type="submit">
                                {statusForm.processing ? 'Saving…' : statusForm.data.is_active ? 'Enable Account' : 'Disable Account'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}