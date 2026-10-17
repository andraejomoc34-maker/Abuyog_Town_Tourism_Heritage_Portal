import { Archive, Check, Images, Pencil, RotateCcw } from 'lucide-react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import FlashMessages from '../../../components/FlashMessages';
import MultipleImageUpload, { type ExistingContentImage } from '../../../components/MultipleImageUpload';

type Spot = {
    id: number;
    name: string;
    description: string | null;
    location: string | null;
    category: string | null;
    imageUrl: string | null;
    status: string;
    images: Array<{ id: number; url: string }>;
};

type Page<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

export default function TouristSpotIndex({
    spots,
    filters,
    categories,
}: {
    spots: Page<Spot>;
    filters: { search: string; status: string; category: string };
    categories: string[];
}) {
    const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
    const searchForm = useForm(filters);
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;
    const imageForm = useForm({
        images: [] as File[],
        remove_image_ids: [] as number[],
        remove_primary_image: false,
    });
    const existingImages: ExistingContentImage[] = selectedSpot ? [
        ...(selectedSpot.imageUrl && !imageForm.data.remove_primary_image
            ? [{ id: null, url: selectedSpot.imageUrl, label: 'Current cover image' }]
            : []),
        ...selectedSpot.images
            .filter((image) => !imageForm.data.remove_image_ids.includes(image.id))
            .map((image) => ({ ...image, label: 'Current destination image' })),
    ] : [];

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/municipality-admin/tourist-spots', searchForm.data, { preserveState: true, replace: true });
    }

    function changeStatus(spot: Spot, status: 'active' | 'inactive' | 'Archived') {
        if (status === 'Archived' && !window.confirm(`Archive "${spot.name}"? It will be hidden from public visitors.`)) {
            return;
        }
        router.patch(`/municipality-admin/tourist-spots/${spot.id}/status`, { status }, { preserveScroll: true });
    }

    function saveImages(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedSpot) return;
        imageForm.patch(`/municipality-admin/tourist-spots/${selectedSpot.id}/images`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedSpot(null);
                imageForm.reset();
            },
        });
    }

    return (
        <>
            <Head title="Tourist Destinations" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-9 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Tourist Destinations</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/municipality-admin">Dashboard</Link>
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/content-history">Content history</Link>
                            <Link className="rounded-md bg-[#173c34] px-4 py-2.5 text-sm font-semibold text-white" href="/municipality-admin/tourist-spots/create">Add destination</Link>
                        </div>
                    </header>

                    <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-lg border border-[#e5ddce] bg-white p-4 sm:grid-cols-[1fr_190px_190px_auto_auto]">
                        <input aria-label="Search destinations" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" placeholder="Search names, descriptions, locations" value={searchForm.data.search} onChange={(event) => searchForm.setData('search', event.target.value)} />
                        <select aria-label="Filter destination status" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={searchForm.data.status} onChange={(event) => searchForm.setData('status', event.target.value)}>
                            <option value="">All statuses</option><option value="active">Published</option><option value="inactive">Unpublished</option><option value="Archived">Archived</option>
                        </select>
                        <select aria-label="Filter destination category" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={searchForm.data.category} onChange={(event) => searchForm.setData('category', event.target.value)}>
                            <option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                        <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white" type="submit">Search</button>
                        <Link className="self-center text-center text-sm text-[#53645d] underline" href="/municipality-admin/tourist-spots">Clear</Link>
                    </form>

                    <div className="overflow-x-auto rounded-lg border border-[#e5ddce] bg-white">
                        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                            <thead className="bg-[#f4f1e8] text-xs text-[#53645d]"><tr>
                                <th className="px-4 py-3 font-semibold">Destination</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-[#eee7da]">
                                {spots.data.map((spot) => <tr key={spot.id}>
                                    <td className="px-4 py-4"><span className="font-medium">{spot.name}</span><p className="mt-1 max-w-md text-xs text-[#718078]">{spot.description}</p></td>
                                    <td className="px-4 py-4 text-[#53645d]">{spot.category ?? '—'}</td><td className="px-4 py-4 text-[#53645d]">{spot.location ?? '—'}</td>
                                    <td className="px-4 py-4">{spot.status === 'active' ? 'Published' : spot.status === 'Archived' ? 'Archived' : 'Unpublished'}</td>
                                    <td className="px-4 py-4"><div className="flex justify-end gap-1">
                                        {spot.status === 'Archived' ? (
                                            <button aria-label={`Restore ${spot.name}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => router.patch(`/municipality-admin/tourist-spots/${spot.id}/restore`, {}, { preserveScroll: true })} type="button"><RotateCcw className="h-4 w-4" /></button>
                                        ) : (
                                            <>
                                                <Link aria-label={`Edit ${spot.name}`} className="rounded-md p-2 text-[#53645d] hover:bg-[#f4f1e8]" href={`/municipality-admin/tourist-spots/${spot.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                <button aria-label={`Manage photos for ${spot.name}`} className="rounded-md p-2 text-[#53645d] hover:bg-[#f4f1e8]" onClick={() => { setSelectedSpot(spot); imageForm.reset(); }} type="button"><Images className="h-4 w-4" /></button>
                                                {spot.status === 'active'
                                                    ? <button aria-label={`Unpublish ${spot.name}`} className="rounded-md p-2 text-[#9b6a28] hover:bg-[#f8f3e8]" onClick={() => changeStatus(spot, 'inactive')} type="button"><Check className="h-4 w-4" /></button>
                                                    : <button aria-label={`Publish ${spot.name}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => changeStatus(spot, 'active')} type="button"><Check className="h-4 w-4" /></button>}
                                                <button aria-label={`Archive ${spot.name}`} className="rounded-md p-2 text-[#68766f] hover:bg-[#f4f1e8]" onClick={() => changeStatus(spot, 'Archived')} type="button"><Archive className="h-4 w-4" /></button>
                                            </>
                                        )}
                                    </div></td>
                                </tr>)}
                                {spots.data.length === 0 && <tr><td className="px-4 py-12 text-center text-[#68766f]" colSpan={5}>No destinations match these filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {spots.from ?? 0}–{spots.to ?? 0} of {spots.total}</span>
                        <nav aria-label="Destination pages" className="flex gap-1">{spots.links.map((link, index) => <button key={`${link.label}-${index}`} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}</nav>
                    </div>
                </div>
            </main>
            {selectedSpot && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#102c28]/65 p-3 sm:p-6">
                <section role="dialog" aria-modal="true" aria-labelledby="destination-images-title" className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a28]">Destination gallery</p><h2 id="destination-images-title" className="mt-1 font-serif text-2xl">{selectedSpot.name}</h2></div><button type="button" onClick={() => setSelectedSpot(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#53645d] hover:bg-[#f4f1e8]">Close</button></div>
                    <form onSubmit={saveImages} className="mt-5 space-y-5">
                        <MultipleImageUpload id="tourist-spot-gallery-images" files={imageForm.data.images} existingImages={existingImages} errors={imageForm.errors} progress={imageForm.progress?.percentage} onFilesChange={(files) => imageForm.setData('images', files)} onRemoveExisting={(image) => image.id === null ? imageForm.setData('remove_primary_image', true) : imageForm.setData('remove_image_ids', [...imageForm.data.remove_image_ids, image.id])} />
                        <div className="flex justify-end gap-3 border-t border-[#eee7da] pt-4"><button type="button" onClick={() => setSelectedSpot(null)} className="rounded-lg border border-[#dcd5c8] px-4 py-2.5 text-sm font-semibold">Cancel</button><button type="submit" disabled={imageForm.processing} className="rounded-lg bg-[#245548] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{imageForm.processing ? 'Saving...' : 'Save photos'}</button></div>
                    </form>
                </section>
            </div>}
        </>
    );
}
