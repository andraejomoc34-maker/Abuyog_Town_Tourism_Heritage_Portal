<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Resort;
use App\Models\User;
use App\Services\ResortAdminNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $query = Booking::query()->with('resort', 'cottage', 'hotelRoom');

        if (in_array($user?->role, ['resort_admin', 'hotel_admin'], true)) {
            $query->where('resort_id', $user->resort_id);
        } elseif ($user?->role === 'user') {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Bookings/Index', [
            'bookings' => $query->latest()->get(),
        ]);
    }

    public function adminIndex(): Response
    {
        $user = Auth::user();

        if (! $user || ! in_array($user->role, ['resort_admin', 'municipality_admin', 'super_admin'], true)) {
            abort(403);
        }

        $query = Booking::query()->with('resort', 'user', 'cottage');

        if ($user->role === 'resort_admin') {
            $query->where('resort_id', $user->resort_id);
        }

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $query->latest()->get(),
        ]);
    }

    public function resortAdminIndex(): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'resort_admin' || ! $user->resort_id) {
            abort(403);
        }

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => Booking::query()
                ->where('resort_id', $user->resort_id)
                ->with('resort', 'user', 'cottage')
                ->latest()
                ->get(),
        ]);
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load('resort', 'user', 'cottage', 'hotelRoom');
        $canLeaveFeedback = $booking->user_id === Auth::id()
            && $booking->status === 'Completed'
            && ! $booking->feedback()->exists();

        return Inertia::render('Bookings/Show', [
            'booking' => $booking,
            'canLeaveFeedback' => $canLeaveFeedback,
            'hasReviewed' => $booking->user_id === Auth::id() && $booking->feedback()->exists(),
        ]);
    }

    public function showForAdmin(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking->load('resort', 'user', 'cottage', 'hotelRoom'),
        ]);
    }

    public function showForResortAdmin(Booking $booking): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'resort_admin' || ! $user->resort_id) {
            abort(403);
        }

        abort_unless((int) $booking->resort_id === (int) $user->resort_id, 403);
        $this->authorize('view', $booking);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking->load('resort', 'user', 'cottage', 'hotelRoom'),
        ]);
    }

    public function store(Request $request, Resort $resort, ResortAdminNotifier $notifier): RedirectResponse
    {
        abort_unless($resort->isBookable(), 403, 'Bookings are not available for this accommodation.');

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if (blank($user->contact_number ?? null)) {
            return redirect()->route('auth.complete-profile')->with('error', 'Please add your contact number before making a booking.');
        }

        return $this->storeHotelBooking($request, $resort, $user, $notifier);
    }

    private function storeHotelBooking(Request $request, Resort $resort, User $user, ResortAdminNotifier $notifier): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['required', 'integer', 'exists:hotel_rooms,id'],
            'booking_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'guests' => ['required', 'integer', 'min:1', 'max:500'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $booking = DB::transaction(function () use ($validated, $resort, $user): Booking {
            $hotel = Resort::query()
                ->whereKey($resort->id)
                ->where('property_type', 'hotel')
                ->whereRaw('LOWER(status) = ?', ['active'])
                ->lockForUpdate()
                ->first();

            if (! $hotel) {
                abort(403, 'This hotel is currently unavailable.');
            }

            $room = $hotel->hotelRooms()
                ->whereKey($validated['room_id'])
                ->lockForUpdate()
                ->first();

            if (! $room || $room->status !== 'Available' || $room->available_quantity < 1) {
                throw ValidationException::withMessages([
                    'room_id' => 'Select an available room at this hotel.',
                ]);
            }

            if ($room->capacity !== null && $validated['guests'] > $room->capacity) {
                throw ValidationException::withMessages([
                    'guests' => 'The guest count exceeds this room capacity.',
                ]);
            }

            $activeBookings = Booking::query()
                ->where('hotel_room_id', $room->id)
                ->whereDate('booking_date', $validated['booking_date'])
                ->whereIn('status', ['Pending', 'Confirmed']);

            if ((clone $activeBookings)->where('user_id', $user->id)->exists()) {
                throw ValidationException::withMessages([
                    'booking_date' => 'You already have an active booking for this room on that date.',
                ]);
            }

            if ($activeBookings->count() >= $room->available_quantity) {
                throw ValidationException::withMessages([
                    'room_id' => 'This room type is no longer available for that date.',
                ]);
            }

            return Booking::create([
                'reference_number' => Booking::generateReferenceNumber('hotel'),
                'user_id' => $user->id,
                'resort_id' => $hotel->id,
                'hotel_room_id' => $room->id,
                'cottage_id' => null,
                'booking_date' => $validated['booking_date'],
                'guests' => $validated['guests'],
                'message' => $validated['message'] ?? null,
                'status' => 'Pending',
            ]);
        });

        $notifier->notifyForHotel(
            $booking->resort_id,
            'New hotel booking',
            $booking->reference_number.' · '.$user->name.' · '.$booking->guests.' guests',
            '/hotel-admin/bookings/'.$booking->id,
        );

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking submitted successfully. Reference Number: '.$booking->reference_number);
    }

    public function updateStatus(Request $request, Booking $booking, ResortAdminNotifier $notifier): RedirectResponse
    {
        abort_unless($request->user()?->role !== 'hotel_admin', 403);
        $this->authorize('update', $booking);
        $previousStatus = $booking->status;

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Pending,Confirmed,Rejected,Cancelled,Completed'],
        ]);

        $booking->update([
            'status' => $validated['status'],
        ]);

        if ($previousStatus !== $validated['status'] && in_array($validated['status'], ['Confirmed', 'Rejected'], true)) {
            $notifier->notifyForResort(
                $booking->resort_id,
                'Booking '.$validated['status'],
                ($booking->reference_number ?: 'Booking #'.$booking->id).' is now '.$validated['status'].'.',
                '/resort-admin/bookings/'.$booking->id,
            );
        }

        if ($validated['status'] === 'Confirmed') {
            return back()->with('success', 'Booking confirmed successfully.');
        }

        if ($validated['status'] === 'Rejected') {
            return back()->with('success', 'Booking rejected.');
        }

        return back()->with('success', 'Booking status updated.');
    }
}
