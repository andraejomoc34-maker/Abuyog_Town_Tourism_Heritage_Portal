<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['user', 'resort_admin', 'hotel_admin', 'municipality_admin', 'super_admin'], true);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Booking $booking): bool
    {
        if ($user->role === 'resort_admin') {
            return $user->resort_id === $booking->resort_id;
        }

        if ($user->role === 'hotel_admin') {
            return $user->resort_id !== null
                && $user->resort_id === $booking->resort_id
                && $booking->hotel_room_id !== null;
        }

        return $user->id === $booking->user_id
            || $user->role === 'municipality_admin'
            || $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['user', 'resort_admin', 'super_admin'], true);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Booking $booking): bool
    {
        return $user->role === 'super_admin'
            || ($user->role === 'resort_admin' && $user->resort_id === $booking->resort_id)
            || ($user->role === 'hotel_admin'
                && $user->resort_id !== null
                && $user->resort_id === $booking->resort_id
                && $booking->hotel_room_id !== null);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Booking $booking): bool
    {
        return $user->role === 'super_admin';
    }
}
