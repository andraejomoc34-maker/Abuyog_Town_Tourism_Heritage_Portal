import { Check, Pencil, UserPlus, X } from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';

type AdminAccount = {
    id: number;
    name: string;
    email: string;
    role: 'municipality_admin' | 'resort_admin';
    resort?: { name: string } | null;
    is_active: boolean;
};

export default function AdminAccountsIndex({
    accounts,
}: {
    accounts: AdminAccount[];
}) {
    return (
        <>
            <Head title="Admin Accounts" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">SUPER ADMIN</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Admin Accounts</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/super-admin">Dashboard</Link>
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white" href="/super-admin/accounts/create">
                                <UserPlus className="h-4 w-4 text-[#edbd73]" />
                                Create Admin
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#e5ddce] bg-white">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                            <thead className="bg-[#f4f1e8] text-xs text-[#53645d]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Email</th>
                                    <th className="px-4 py-3 font-semibold">Role</th>
                                    <th className="px-4 py-3 font-semibold">Resort</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eee7da]">
                                {accounts.map((account) => (
                                    <tr key={account.id}>
                                        <td className="px-4 py-4 font-medium">{account.name}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.email}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.role.replace('_', ' ')}</td>
                                        <td className="px-4 py-4 text-[#53645d]">{account.resort?.name ?? 'Municipality'}</td>
                                        <td className="px-4 py-4">{account.is_active ? 'Active' : 'Disabled'}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-1">
                                                <Link aria-label={`Edit ${account.name}`} className="rounded-md p-2 text-[#53645d] hover:bg-[#f4f1e8]" href={`/super-admin/accounts/${account.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button aria-label={`${account.is_active ? 'Disable' : 'Enable'} ${account.name}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => router.patch(`/super-admin/accounts/${account.id}/status`, { is_active: !account.is_active }, { preserveScroll: true })} type="button">
                                                    {account.is_active ? <X className="h-4 w-4 text-red-700" /> : <Check className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {accounts.length === 0 && (
                                    <tr><td className="px-4 py-10 text-center text-[#68766f]" colSpan={6}>No municipality or resort admin accounts exist.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}