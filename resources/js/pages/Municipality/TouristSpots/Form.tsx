import { ArrowLeft, Save } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, type FormEvent } from 'react';
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

export default function TouristSpotForm({ spot, categories }: { spot: Spot | null; categories: string[] }) {
    const form = useForm({
        name: spot?.name ?? '',
        description: spot?.description ?? '',
        location: spot?.location ?? '',
        category: spot?.category ?? '',
        image_url: spot?.imageUrl ?? '',
        status: spot?.status ?? 'inactive',
        images: [] as File[],
        remove_image_ids: [] as number[],
        remove_primary_image: false,
    });
    const existingImages: ExistingContentImage[] = useMemo(() => [
        ...(spot?.imageUrl && !form.data.remove_primary_image ? [{ id: null, url: spot.imageUrl, label: 'Current cover image' }] : []),
        ...(spot?.images ?? []).filter((image) => !form.data.remove_image_ids.includes(image.id)).map((image) => ({ ...image, label: 'Current destination image' })),
    ], [form.data.remove_image_ids, form.data.remove_primary_image, spot]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (spot) form.put(`/municipality-admin/tourist-spots/${spot.id}`);
        else form.post('/municipality-admin/tourist-spots');
    }

    const inputClass = 'mt-1.5 w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm outline-none focus:border-[#bd8b3d]';

    return (
        <>
            <Head title={spot ? 'Edit destination' : 'Add destination'} />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link className="inline-flex items-center gap-2 text-sm text-[#53645d]" href="/municipality-admin/tourist-spots"><ArrowLeft className="h-4 w-4" />Tourist Destinations</Link>
                    <header className="mt-5 border-b border-[#ded7c8] pb-5"><p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p><h1 className="mt-2 font-serif text-3xl">{spot ? 'Edit destination' : 'Add destination'}</h1></header>
                    <form onSubmit={submit} className="mt-6 space-y-5 rounded-lg border border-[#e5ddce] bg-white p-5 sm:p-7">
                        <label className="block text-sm font-medium">Destination name<input className={inputClass} maxLength={255} required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />{form.errors.name && <span className="mt-1 block text-xs text-red-700">{form.errors.name}</span>}</label>
                        <label className="block text-sm font-medium">Category<input list="destination-categories" className={inputClass} maxLength={100} required value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} /><datalist id="destination-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>{form.errors.category && <span className="mt-1 block text-xs text-red-700">{form.errors.category}</span>}</label>
                        <label className="block text-sm font-medium">Location or barangay<input className={inputClass} maxLength={255} value={form.data.location} onChange={(event) => form.setData('location', event.target.value)} />{form.errors.location && <span className="mt-1 block text-xs text-red-700">{form.errors.location}</span>}</label>
                        <label className="block text-sm font-medium">Description<textarea className={inputClass} rows={5} maxLength={10000} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />{form.errors.description && <span className="mt-1 block text-xs text-red-700">{form.errors.description}</span>}</label>
                        <label className="block text-sm font-medium">Cover image URL (optional)<input className={inputClass} maxLength={2048} value={form.data.image_url} onChange={(event) => form.setData('image_url', event.target.value)} />{form.errors.image_url && <span className="mt-1 block text-xs text-red-700">{form.errors.image_url}</span>}</label>
                        <label className="block text-sm font-medium">Publication status<select className={inputClass} value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}><option value="inactive">Unpublished</option><option value="active">Published</option>{spot?.status === 'Archived' && <option value="Archived">Archived</option>}</select>{form.errors.status && <span className="mt-1 block text-xs text-red-700">{form.errors.status}</span>}</label>
                        <MultipleImageUpload id="tourist-spot-form-images" files={form.data.images} existingImages={existingImages} errors={form.errors} progress={form.progress?.percentage} onFilesChange={(files) => form.setData('images', files)} onRemoveExisting={(image) => image.id === null ? form.setData('remove_primary_image', true) : form.setData('remove_image_ids', [...form.data.remove_image_ids, image.id])} />
                        <div className="flex justify-between border-t border-[#eee7da] pt-5"><Link className="self-center text-sm text-[#68766f]" href="/municipality-admin/tourist-spots">Cancel</Link><button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={form.processing} type="submit"><Save className="h-4 w-4 text-[#edbd73]" />{form.processing ? 'Saving...' : 'Save destination'}</button></div>
                    </form>
                </div>
            </main>
        </>
    );
}
