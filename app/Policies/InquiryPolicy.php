<?php

namespace App\Policies;

use App\Models\Inquiry;
use App\Models\User;

class InquiryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['user', 'resort_admin', 'municipality_admin', 'super_admin'], true);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Inquiry $inquiry): bool
    {
        if ($user->role === 'resort_admin') {
            return $user->resort_id === $inquiry->resort_id;
        }

        return $user->id === $inquiry->user_id
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
    public function update(User $user, Inquiry $inquiry): bool
    {
        return $user->role === 'super_admin'
            || ($user->role === 'resort_admin' && $user->resort_id === $inquiry->resort_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Inquiry $inquiry): bool
    {
        return $user->role === 'super_admin';
    }
}
