export default function FlashMessages({
    success,
    error,
}: {
    success?: string | null;
    error?: string | null;
}) {
    if (!success && !error) {
        return null;
    }

    return (
        <div className="mx-auto mb-4 max-w-6xl space-y-2" aria-live="polite">
            {success && <p role="status" className="rounded-lg border border-[#b8d2be] bg-[#edf6ef] px-4 py-3 text-sm text-[#245548]">{success}</p>}
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        </div>
    );
}
