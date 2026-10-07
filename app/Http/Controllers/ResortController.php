<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ResortController extends Controller
{
    public function index(): Response
    {
        $resorts = Resort::query()
            ->where('name', '!=', 'Castañas Resort')
            ->withCount(['hotelRooms as bookable_rooms_count' => fn (Builder $query) => $query
                ->where('status', 'Available')
                ->where('available_quantity', '>', 0)])
            ->with(['users' => fn (HasMany $query) => $query
                ->where('role', 'resort_admin')
                ->select(['id', 'name', 'resort_id'])])
            ->orderByRaw('CASE WHEN name = ? THEN 0 WHEN name = ? THEN 1 WHEN name = ? THEN 2 WHEN name = ? THEN 3 WHEN name = ? THEN 4 WHEN name = ? THEN 5 WHEN name = ? THEN 6 WHEN name = ? THEN 7 ELSE 8 END', [
                'Malaguicay Falls',
                'Castañas Spring Resort',
                'VALIDA MAKABLACK RESORT',
                'Abuyog Hotel',
                'THE VILLAGE CONDOTEL',
                'HABITAT BUDGET INN',
                'Florina Country Lodge',
                "ELLEN FUENTES TRAVELLER'S INN",
            ])
            ->orderBy('name')
            ->get();

        $resorts->each(function (Resort $resort): void {
            $resort->setAttribute(
                'can_book',
                $resort->isBookable()
                    && strtolower((string) ($resort->status ?? 'active')) === 'active'
                    && $resort->bookable_rooms_count > 0,
            );
        });

        return Inertia::render('Resorts/Index', [
            'resorts' => $resorts,
        ]);
    }

    public function show(Resort $resort): Response
    {
        $isActive = strtolower((string) ($resort->status ?? 'active')) === 'active';
        $isHotel = $resort->property_type === 'hotel';
        $hasBookableInventory = $isHotel
            ? $resort->hotelRooms()->where('status', 'Available')->where('available_quantity', '>', 0)->exists()
            : false;

        return Inertia::render('Resorts/Show', [
            'resort' => $isHotel
                ? $resort->load('hotelRooms')
                : $resort->load('bookings', 'inquiries'),
            'canBook' => $isActive && $resort->isBookable() && $hasBookableInventory,
            'canInquire' => $isActive,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function book(Resort $resort): Response|RedirectResponse
    {
        abort_unless($resort->isBookable(), 403, 'Bookings are not available for this accommodation.');

        if (! Auth::check()) {
            session()->put('intended_url', route('resorts.book', $resort));

            return redirect()->route('login');
        }

        if (strtolower((string) ($resort->status ?? 'active')) !== 'active') {
            return redirect()->route('resorts.show', $resort)->with('error', 'This resort is currently unavailable.');
        }

        if (blank(Auth::user()->contact_number ?? null)) {
            return redirect()->route('auth.complete-profile')->with('error', 'Please add your contact number before making a booking.');
        }

        if ($resort->property_type === 'hotel') {
            $rooms = $resort->hotelRooms()
                ->where('status', 'Available')
                ->where('available_quantity', '>', 0)
                ->orderBy('name')
                ->get(['id', 'resort_id', 'name', 'room_type', 'description', 'capacity', 'price', 'available_quantity', 'image']);

            if ($rooms->isEmpty()) {
                return redirect()->route('resorts.show', $resort)->with('error', 'No hotel rooms are currently available to book.');
            }

            return Inertia::render('Bookings/Create', [
                'resort' => $resort,
                'user' => Auth::user(),
                'propertyType' => 'hotel',
                'rooms' => $rooms,
                'cottages' => [],
            ]);
        }

        return Inertia::render('Bookings/Create', [
            'resort' => $resort,
            'user' => Auth::user(),
            'propertyType' => 'resort',
            'rooms' => [],
            'cottages' => $resort->cottages()
                ->where('status', 'Available')
                ->orderBy('name')
                ->get(['id', 'resort_id', 'name', 'description', 'capacity', 'quantity', 'price']),
        ]);
    }

    public function inquire(Resort $resort): Response|RedirectResponse
    {
        if (! Auth::check()) {
            session()->put('intended_url', route('resorts.inquire', $resort));

            return redirect()->route('login');
        }

        if (strtolower((string) ($resort->status ?? 'active')) !== 'active') {
            return redirect()->route('resorts.show', $resort)->with('error', 'This resort is currently unavailable.');
        }

        return Inertia::render('Inquiries/Create', [
            'resort' => $resort,
            'user' => Auth::user(),
        ]);
    }
}
