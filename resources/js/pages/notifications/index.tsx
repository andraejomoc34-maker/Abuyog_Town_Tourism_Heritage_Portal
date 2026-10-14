import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useState } from 'react';
import NotificationBell, {
    NotificationEntry,
} from '../../components/NotificationBell';
import {
    notificationRequest,
    type DashboardNotification,
} from '../../lib/notifications';

type NotificationPageData = {
    data: DashboardNotification[];
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

function pageLabel(label: string): string {
    return label
        .replace(/<[^>]*>/g, '')
        .replaceAll('&laquo;', '\u00ab')
        .replaceAll('&raquo;', '\u00bb')
        .replaceAll('&amp;', '&');
}

export default function NotificationsIndex({
    notifications: initialNotifications,
}: {
    notifications: NotificationPageData;
}) {
    const [notifications, setNotifications] = useState(
        initialNotifications.data,
    );
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [busyIds, setBusyIds] = useState<string[]>([]);
    const [markingAll, setMarkingAll] = useState(false);

    const markAllAsRead = async () => {
        setMarkingAll(true);
        setError(null);
        setSuccess(null);

        try {
            await notificationRequest('/notifications/read-all', 'PATCH');
            const readAt = new Date().toISOString();
            setNotifications((items) =>
                items.map((item) => ({ ...item, readAt })),
            );
            setSuccess('All notifications have been marked as read.');
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Notifications could not be updated.',
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const selectNotification = async (notification: DashboardNotification) => {
        setError(null);

        if (notification.readAt === null) {
            setBusyIds((ids) => [...ids, notification.id]);

            try {
                await notificationRequest(
                    `/notifications/${notification.id}/read`,
                    'PATCH',
                );
                setNotifications((items) =>
                    items.map((item) =>
                        item.id === notification.id
                            ? { ...item, readAt: new Date().toISOString() }
                            : item,
                    ),
                );
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'This notification could not be marked as read.',
                );
                setBusyIds((ids) => ids.filter((id) => id !== notification.id));

                return;
            }

            setBusyIds((ids) => ids.filter((id) => id !== notification.id));
        }

        router.visit(notification.url);
    };

    return (
        <>
            <Head title="Notifications" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-8 text-[#173c34] sm:px-7 lg:px-10">
                <div className="mx-auto max-w-4xl">
                    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e5ddce] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(23,60,52,.05)]">
                        <Link
                            href="/dashboard"
                            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#245548] transition hover:text-[#9b6a28] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bd8b3d]"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <NotificationBell />
                    </header>

                    <section className="overflow-hidden rounded-xl border border-[#e5ddce] bg-white shadow-[0_10px_30px_rgba(23,60,52,.05)]">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9e0d0] px-5 py-5 sm:px-7">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ead9] text-[#9b6a28]">
                                    <Bell aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.18em] text-[#9b6a28] uppercase">
                                        Account updates
                                    </p>
                                    <h1 className="mt-1 font-serif text-2xl">
                                        Notifications
                                    </h1>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={
                                    markingAll ||
                                    notifications.every((item) => item.readAt !== null)
                                }
                                onClick={() => void markAllAsRead()}
                                className="min-h-10 rounded-md border border-[#dcd2c0] px-3 text-xs font-semibold text-[#245548] transition hover:border-[#d99d4b] hover:bg-[#fbf5e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d] disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {markingAll ? 'Marking…' : 'Mark all as read'}
                            </button>
                        </div>

                        {error && (
                            <p className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-800" role="alert">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800" role="status">
                                {success}
                            </p>
                        )}

                        {notifications.length > 0 ? (
                            <div>
                                {notifications.map((notification) => (
                                    <NotificationEntry
                                        key={notification.id}
                                        notification={notification}
                                        pending={busyIds.includes(notification.id)}
                                        onSelect={() =>
                                            void selectNotification(notification)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <Bell aria-hidden="true" className="mx-auto h-9 w-9 text-[#bd8b3d]" />
                                <h2 className="mt-4 font-serif text-xl">
                                    No notifications yet
                                </h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718078]">
                                    When there is an update about your account or activity, you’ll find it here.
                                </p>
                            </div>
                        )}

                        {initialNotifications.last_page > 1 && (
                            <nav
                                aria-label="Notification pages"
                                className="flex flex-wrap items-center justify-center gap-2 border-t border-[#e9e0d0] p-4"
                            >
                                {initialNotifications.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            aria-current={link.active ? 'page' : undefined}
                                            className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d] ${
                                                link.active
                                                    ? 'border-[#173c34] bg-[#173c34] text-white'
                                                    : 'border-[#e5ddce] text-[#53645d] hover:bg-[#f8f3e8]'
                                            }`}
                                        >
                                            {pageLabel(link.label)}
                                        </Link>
                                    ) : (
                                        <span
                                            key={`${link.label}-${index}`}
                                            className="inline-flex min-h-10 min-w-10 items-center justify-center px-3 text-xs text-[#a1a9a3]"
                                        >
                                            {pageLabel(link.label)}
                                        </span>
                                    ),
                                )}
                            </nav>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
