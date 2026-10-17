import { useEffect, useMemo } from 'react';
import { ImagePlus, X } from 'lucide-react';

export type ExistingContentImage = {
    id: number | null;
    url: string;
    label: string;
};

export default function MultipleImageUpload({
    id,
    files,
    existingImages,
    errors,
    progress,
    onFilesChange,
    onRemoveExisting,
}: {
    id: string;
    files: File[];
    existingImages: ExistingContentImage[];
    errors: Record<string, string | undefined>;
    progress?: number;
    onFilesChange: (files: File[]) => void;
    onRemoveExisting: (image: ExistingContentImage) => void;
}) {
    const selectedPreviews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [files],
    );

    useEffect(
        () => () => selectedPreviews.forEach(({ url }) => URL.revokeObjectURL(url)),
        [selectedPreviews],
    );

    const imageErrors = Object.entries(errors)
        .filter(([key]) => key === 'images' || key.startsWith('images.'))
        .map(([key, message]) => ({ key, message }))
        .filter(({ message }) => Boolean(message));

    return (
        <section className="space-y-3">
            <label htmlFor={id} className="block text-sm font-medium text-[#173c34]">
                Add gallery photos
            </label>
            <div className="rounded-xl border border-dashed border-[#bdc9bf] bg-[#fbf8f0] p-4">
                <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg px-3 py-5 text-center text-sm text-[#53645d] transition hover:bg-white">
                    <ImagePlus aria-hidden="true" className="h-6 w-6 text-[#9b6a28]" />
                    <span className="font-semibold">Choose one or more images</span>
                    <span className="text-xs">JPEG, PNG, or WebP. Up to 10 images, 5 MB each.</span>
                </label>
                <input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                        const selected = Array.from(event.currentTarget.files ?? []);
                        onFilesChange([...files, ...selected].slice(0, 10));
                        event.currentTarget.value = '';
                    }}
                />
            </div>

            {(existingImages.length > 0 || selectedPreviews.length > 0) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImages.map((image, index) => (
                        <div key={`existing-${image.id ?? index}`} className="relative overflow-hidden rounded-lg border border-[#e5ddce] bg-white">
                            <img src={image.url} alt={image.label} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                            <button
                                type="button"
                                aria-label={`Remove ${image.label}`}
                                onClick={() => {
                                    if (window.confirm(`Remove ${image.label}? This takes effect when you save.`)) {
                                        onRemoveExisting(image);
                                    }
                                }}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#7f2525] shadow hover:bg-white"
                            >
                                <X aria-hidden="true" className="h-4 w-4" />
                            </button>
                            <p className="truncate px-2 py-1.5 text-xs text-[#53645d]">{image.label}</p>
                        </div>
                    ))}
                    {selectedPreviews.map(({ file, url }, index) => (
                        <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-lg border border-[#e5ddce] bg-white">
                            <img src={url} alt={`Selected ${file.name}`} className="aspect-[4/3] w-full object-cover" />
                            <button
                                type="button"
                                aria-label={`Remove selected ${file.name}`}
                                onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#7f2525] shadow hover:bg-white"
                            >
                                <X aria-hidden="true" className="h-4 w-4" />
                            </button>
                            <p className="truncate px-2 py-1.5 text-xs text-[#53645d]">{file.name}</p>
                        </div>
                    ))}
                </div>
            )}

            {imageErrors.map(({ key, message }) => <p key={key} role="alert" className="text-xs text-red-700">{message}</p>)}
            {progress !== undefined && progress > 0 && (
                <div aria-live="polite" className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-[#eee9df]">
                        <div className="h-full bg-[#28715a] transition-[width]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-[#53645d]">Uploading images: {progress}%</p>
                </div>
            )}
        </section>
    );
}
