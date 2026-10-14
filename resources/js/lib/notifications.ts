export type DashboardNotification = {
    id: string;
    title: string;
    message: string;
    url: string;
    type: string;
    createdAt: string | null;
    readAt: string | null;
};

export type NotificationFeedResponse = {
    notifications: DashboardNotification[];
    unreadCount: number;
};

export async function notificationRequest<T>(
    url: string,
    method: 'GET' | 'PATCH' = 'GET',
    signal?: AbortSignal,
): Promise<T> {
    const csrfToken = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content;

    if (!csrfToken) {
        throw new Error('The security token is unavailable. Refresh the page and try again.');
    }

    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        signal,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        ...(method === 'PATCH' ? { body: '{}' } : {}),
    });

    let payload: T & { message?: string };

    try {
        payload = (await response.json()) as T & { message?: string };
    } catch {
        throw new Error('The notification service returned an invalid response.');
    }

    if (!response.ok) {
        throw new Error(payload.message ?? 'Notifications could not be updated. Please try again.');
    }

    return payload;
}

export function notificationTime(value: string | null): string {
    if (!value) {
        return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Recently';
    }

    const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const elapsedMinutes = Math.round(elapsedSeconds / 60);
    const elapsedHours = Math.round(elapsedMinutes / 60);
    const elapsedDays = Math.round(elapsedHours / 24);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(elapsedSeconds) < 60) {
        return formatter.format(elapsedSeconds, 'second');
    }

    if (Math.abs(elapsedMinutes) < 60) {
        return formatter.format(elapsedMinutes, 'minute');
    }

    if (Math.abs(elapsedHours) < 24) {
        return formatter.format(elapsedHours, 'hour');
    }

    if (Math.abs(elapsedDays) < 30) {
        return formatter.format(elapsedDays, 'day');
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
}
