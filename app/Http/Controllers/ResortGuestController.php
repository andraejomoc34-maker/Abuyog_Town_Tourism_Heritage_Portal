<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResortGuestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $this->resortAdmin($request);
        $resortId = $user->resort_id;

        $guests = User::query()
            ->select(['users.id', 'users.name', 'users.email', 'users.contact_number'])
            ->whereHas('bookings', fn (Builder $query) => $query->where('resort_id', $resortId))
            ->withCount(['bookings as total_bookings' => fn (Builder $query) => $query->where('resort_id', $resortId)])
            ->withMax(['bookings as last_booking_date' => fn (Builder $query) => $query->where('resort_id', $resortId)], 'booking_date')
            ->addSelect([
                'latest_booking_status' => Booking::query()
                    ->select('status')
                    ->whereColumn('bookings.user_id', 'users.id')
                    ->where('resort_id', $resortId)
                    ->orderByDesc('booking_date')
                    ->orderByDesc('id')
                    ->limit(1),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (User $guest): array => [
                'id' => $guest->id,
                'name' => $guest->name,
                'email' => $guest->email,
                'contact_number' => $guest->contact_number,
                'total_bookings' => $guest->total_bookings,
                'last_booking' => $guest->last_booking_date,
                'latest_booking_status' => $guest->latest_booking_status,
            ]);

        return Inertia::render('Admin/Guests/Index', [
            'guests' => $guests,
        ]);
    }

    public function show(Request $request, User $guest): Response
    {
        $user = $this->resortAdmin($request);

        $bookings = Booking::query()
            ->where('resort_id', $user->resort_id)
            ->where('user_id', $guest->id)
            ->with('cottage:id,name')
            ->orderByDesc('booking_date')
            ->orderByDesc('id')
            ->get(['id', 'reference_number', 'cottage_id', 'booking_date', 'guests', 'status']);

        abort_unless($bookings->isNotEmpty(), 403);

        return Inertia::render('Admin/Guests/Show', [
            'guest' => [
                'id' => $guest->id,
                'name' => $guest->name,
                'email' => $guest->email,
                'contact_number' => $guest->contact_number,
            ],
            'bookings' => $bookings,
        ]);
    }

    private function resortAdmin(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->role === 'resort_admin' && $user->resort_id,
            403,
        );

        return $user;
    }
}
