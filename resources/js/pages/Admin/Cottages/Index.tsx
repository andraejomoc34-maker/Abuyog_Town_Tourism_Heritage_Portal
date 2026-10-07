import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type Cottage = {
    id: number;
    name: string;
    description?: string | null;
    capacity: number;
    quantity: number;
    price?: string | number | null;
    status: 'Available' | 'Maintenance' | 'Unavailable';
};

type CottageForm = {
    name: string;
    description: string;
    capacity: number;
    quantity: number;
    price: string;
    status: Cottage['status'];
};

const initialForm: CottageForm = {
    name: '',
    description: '',
    capacity: 1,
    quantity: 1,
    price: '',
    status: 'Available',
};

const statusStyles: Record<Cottage['status'], string> = {
    Available: 'bg-[#dcfce7] text-[#166534]',
    Maintenance: 'bg-[#fef3c7] text-[#854d0e]',
    Unavailable: 'bg-[#e5e7eb] text-[#374151]',
};

export default function CottageIndex({ cottages }: { cottages: Cottage[] }) {
    const [editing, setEditing] = useState<Cottage | null>(null);
    const form = useForm<CottageForm>(initialForm);
    const availableCount = cottages.filter((cottage) => cottage.status === 'Available').length;

    const resetForm = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
    };

    const startEditing = (cottage: Cottage) => {
        setEditing(cottage);
        form.setData({
            name: cottage.name,
            description: cottage.description ?? '',
            capacity: cottage.capacity,
            quantity: cottage.quantity,
            price: cottage.price == null ? '' : String(cottage.price),
            status: cottage.status,
        });
        form.clearErrors();
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: resetForm,
        };

        if (editing) {
            form.put(`/resort-admin/cottages/${editing.id}`, options);
            return;
        }

        form.post('/resort-admin/cottages', options);
    };

    const removeCottage = (cottage: Cottage) => {
        if (window.confirm(`Remove ${cottage.name} from this resort?`)) {
            router.delete(`/resort-admin/cottages/${cottage.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Cottage inventory" />
            <div className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-7 flex flex-col gap-4 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Resort operations</p>
                            <h1 className="mt-2 font-serif text-3xl">Cottage inventory</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[#718078]">{availableCount} available / {cottages.length} total</p>
                            <Link href="/resort-admin" className="rounded-none bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white">Dashboard</Link>
                        </div>
                    </header>

                    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                        <section className="h-fit rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd8b3d]">Inventory</p>
                                    <h2 className="mt-1 font-serif text-2xl">{editing ? 'Edit cottage' : 'Add a cottage'}</h2>
                                </div>
                                {editing ? (
                                    <button type="button" onClick={resetForm} title="Cancel editing" aria-label="Cancel editing" className="rounded-none border border-[#e9e0d0] p-2 text-[#53645d] hover:bg-[#f8f3e8]">
                                        <X size={16} />
                                    </button>
                                ) : (
                                    <span className="rounded-full bg-[#f8f3e8] p-2 text-[#bd8b3d]"><Plus size={16} /></span>
                                )}
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label htmlFor="cottage-name" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Cottage name</label>
                                    <input id="cottage-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]" required maxLength={255} />
                                    {form.errors.name && <p className="mt-1 text-xs text-red-700">{form.errors.name}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <label htmlFor="cottage-capacity" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Guest capacity</label>
                                        <input id="cottage-capacity" type="number" min={1} max={500} value={form.data.capacity} onChange={(event) => form.setData('capacity', Number(event.target.value))} className="w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]" required />
                                        {form.errors.capacity && <p className="mt-1 text-xs text-red-700">{form.errors.capacity}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="cottage-quantity" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Available units</label>
                                        <input id="cottage-quantity" type="number" min={1} max={500} value={form.data.quantity} onChange={(event) => form.setData('quantity', Number(event.target.value))} className="w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]" required />
                                        {form.errors.quantity && <p className="mt-1 text-xs text-red-700">{form.errors.quantity}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="cottage-price" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Price (PHP)</label>
                                        <input id="cottage-price" type="number" min={0} step="0.01" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} className="w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]" placeholder="Optional" />
                                        {form.errors.price && <p className="mt-1 text-xs text-red-700">{form.errors.price}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="cottage-status" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Status</label>
                                        <select id="cottage-status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value as Cottage['status'])} className="w-full rounded-xl border border-[#ded6c8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]">
                                            <option>Available</option>
                                            <option>Maintenance</option>
                                            <option>Unavailable</option>
                                        </select>
                                        {form.errors.status && <p className="mt-1 text-xs text-red-700">{form.errors.status}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="cottage-description" className="mb-1.5 block text-xs font-semibold text-[#53645d]">Description</label>
                                    <textarea id="cottage-description" rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className="w-full resize-y rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]" maxLength={2000} />
                                    {form.errors.description && <p className="mt-1 text-xs text-red-700">{form.errors.description}</p>}
                                </div>

                                <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 rounded-none bg-[#173c34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                    <Plus size={16} />
                                    {form.processing ? 'Saving…' : editing ? 'Save changes' : 'Add cottage'}
                                </button>
                            </form>
                        </section>

                        <section>
                            <div className="mb-4 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd8b3d]">Assigned resort</p>
                                    <h2 className="mt-1 font-serif text-2xl">Your cottages</h2>
                                </div>
                                <span className="text-sm text-[#718078]">{cottages.length} records</span>
                            </div>

                            <div className="space-y-3">
                                {cottages.length === 0 && (
                                    <div className="rounded-[24px] border border-dashed border-[#d7cdb8] bg-white p-8 text-center">
                                        <p className="font-serif text-xl">No cottages listed</p>
                                        <p className="mt-2 text-sm text-[#718078]">Add the first cottage to start tracking your inventory.</p>
                                    </div>
                                )}
                                {cottages.map((cottage) => (
                                    <article key={cottage.id} className="rounded-[20px] border border-[#e9e0d0] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,52,.04)]">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-serif text-xl">{cottage.name}</h3>
                                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[cottage.status]}`}>{cottage.status}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-[#718078]">{cottage.description || 'No description provided.'}</p>
                                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#53645d]">
                                                    <span>Capacity: {cottage.capacity} guests</span>
                                                    <span>Units: {cottage.quantity}</span>
                                                    <span>Price: {cottage.price == null ? 'Not set' : `₱${Number(cottage.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button type="button" onClick={() => startEditing(cottage)} title={`Edit ${cottage.name}`} className="inline-flex items-center gap-1.5 rounded-none border border-[#d7cdb8] px-3 py-2 text-xs font-semibold hover:bg-[#f8f3e8]">
                                                    <Pencil size={14} /> Edit
                                                </button>
                                                <button type="button" onClick={() => removeCottage(cottage)} title={`Remove ${cottage.name}`} className="inline-flex items-center gap-1.5 rounded-none border border-[#efc8c2] px-3 py-2 text-xs font-semibold text-[#9a3412] hover:bg-[#fff7f5]">
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
