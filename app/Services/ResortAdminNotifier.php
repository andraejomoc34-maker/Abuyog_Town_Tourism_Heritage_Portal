<?php

namespace App\Services;

use App\Models\Resort;
use App\Models\User;
use App\Notifications\ResortAdminNotification;

class ResortAdminNotifier
{
    public function notifyForResort(
        int $resortId,
        string $title,
        string $message,
        string $url,
        string $type = 'general',
    ): void {
        $this->notifyForRole('resort_admin', $resortId, $title, $message, $url, $type);
    }

    public function notifyForHotel(
        int $hotelId,
        string $title,
        string $message,
        string $url,
        string $type = 'general',
    ): void {
        $this->notifyForRole('hotel_admin', $hotelId, $title, $message, $url, $type);
    }

    public function notifyForProperty(
        int $propertyId,
        string $title,
        string $message,
        string $url,
        string $type = 'general',
    ): void {
        $propertyType = Resort::query()->whereKey($propertyId)->value('property_type');

        if ($propertyType === 'hotel') {
            $this->notifyForHotel($propertyId, $title, $message, $url, $type);

            return;
        }

        $this->notifyForResort($propertyId, $title, $message, $url, $type);
    }

    public function notifyUser(
        User $user,
        string $title,
        string $message,
        string $url,
        string $type = 'general',
    ): void {
        $user->notify(new ResortAdminNotification($title, $message, $url, $type));
    }

    public function notifyMunicipalityAdmins(
        string $title,
        string $message,
        string $url,
        string $type = 'general',
    ): void {
        $this->notifyForRole('municipality_admin', null, $title, $message, $url, $type);
    }

    public function notifySuperAdmins(
        string $title,
        string $message,
        string $url,
        string $type = 'general',
        ?int $exceptUserId = null,
    ): void {
        $this->notifyForRole('super_admin', null, $title, $message, $url, $type, $exceptUserId);
    }

    private function notifyForRole(
        string $role,
        ?int $propertyId,
        string $title,
        string $message,
        string $url,
        string $type,
        ?int $exceptUserId = null,
    ): void {
        User::query()
            ->where('role', $role)
            ->when($propertyId === null, fn ($query) => $query->whereNull('resort_id'))
            ->when($propertyId !== null, fn ($query) => $query->where('resort_id', $propertyId))
            ->where('is_active', true)
            ->when($exceptUserId !== null, fn ($query) => $query->where('id', '!=', $exceptUserId))
            ->get()
            ->each(fn (User $admin) => $admin->notify(new ResortAdminNotification($title, $message, $url, $type)));
    }
}
