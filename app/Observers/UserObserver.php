<?php

namespace App\Observers;

use App\Models\User;
use App\Services\FaceIdentityService;

class UserObserver
{
    public function deleting(User $user): void
    {
        app(FaceIdentityService::class)->removeEnrollment($user);
    }
}
