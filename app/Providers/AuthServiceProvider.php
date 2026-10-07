<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use App\Policies\BookingPolicy;
use App\Policies\InquiryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Booking::class => BookingPolicy::class,
        Inquiry::class => InquiryPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('access-super-admin', fn (User $user): bool => $user->role === 'super_admin');
        Gate::define('manage-resort', fn (User $user, ?Resort $resort = null): bool => $user->role === 'super_admin'
            || ($user->role === 'resort_admin' && $resort !== null && $user->resort_id === $resort->id)
        );
    }
}
