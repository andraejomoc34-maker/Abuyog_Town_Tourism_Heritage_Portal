import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import MultipleImageUpload, { type ExistingContentImage } from '../../components/MultipleImageUpload';

type GalleryImage = { id: number; url: string };
type RecordValue = string | number | null | GalleryImage[];
type RecordRow = Record<string, RecordValue>;

function formatLabel(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export default function MunicipalityRecords({
    title,
    records,
    emptyMessage,
}: {
    title: string;
    records: RecordRow[];
    emptyMessage: string;
}) {
    const [selectedSpot, setSelectedSpot] = useState<RecordRow | null>(null);
    const imageForm = useForm({
        images: [] as File[],
        remove_image_ids: [] as number[],
        remove_primary_image: false,
    });
    const canManageDestinationImages = title === 'Tourist Spots';
    const columns = Object.keys(records[0] ?? {}).filter((column) => !['id', 'primaryImageUrl', 'images'].includes(column));
    const currentImages: ExistingContentImage[] = selectedSpot ? [
        ...(typeof selectedSpot.primaryImageUrl === 'string' && !imageForm.data.remove_primary_image
            ? [{ id: null, url: selectedSpot.primaryImageUrl, label: 'Current cover image' }]
            : []),
        ...((selectedSpot.images as GalleryImage[] | undefined) ?? [])
            .filter((image) => !imageForm.data.remove_image_ids.includes(image.id))
            .map((image) => ({ ...image, label: 'Current destination image' })),
    ] : [];

    function saveImages(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!selectedSpot || typeof selectedSpot.id !== 'number') {
            return;
        }

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
            <Head title={title} />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-9 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">{title}</h1>
                        </div>
                        <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/municipality-admin">
                            Dashboard
                        </Link>
                    </div>
                    {records.length === 0 ? (
                        <div className="rounded-lg border border-[#e5ddce] bg-white px-5 py-12 text-center text-sm text-[#68766f]">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-[#e5ddce] bg-white">
                            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                                <thead className="bg-[#f4f1e8] text-xs text-[#53645d]">
                                    <tr>
                                        {columns.map((column) => (
                                            <th className="px-4 py-3 font-semibold" key={column}>
                                                {formatLabel(column)}
                                            </th>
                                        ))}
                                        {canManageDestinationImages && <th className="px-4 py-3 font-semibold">Images</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee7da]">
                                    {records.map((record) => (
                                        <tr key={String(record.id ?? record.name)}>
                                            {columns.map((column) => (
                                                <td className="max-w-xl px-4 py-3 align-top text-[#465b53]" key={column}>
                                                    {String(record[column] as string | number | null ?? '—')}
                                                </td>
                                            ))}
                                            {canManageDestinationImages && (
                                                <td className="px-4 py-3 align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSpot(record);
                                                            imageForm.reset();
                                                        }}
                                                        className="rounded-lg border border-[#bdc9bf] px-3 py-2 text-xs font-semibold text-[#245548] hover:bg-[#f4f1e8]"
                                                    >
                                                        Manage photos
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            {selectedSpot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#102c28]/65 p-3 sm:p-6">
                    <section role="dialog" aria-modal="true" aria-labelledby="destination-images-title" className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a28]">Destination gallery</p>
                                <h2 id="destination-images-title" className="mt-1 font-serif text-2xl">{String(selectedSpot.name ?? 'Tourist destination')}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedSpot(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#53645d] hover:bg-[#f4f1e8]">Close</button>
                        </div>
                        <form onSubmit={saveImages} className="mt-5 space-y-5">
                            <MultipleImageUpload
                                id="tourist-spot-gallery-images"
                                files={imageForm.data.images}
                                existingImages={currentImages}
                                errors={imageForm.errors}
                                progress={imageForm.progress?.percentage}
                                onFilesChange={(files) => imageForm.setData('images', files)}
                                onRemoveExisting={(image) => {
                                    if (image.id === null) {
                                        imageForm.setData('remove_primary_image', true);
                                    } else {
                                        imageForm.setData('remove_image_ids', [...imageForm.data.remove_image_ids, image.id]);
                                    }
                                }}
                            />
                            <div className="flex justify-end gap-3 border-t border-[#eee7da] pt-4">
                                <button type="button" onClick={() => setSelectedSpot(null)} className="rounded-lg border border-[#dcd5c8] px-4 py-2.5 text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={imageForm.processing} className="rounded-lg bg-[#245548] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                    {imageForm.processing ? 'Saving...' : 'Save photos'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}