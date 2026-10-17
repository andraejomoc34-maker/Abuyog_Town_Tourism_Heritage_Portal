import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Trend = { date: string; count: number };
type Destination = { id: number; type: 'spot' | 'resort'; name: string; views: number };
type ContentType = { type: string; published: number; unpublished: number; archived: number };
type Analytics = {
    feedback: {
        total: number;
        averageRating: number | null;
        ratingDistribution: { rating: number; count: number }[];
        trends: Trend[];
    };
    destinations: Destination[];
    content: {
        published: number;
        unpublished: number;
        archived: number;
        byType: ContentType[];
    };
    operations: { bookings: number; inquiries: number; resorts: number };
    filters: { from: string; to: string; resortId: number | null };
};
type ResortOption = { id: number; name: string };

function LineChart({ points }: { points: Trend[] }) {
    const width = 720;
    const height = 220;
    const max = Math.max(1, ...points.map((point) => point.count));
    const coordinates = points.map((point, index) => ({
        x: points.length < 2 ? width / 2 : (index / (points.length - 1)) * width,
        y: height - (point.count / max) * (height - 24) - 12,
    }));
    const path = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    if (points.length === 0 || points.every((point) => point.count === 0)) {
        return <p className="py-14 text-center text-sm text-[#68766f]">No feedback submissions in this date range.</p>;
    }

    return (
        <>
            <svg className="h-56 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Feedback trend with ${points.reduce((total, point) => total + point.count, 0)} submissions`}>
                <title>Daily visitor feedback submissions</title>
                <path d={path} fill="none" stroke="#28715a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {coordinates.map((point, index) => (
                    <circle key={points[index].date} cx={point.x} cy={point.y} r="4" fill="#d99d4b">
                        <title>{`${points[index].date}: ${points[index].count} submissions`}</title>
                    </circle>
                ))}
            </svg>
            <div className="flex justify-between text-xs text-[#68766f]">
                <span>{points[0]?.date}</span>
                <span>{points.at(-1)?.date}</span>
            </div>
        </>
    );
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
    return (
        <article className="rounded-xl border border-[#e5ddce] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#68766f]">{label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
            {note && <p className="mt-1 text-xs text-[#68766f]">{note}</p>}
        </article>
    );
}

