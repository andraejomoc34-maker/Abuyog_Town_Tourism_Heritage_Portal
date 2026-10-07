import { ArrowLeft, Save } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Account = {
    id: number;
    name: string;
    email: string;
    role: 'municipality_admin' | 'resort_admin';
    resort_id: number | null;
    is_active: boolean;
};

export default function AdminAccountForm({
    account,
    resorts,
}: {
    account: Account | null;
    roles: string[];
    resorts: Array<{ id: number; name: string }>;
}) {
    const form = useForm({
        name: account?.name ?? '',
        email: account?.email ?? '',
        role: account?.role ?? 'municipality_admin',
        resort_id: account?.resort_id ? String(account.resort_id) : '',
        password: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (account) {
            form.put(`/super-admin/accounts/${account.id}`);
        } else {
            form.post('/super-admin/accounts');
        }
    }

    const inputClass = 'w-full rounded-md border border-[#dcd5c8] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20';

    return (
        <>
            <Head title={account ? 'Edit Admin Account' : 'Create Admin Account'} />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-2xl">
                    <Link className="inline-flex items-center gap-2 text-sm text-[#53645d]" href="/super-admin/accounts"><ArrowLeft className="h-4 w-4" />Admin Accounts</Link>
                    <div className="mt-5 border-b border-[#ded7c8] pb-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">SUPER ADMIN</p>
                        <h1 className="mt-2 font-serif text-3xl font-normal">{account ? 'Edit Admin Account' : 'Create Admin Account'}</h1>
                    </div>
                    <form className="mt-6 space-y-5 rounded-lg border border-[#e5ddce] bg-white p-5 sm:p-7" onSubmit={submit}>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="admin-name">Name</label>
                            <input className={inputClass} id="admin-name" onChange={(event) => form.setData('name', event.target.value)} value={form.data.name} />
                            {form.errors.name && <p className="mt-1 text-xs text-red-700">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="admin-email">Email</label>
                            <input className={inputClass} id="admin-email" onChange={(event) => form.setData('email', event.target.value)} type="email" value={form.data.email} />
                            {form.errors.email && <p className="mt-1 text-xs text-red-700">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="admin-role">Role</label>
                            <select className={inputClass} id="admin-role" onChange={(event) => { form.setData('role', event.target.value as 'municipality_admin' | 'resort_admin'); form.setData('resort_id', ''); }} value={form.data.role}>
                                <option value="municipality_admin">Municipality Admin</option>
                                <option value="resort_admin">Resort Admin</option>
                            </select>
                            {form.errors.role && <p className="mt-1 text-xs text-red-700">{form.errors.role}</p>}
                        </div>
                        {form.data.role === 'resort_admin' && (
                            <div>
                                <label className="mb-2 block text-sm font-medium" htmlFor="admin-resort">Assigned Resort</label>
                                <select className={inputClass} id="admin-resort" onChange={(event) => form.setData('resort_id', event.target.value)} value={form.data.resort_id}>
                                    <option value="">Choose a resort</option>
                                    {resorts.map((resort) => <option key={resort.id} value={resort.id}>{resort.name}</option>)}
                                </select>
                                {form.errors.resort_id && <p className="mt-1 text-xs text-red-700">{form.errors.resort_id}</p>}
                            </div>
                        )}
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="admin-password">{account ? 'New Password (optional)' : 'Password'}</label>
                            <input autoComplete="new-password" className={inputClass} id="admin-password" onChange={(event) => form.setData('password', event.target.value)} type="password" value={form.data.password} />
                            {form.errors.password && <p className="mt-1 text-xs text-red-700">{form.errors.password}</p>}
                        </div>
                        <div className="flex justify-between border-t border-[#eee7da] pt-5">
                            <Link className="self-center text-sm text-[#68766f]" href="/super-admin/accounts">Cancel</Link>
                            <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={form.processing} type="submit"><Save className="h-4 w-4 text-[#edbd73]" />Save Account</button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}