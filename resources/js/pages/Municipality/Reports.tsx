import { Head, Link } from '@inertiajs/react';

const labels: Record<string, string> = {
    totalTouristSpots: 'Tourist Spots',
    totalHeritageSites: 'Heritage Sites',
    totalResorts: 'Resorts',
    totalEvents: 'Events',
    totalRegisteredUsers: 'Registered Users',
    totalResortAdmins: 'Resort Admins',
    totalBookings: 'Bookings',
    pendingBookings: 'Pending Bookings',
    confirmedBookings: 'Confirmed Bookings',
    totalInquiries: 'Inquiries',
    totalAnnouncements: 'Announcements',
};

export default function MunicipalityReports({
    stats,
}: {
    user: { name: string };
    stats: Record<keyof typeof labels, number>;
}) {
    return (
        <>
            <Head title="Tourism Reports" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-9 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Reports</h1>
                        </div>
                        <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/municipality-admin">
                            Dashboard
                        </Link>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(stats).map(([key, value]) => (
                            <article className="rounded-lg border border-[#e5ddce] bg-white p-5" key={key}>
                                <p className="text-sm text-[#68766f]">{labels[key] ?? key}</p>
                                <p className="mt-3 font-serif text-3xl">{value}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}