import { Head, Link } from '@inertiajs/react';

type RecordValue = string | number | null;
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
    const columns = Object.keys(records[0] ?? {});

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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee7da]">
                                    {records.map((record, index) => (
                                        <tr key={index}>
                                            {columns.map((column) => (
                                                <td className="max-w-xl px-4 py-3 align-top text-[#465b53]" key={column}>
                                                    {String(record[column] ?? '—')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}