export default function MunicipalityReports({
    user,
    analytics,
    resorts,
    dashboardUrl,
}: {
    user: { name: string };
    analytics: Analytics;
    resorts: ResortOption[];
    dashboardUrl: string;
}) {
    const [from, setFrom] = useState(analytics.filters.from);
    const [to, setTo] = useState(analytics.filters.to);
    const [resortId, setResortId] = useState(analytics.filters.resortId?.toString() ?? '');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setFormError('');

        if (from > to) {
            setFormError('The start date must be on or before the end date.');

            return;
        }

        const rangeLength = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;

        if (rangeLength > 365) {
            setFormError('Choose a date range of 366 days or less.');

            return;
        }

        router.get(
            window.location.pathname,
            { from, to, resort_id: resortId || undefined },
            {
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    }

    const highestRatingCount = Math.max(1, ...analytics.feedback.ratingDistribution.map((item) => item.count));
    const contentTotal = analytics.content.published + analytics.content.unpublished + analytics.content.archived;

    return (
        <>
            <Head title="Tourism Analytics" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-8 text-[#173c34] sm:px-8 sm:py-9">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Tourism Analytics</h1>
                            <p className="mt-1 text-sm text-[#68766f]">Database-backed reports for {user.name}.</p>
                        </div>
                        <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href={dashboardUrl}>
                            Dashboard
                        </Link>
                    </div>

                    <form onSubmit={applyFilters} className="mb-6 grid gap-4 rounded-xl border border-[#e5ddce] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-end">
                        <label className="text-sm font-medium">
                            From
                            <input aria-label="From date" type="date" required value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block w-full rounded-lg border-[#d8d1c4] text-sm" />
                        </label>
                        <label className="text-sm font-medium">
                            To
                            <input aria-label="To date" type="date" required value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block w-full rounded-lg border-[#d8d1c4] text-sm" />
                        </label>
                        <label className="text-sm font-medium">
                            Resort / service
                            <select aria-label="Resort or service" value={resortId} onChange={(event) => setResortId(event.target.value)} className="mt-1 block w-full rounded-lg border-[#d8d1c4] text-sm">
                                <option value="">All resorts and services</option>
                                {resorts.map((resort) => <option key={resort.id} value={resort.id}>{resort.name}</option>)}
                            </select>
                        </label>
                        <button type="submit" disabled={loading} className="rounded-lg bg-[#245548] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173c34] disabled:opacity-60">
                            {loading ? 'Updating...' : 'Apply filters'}
                        </button>
                        {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-2 lg:col-span-4">{formError}</p>}
                    </form>

                    <p className="mb-4 text-xs text-[#68766f]">
                        Feedback, destination views, bookings, and inquiries use the selected period. Publication totals show all current records. Dates use Asia/Manila.
                    </p>

                    <section aria-label="Tourism summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric label="Feedback submissions" value={analytics.feedback.total} />
                        <Metric label="Average rating" value={analytics.feedback.averageRating === null ? '—' : `${analytics.feedback.averageRating} / 5`} note={analytics.feedback.averageRating === null ? 'No ratings recorded in this period' : 'From recorded visitor ratings'} />
                        <Metric label="Bookings in period" value={analytics.operations.bookings} />
                        <Metric label="Inquiries in period" value={analytics.operations.inquiries} />
                    </section>

                    <section className="mt-6 grid gap-5 lg:grid-cols-2">
                        <article className="rounded-xl border border-[#e5ddce] bg-white p-5 shadow-sm">
                            <h2 className="font-serif text-xl">Feedback trends</h2>
                            <p className="mb-3 text-sm text-[#68766f]">Daily submissions across the selected period</p>
                            {loading ? <p className="py-14 text-center text-sm" role="status">Loading feedback trends…</p> : <LineChart points={analytics.feedback.trends} />}
                        </article>

                        <article className="rounded-xl border border-[#e5ddce] bg-white p-5 shadow-sm">
                            <h2 className="font-serif text-xl">Rating distribution</h2>
                            <p className="mb-4 text-sm text-[#68766f]">Number of feedback records for each rating</p>
                            <div className="space-y-4">
                                {analytics.feedback.ratingDistribution.map((item) => (
                                    <div key={item.rating} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3">
                                        <span className="text-sm">{item.rating} star{item.rating === 1 ? '' : 's'}</span>
                                        <div className="h-3 overflow-hidden rounded-full bg-[#eee9df]" role="img" aria-label={`${item.rating} stars: ${item.count} feedback entries`}>
                                            <div className="h-full rounded-full bg-[#d99d4b]" style={{ width: `${(item.count / highestRatingCount) * 100}%` }} />
                                        </div>
                                        <span className="text-right text-sm font-semibold">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                            {analytics.feedback.total === 0 && <p className="mt-4 text-sm text-[#68766f]">No feedback submissions in this date range.</p>}
                        </article>

                        <article className="rounded-xl border border-[#e5ddce] bg-white p-5 shadow-sm lg:col-span-2">
                            <h2 className="font-serif text-xl">Most-viewed destinations</h2>
                            <p className="mb-4 text-sm text-[#68766f]">Unique visitor sessions per destination per day</p>
                            {analytics.destinations.length === 0 ? (
                                <p className="rounded-lg bg-[#f8f3e8] p-5 text-center text-sm text-[#68766f]">No destination views recorded in this date range. Views will appear as visitors explore destination cards or resort pages.</p>
                            ) : (
                                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {analytics.destinations.map((destination, index) => (
                                        <li key={`${destination.type}-${destination.id}`} className="flex items-center gap-3 rounded-lg bg-[#f8f3e8] p-4">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#245548] text-sm font-bold text-white">{index + 1}</span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">{destination.name}</p>
                                                <p className="text-xs text-[#68766f]">{destination.views} view{destination.views === 1 ? '' : 's'} - {destination.type === 'spot' ? 'Tourist spot' : 'Resort'}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </article>

                        <article className="rounded-xl border border-[#e5ddce] bg-white p-5 shadow-sm lg:col-span-2">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h2 className="font-serif text-xl">Content publication status</h2>
                                <span className="text-sm text-[#68766f]">{contentTotal} tracked content records</span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <Metric label="Published" value={analytics.content.published} />
                                <Metric label="Unpublished drafts" value={analytics.content.unpublished} />
                                <Metric label="Archived" value={analytics.content.archived} />
                            </div>
                            <h3 className="mt-6 text-sm font-semibold">By content category</h3>
                            {analytics.content.byType.length === 0 ? (
                                <p className="py-6 text-center text-sm text-[#68766f]">No tourism or heritage content records are available.</p>
                            ) : (
                                <div className="mt-3 divide-y divide-[#eee9df]">
                                    {analytics.content.byType.map((item) => (
                                        <div key={item.type} className="grid grid-cols-2 gap-2 py-3 text-sm sm:grid-cols-4">
                                            <span className="font-medium">{item.type}</span>
                                            <span>Published: {item.published}</span>
                                            <span>Draft: {item.unpublished}</span>
                                            <span>Archived: {item.archived}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </section>

                    <p className="mt-6 text-center text-xs text-[#68766f]">
                        {analytics.operations.resorts} resorts recorded · Metrics contain aggregate counts only; no visitor contact details are displayed.
                    </p>
                </div>
            </main>
        </>
    );
}
