<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20)
            ->through(fn (DatabaseNotification $notification): array => $this->notificationData($notification));

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function feed(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return response()->json([
            'notifications' => $user->notifications()
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (DatabaseNotification $notification): array => $this->notificationData($notification)),
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $record = $user->notifications()->whereKey($notification)->firstOrFail();
        $record->markAsRead();

        return response()->json([
            'notification' => $this->notificationData($record),
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $user->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return response()->json([
            'unreadCount' => 0,
        ]);
    }

    /**
     * @return array{id: string, title: string, message: string, url: string, type: string, createdAt: ?string, readAt: ?string}
     */
    private function notificationData(DatabaseNotification $notification): array
    {
        $url = $notification->data['url'] ?? '/dashboard';

        if (! is_string($url) || ! str_starts_with($url, '/') || str_starts_with($url, '//')) {
            $url = '/dashboard';
        }

        return [
            'id' => $notification->id,
            'title' => is_string($notification->data['title'] ?? null)
                ? $notification->data['title']
                : 'Portal update',
            'message' => is_string($notification->data['message'] ?? null)
                ? $notification->data['message']
                : '',
            'url' => $url,
            'type' => is_string($notification->data['type'] ?? null)
                ? $notification->data['type']
                : 'general',
            'createdAt' => $notification->created_at?->toIso8601String(),
            'readAt' => $notification->read_at?->toIso8601String(),
        ];
    }
}
