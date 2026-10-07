<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Cottage;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminResortController extends Controller
{
    public function dashboard(): Response
    {
        return $this->renderDashboard('dashboard');
    }

    public function calendar(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        return $this->renderDashboard('calendar', $validated['month'] ?? today()->format('Y-m'));
    }

    public function cottages(): Response
    {
        return $this->renderDashboard('cottages');
    }

    public function guests(): Response
    {
        return $this->renderDashboard('guests');
    }

    public function reviews(): Response
    {
        return $this->renderDashboard('reviews');
    }

    public function reports(): Response
    {
        return $this->renderDashboard('reports');
    }

    public function announcements(): Response
    {
        return $this->renderDashboard('announcements');
    }

    public function settings(): Response
    {
        return $this->renderDashboard('settings');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->role === 'resort_admin' && $user->resort_id,
            403,
        );

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'contact_information' => ['nullable', 'string', 'max:255'],
        ]);

        Resort::query()->findOrFail($user->resort_id)->update($validated);

        return redirect()->route('resort-admin.settings')->with('success', 'Resort profile updated.');
    }

    public function markNotificationRead(Request $request, string $notification): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->role === 'resort_admin', 403);

        $user->notifications()->where('id', $notification)->firstOrFail()->markAsRead();

        return back();
    }

    protected function renderDashboard(string $section, ?string $calendarMonth = null): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'resort_admin') {
            abort(403);
        }

        $resort = $user->resort_id ? Resort::query()->find($user->resort_id) : null;

        if ($user->role === 'resort_admin' && ($resort === null || $user->resort_id !== $resort->id)) {
            abort(403);
        }

        $baseQuery = fn ($query) => $query->where('resort_id', $resort->id);

        $pendingInquiries = Inquiry::query()
            ->when($resort?->id, fn ($query) => $query->where('resort_id', $resort->id), fn ($query) => $query)
            ->whereIn('status', ['Pending', 'Pending Inquiry'])
            ->count();

        $pendingBookings = Booking::query()->tap($baseQuery)->where('status', 'Pending')->count();

        $confirmedBookings = Booking::query()->tap($baseQuery)->where('status', 'Confirmed')->count();

        $rejectedBookings = Booking::query()->tap($baseQuery)->where('status', 'Rejected')->count();

        $totalBookings = Booking::query()->tap($baseQuery)->count();

        $totalInquiries = Inquiry::query()->tap($baseQuery)->count();

        $todayArrivalsCount = Booking::query()
            ->tap($baseQuery)
            ->whereDate('booking_date', today())
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        $todayArrivals = Booking::query()
            ->tap($baseQuery)
            ->with('user', 'cottage')
            ->whereDate('booking_date', today())
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->latest('booking_date')
            ->limit(5)
            ->get();

        $recentInquiries = Inquiry::query()
            ->tap($baseQuery)
            ->with('user')
            ->latest()
            ->limit(5)
            ->get();

        $recentBookings = Booking::query()
            ->tap($baseQuery)
            ->with('user', 'cottage')
            ->latest()
            ->limit(5)
            ->get();

        $upcomingBookings = Booking::query()
            ->tap($baseQuery)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('booking_date', '>=', today())
            ->with('user', 'cottage')
            ->orderBy('booking_date')
            ->limit(5)
            ->get();

        $pendingBookingsList = Booking::query()
            ->tap($baseQuery)
            ->where('status', 'Pending')
            ->with('user', 'cottage')
            ->latest()
            ->limit(5)
            ->get();

        $pendingInquiriesList = Inquiry::query()
            ->tap($baseQuery)
            ->whereIn('status', ['Pending', 'Pending Inquiry'])
            ->with('user')
            ->latest()
            ->limit(5)
            ->get();

        $totalCustomers = Booking::query()
            ->tap($baseQuery)
            ->distinct('user_id')
            ->count('user_id');

        $monthStart = $calendarMonth
            ? Carbon::createFromFormat('Y-m', $calendarMonth)->startOfMonth()
            : today()->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $sectionBookings = match ($section) {
            'calendar' => Booking::query()
                ->tap($baseQuery)
                ->with('user', 'cottage')
                ->whereBetween('booking_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->orderBy('booking_date')
                ->get(),
            'guests' => Booking::query()
                ->tap($baseQuery)
                ->with('user')
                ->latest()
                ->limit(100)
                ->get()
                ->unique('user_id')
                ->values(),
            default => collect(),
        };

        $cottageAvailability = Cottage::query()
            ->where('resort_id', $resort->id)
            ->with(['bookings' => function ($query): void {
                $query->whereDate('booking_date', today())
                    ->whereIn('status', ['Pending', 'Confirmed']);
            }])
            ->orderBy('name')
            ->get()
            ->map(function (Cottage $cottage): array {
                $bookedQuantity = $cottage->bookings->sum('cottage_quantity');
                $availabilityStatus = $cottage->status === 'Available' && $bookedQuantity >= $cottage->quantity
                    ? 'Booked'
                    : $cottage->status;

                return [
                    'id' => $cottage->id,
                    'name' => $cottage->name,
                    'status' => $availabilityStatus,
                    'availableQuantity' => $cottage->status === 'Available'
                        ? max(0, $cottage->quantity - $bookedQuantity)
                        : 0,
                ];
            });

        $stats = [
            'totalBookings' => $totalBookings,
            'pendingInquiries' => $pendingInquiries,
            'pendingBookings' => $pendingBookings,
            'confirmedBookings' => $confirmedBookings,
            'rejectedBookings' => $rejectedBookings,
            'totalInquiries' => $totalInquiries,
            'totalCustomers' => $totalCustomers,
            'todayArrivals' => $todayArrivalsCount,
            'availableCottages' => $cottageAvailability->sum('availableQuantity'),
        ];

        return Inertia::render('Admin/ResortDashboard', [
            'user' => $user,
            'resort' => $resort,
            'stats' => $stats,
            'section' => $section,
            'calendarMonth' => $monthStart->format('Y-m'),
            'currentMonth' => today()->format('Y-m'),
            'sectionBookings' => $sectionBookings,
            'todayArrivals' => $todayArrivals,
            'pendingBookingsList' => $pendingBookingsList,
            'pendingInquiriesList' => $pendingInquiriesList,
            'recentInquiries' => $recentInquiries,
            'recentBookings' => $recentBookings,
            'upcomingBookings' => $upcomingBookings,
            'cottageAvailability' => $cottageAvailability,
            'notifications' => $user->unreadNotifications()
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($notification): array => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Resort update',
                    'message' => $notification->data['message'] ?? '',
                    'url' => $notification->data['url'] ?? '/resort-admin',
                    'createdAt' => $notification->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
