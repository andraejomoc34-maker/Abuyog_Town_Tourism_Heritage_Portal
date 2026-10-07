<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Resort;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HotelAdminController extends Controller
{
    public function dashboard(Request $request): Response
    {
        return $this->render($request, 'dashboard');
    }

    public function bookings(Request $request): Response
    {
        return $this->render($request, 'bookings');
    }

    public function showBooking(Request $request, int $booking): Response
    {
        $hotel = $this->hotelFor($request);
        $selectedBooking = Booking::query()
            ->with('user', 'hotelRoom')
            ->findOrFail($booking);
        abort_unless((int) $selectedBooking->resort_id === (int) $hotel->id, 403);

        return $this->render($request, 'bookings', $selectedBooking);
    }

    public function updateBookingStatus(Request $request, int $booking): RedirectResponse
    {
        $hotel = $this->hotelFor($request);
        $selectedBooking = Booking::query()->findOrFail($booking);
        abort_unless((int) $selectedBooking->resort_id === (int) $hotel->id, 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['Confirmed', 'Rejected', 'Cancelled', 'Completed'])],
        ]);

        $selectedBooking->update(['status' => $validated['status']]);

        return back()->with('success', 'Hotel booking status updated.');
    }

    public function calendar(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        return $this->render($request, 'calendar', null, $validated['month'] ?? today()->format('Y-m'));
    }

    public function rooms(Request $request): Response
    {
        return $this->render($request, 'rooms');
    }

    public function storeRoom(Request $request): RedirectResponse
    {
        $hotel = $this->hotelFor($request);
        $hotel->hotelRooms()->create($this->validatedRoom($request));

        return back()->with('success', 'Hotel room added.');
    }

    public function updateRoom(Request $request, int $room): RedirectResponse
    {
        $hotel = $this->hotelFor($request);
        $validated = $this->validatedRoom($request);
        DB::transaction(function () use ($hotel, $room, $validated): void {
            $hotelRoom = $hotel->hotelRooms()->whereKey($room)->lockForUpdate()->firstOrFail();
            $maximumDailyReservations = $hotelRoom->bookings()
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->selectRaw('booking_date, COUNT(*) as reservation_count')
                ->groupBy('booking_date')
                ->get()
                ->max('reservation_count') ?? 0;

            if ($validated['available_quantity'] < $maximumDailyReservations) {
                throw ValidationException::withMessages([
                    'available_quantity' => 'Room quantity cannot be lower than existing pending or confirmed bookings.',
                ]);
            }

            $hotelRoom->update($validated);
        });

        return back()->with('success', 'Hotel room updated.');
    }

    public function guests(Request $request): Response
    {
        return $this->render($request, 'guests');
    }

    public function reports(Request $request): Response
    {
        return $this->render($request, 'reports');
    }

    public function settings(Request $request): Response
    {
        return $this->render($request, 'settings');
    }

    public function profile(Request $request): Response
    {
        return $this->render($request, 'profile');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $hotel = $this->hotelFor($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'contact_information' => ['nullable', 'string', 'max:255'],
            'price_information' => ['nullable', 'string', 'max:5000'],
        ]);

        $hotel->update($validated);

        return back()->with('success', 'Hotel profile updated.');
    }

    private function render(
        Request $request,
        string $section,
        ?Booking $selectedBooking = null,
        ?string $calendarMonth = null,
    ): Response {
        $hotel = $this->hotelFor($request);
        $bookings = $this->hotelBookings($hotel);
        $monthStart = $calendarMonth
            ? Carbon::createFromFormat('Y-m', $calendarMonth)->startOfMonth()
            : today()->startOfMonth();

        $calendarBookings = $section === 'calendar'
            ? (clone $bookings)
                ->with('user', 'hotelRoom')
                ->whereBetween('booking_date', [$monthStart->toDateString(), $monthStart->copy()->endOfMonth()->toDateString()])
                ->orderBy('booking_date')
                ->get()
            : collect();

        $guestBookings = $section === 'guests'
            ? (clone $bookings)->with('user', 'hotelRoom')->latest('booking_date')->get()
            : collect();

        $roomInventory = $section === 'rooms'
            ? $hotel->hotelRooms()->orderBy('name')->get()
            : collect();

        $recentBookings = in_array($section, ['dashboard', 'bookings'], true)
            ? (clone $bookings)->with('user', 'hotelRoom')->latest()->limit(100)->get()
            : collect();

        $trendStart = today()->startOfMonth()->subMonths(5);
        $bookingTrends = collect(range(0, 5))->map(function (int $offset) use ($bookings, $trendStart): array {
            $month = $trendStart->copy()->addMonths($offset);

            return [
                'month' => $month->format('M Y'),
                'bookings' => (clone $bookings)
                    ->whereBetween('booking_date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
                    ->count(),
            ];
        });

        $roomCount = $hotel->hotelRooms()->where('status', 'Available')->sum('available_quantity');
        $totalBookings = (clone $bookings)->count();

        return Inertia::render('Admin/HotelDashboard', [
            'user' => $request->user(),
            'hotel' => $hotel,
            'section' => $section,
            'calendarMonth' => $monthStart->format('Y-m'),
            'currentMonth' => today()->format('Y-m'),
            'stats' => [
                'totalBookings' => $totalBookings,
                'pendingBookings' => (clone $bookings)->where('status', 'Pending')->count(),
                'confirmedBookings' => (clone $bookings)->where('status', 'Confirmed')->count(),
                'rejectedBookings' => (clone $bookings)->where('status', 'Rejected')->count(),
                'totalGuests' => (clone $bookings)->sum('guests'),
                'availableRooms' => (int) $roomCount,
                'roomOccupancy' => $roomCount > 0
                    ? min(100, (int) round(((clone $bookings)->whereDate('booking_date', today())->whereIn('status', ['Pending', 'Confirmed'])->count() / $roomCount) * 100))
                    : 0,
            ],
            'bookings' => $recentBookings,
            'selectedBooking' => $selectedBooking,
            'calendarBookings' => $calendarBookings,
            'guestBookings' => $guestBookings,
            'rooms' => $roomInventory,
            'bookingTrends' => $bookingTrends,
        ]);
    }

    /**
     * @return array{name: string, room_type: string, description: ?string, capacity: ?int, price: ?float, available_quantity: int, status: string, image: ?string}
     */
    private function validatedRoom(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'room_type' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'available_quantity' => ['required', 'integer', 'min:0', 'max:10000'],
            'status' => ['required', Rule::in(['Available', 'Maintenance', 'Unavailable'])],
            'image' => ['nullable', 'string', 'max:2048'],
        ]);

        return $validated;
    }

    private function hotelFor(Request $request): Resort
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'hotel_admin' && $user->resort_id, 403);

        $hotel = Resort::query()
            ->whereKey($user->resort_id)
            ->where('property_type', 'hotel')
            ->where('property_code', 'abuyog-hotel')
            ->first();

        abort_unless($hotel !== null, 403);

        return $hotel;
    }

    /**
     * @return Builder<Booking>
     */
    private function hotelBookings(Resort $hotel): Builder
    {
        return Booking::query()->where('resort_id', $hotel->id);
    }
}
