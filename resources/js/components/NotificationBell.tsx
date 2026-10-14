import { Link, router } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CircleHelp,
    Megaphone,
    ShieldCheck,
    Star,
    UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    notificationRequest,
    notificationTime,
    type DashboardNotification,
    type NotificationFeedResponse,
} from '../lib/notifications';

function notificationIcon(type: string) {
    if (type === 'booking') {
        return CalendarDays;
    }

    if (type === 'inquiry') {
        return CircleHelp;
    }

    if (type === 'review' || type === 'feedback') {
        return Star;
    }

    if (type === 'admin_account') {
        return ShieldCheck;
    }

    if (type === 'announcement') {
        return Megaphone;
    }

    return Bell;
}

export function NotificationEntry({
    notification,
    onSelect,
    pending = false,
}: {
    notification: DashboardNotification;
    onSelect: () => void;
    pending?: boolean;
}) {
    const Icon = notificationIcon(notification.type);
    const isUnread = notification.readAt === null;

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={pending}
            className={`flex w-full items-start gap-3 border-b border-[#eee7da] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f8f3e8] focus-visible:bg-[#f8f3e8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#bd8b3d] disabled:cursor-wait disabled:opacity-65 ${
                isUnread ? 'bg-[#fbf5e8]' : 'bg-white'
            }`}
        >
            <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isUnread
                        ? 'bg-[#ead4a8] text-[#173c34]'
                        : 'bg-[#edf1eb] text-[#53645d]'
                }`}
            >
                <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                    <span
                        className={`text-sm ${
                            isUnread
                                ? 'font-semibold text-[#173c34]'
                                : 'font-medium text-[#53645d]'
                        }`}
                    >
                        {notification.title}
                    </span>
                    {isUnread && (
                        <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#bd8b3d]"
                        />
                    )}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#68766f]">
                    {notification.message}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[#8a948e]">
                    {notification.type === 'admin_account' ? (
                        <UserRound aria-hidden="true" className="h-3 w-3" />
                    ) : null}
                    {notificationTime(notification.createdAt)}
                </span>
            </span>
        </button>
    );
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState<string[]>([]);
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const requestInFlight = useRef(false);

    const refresh = useCallback(async (signal?: AbortSignal) => {
        if (requestInFlight.current) {
            return;
        }

        requestInFlight.current = true;

        try {
            const result = await notificationRequest<NotificationFeedResponse>(
                '/notifications/feed',
                'GET',
                signal,
            );
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
            setError(null);
        } catch (requestError) {
            if (
                !(requestError instanceof DOMException && requestError.name === 'AbortError')
            ) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Notifications could not be loaded.',
                );
            }
        } finally {
            requestInFlight.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const refreshWhenVisible = () => {
            if (!document.hidden) {
                void refresh(controller.signal);
            }
        };
        const interval = window.setInterval(refreshWhenVisible, 45_000);

        document.addEventListener('visibilitychange', refreshWhenVisible);
        void refresh(controller.signal);

        return () => {
            controller.abort();
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [refresh]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (
                event.target instanceof Node &&
                !rootRef.current?.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    const selectNotification = async (notification: DashboardNotification) => {
        setError(null);
        setSuccess(null);

        if (notification.readAt === null) {
            setBusyIds((ids) => [...ids, notification.id]);

            try {
                const result = await notificationRequest<{ unreadCount: number }>(
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
                setUnreadCount(result.unreadCount);
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

        setOpen(false);
        router.visit(notification.url);
    };

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
            setUnreadCount(0);
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

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={open}
                aria-controls="dashboard-notifications"
                onClick={() => setOpen((isOpen) => !isOpen)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#e5ddce] bg-white text-[#173c34] transition hover:border-[#d99d4b] hover:bg-[#fbf5e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d]"
            >
                <Bell aria-hidden="true" className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#f8f3e8] bg-[#a96520] px-1 text-[10px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <section
                    id="dashboard-notifications"
                    aria-label="Notifications"
                    className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e3ddcf] bg-[#fffdf8] text-[#173c34] shadow-[0_18px_45px_rgba(9,44,40,.22)]"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-[#e9e0d0] px-4 py-3">
                        <div>
                            <h2 className="font-serif text-xl">Notifications</h2>
                            <p className="mt-0.5 text-xs text-[#718078]">
                                {unreadCount} unread
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={unreadCount === 0 || markingAll}
                            onClick={() => void markAllAsRead()}
                            className="rounded px-2 py-1 text-xs font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4 transition hover:text-[#9b6a28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {markingAll ? 'Marking…' : 'Mark all as read'}
                        </button>
                    </div>

                    {error && (
                        <p className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800" role="alert">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800" role="status">
                            {success}
                        </p>
                    )}

                    <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
                        {loading ? (
                            <p className="px-4 py-8 text-center text-sm text-[#718078]" role="status">
                                Loading notifications…
                            </p>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <NotificationEntry
                                    key={notification.id}
                                    notification={notification}
                                    pending={busyIds.includes(notification.id)}
                                    onSelect={() => void selectNotification(notification)}
                                />
                            ))
                        ) : (
                            <div className="px-5 py-9 text-center">
                                <Bell aria-hidden="true" className="mx-auto h-7 w-7 text-[#bd8b3d]" />
                                <p className="mt-3 text-sm font-semibold text-[#173c34]">
                                    You’re all caught up
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#718078]">
                                    New updates about your account and activity will appear here.
                                </p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/notifications"
                        onClick={() => setOpen(false)}
                        className="flex min-h-11 items-center justify-center border-t border-[#e9e0d0] bg-[#f8f3e8] px-4 text-xs font-semibold text-[#245548] transition hover:bg-[#f2ead9] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#bd8b3d]"
                    >
                        View all notifications
                    </Link>
                </section>
            )}
        </div>
    );
}
