<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\ResortAdminNotification;

class ResortAdminNotifier
{
    public function notifyForResort(int $resortId, string $title, string $message, string $url): void
    {
        $this->notifyForRole('resort_admin', $resortId, $title, $message, $url);
    }

    public function notifyForHotel(int $hotelId, string $title, string $message, string $url): void
    {
        $this->notifyForRole('hotel_admin', $hotelId, $title, $message, $url);
    }

    private function notifyForRole(string $role, int $propertyId, string $title, string $message, string $url): void
    {
        User::query()
            ->where('role', $role)
            ->where('resort_id', $propertyId)
            ->where('is_active', true)
            ->get()
            ->each(fn (User $admin) => $admin->notify(new ResortAdminNotification($title, $message, $url)));
    }
}
