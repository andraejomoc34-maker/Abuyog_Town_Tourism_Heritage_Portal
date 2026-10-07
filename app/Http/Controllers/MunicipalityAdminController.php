<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MunicipalityAdminController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $this->authorizeMunicipalityAccess($request);

        return Inertia::render('Municipality/Dashboard', [
            'user' => ['name' => $user->name],
            'stats' => $this->statistics(),
            'recentAnnouncements' => Announcement::query()
                ->latest('updated_at')
                ->limit(5)
                ->get(['id', 'title', 'status', 'updated_at']),
        ]);
    }

    public function resorts(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        $rows = Resort::query()
            ->withCount(['bookings', 'inquiries'])
            ->orderBy('name')
            ->get()
            ->map(fn (Resort $resort): array => [
                'name' => $resort->name,
                'location' => $resort->location,
                'status' => $resort->status,
                'bookings' => $resort->bookings_count,
                'inquiries' => $resort->inquiries_count,
            ]);

        return $this->records('Resorts', $rows->all(), 'No resorts are registered yet.');
    }

    public function bookings(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        $query = Booking::query()->with(['user:id,name', 'resort:id,name']);
        $status = $request->query('status');

        if (in_array($status, ['Pending', 'Confirmed', 'Completed'], true)) {
            $query->where('status', $status);
        }

        $rows = $query->latest()
            ->get()
            ->map(fn (Booking $booking): array => [
                'reference' => $booking->reference_number ?? '#'.$booking->id,
                'customer' => $booking->user?->name ?? 'Customer',
                'resort' => $booking->resort?->name ?? 'Resort',
                'date' => $booking->booking_date,
                'guests' => $booking->guests,
                'status' => $booking->status,
            ]);

        return $this->records('All Bookings', $rows->all(), 'No bookings have been submitted.');
    }

    public function inquiries(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        $rows = Inquiry::query()
            ->with(['user:id,name', 'resort:id,name'])
            ->latest()
            ->get()
            ->map(fn (Inquiry $inquiry): array => [
                'customer' => $inquiry->user?->name ?? 'Customer',
                'resort' => $inquiry->resort?->name ?? 'Resort',
                'message' => $inquiry->message,
                'status' => $inquiry->status,
                'submitted' => $inquiry->created_at?->toDateTimeString(),
            ]);

        return $this->records('All Inquiries', $rows->all(), 'No inquiries have been submitted.');
    }

    public function users(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        $rows = User::query()
            ->where('role', 'user')
            ->latest()
            ->get(['id', 'name', 'created_at'])
            ->map(fn (User $user): array => [
                'name' => $user->name,
                'joined' => $user->created_at?->toDateString(),
            ]);

        return $this->records('Registered Users', $rows->all(), 'No visitors have registered yet.');
    }

    public function touristSpots(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        $rows = TouristSpot::query()
            ->orderBy('name')
            ->get(['name', 'category', 'location', 'status'])
            ->map(fn (TouristSpot $spot): array => [
                'name' => $spot->name,
                'category' => $spot->category,
                'location' => $spot->location,
                'status' => $spot->status,
            ]);

        return $this->records('Tourist Spots', $rows->all(), 'No tourist spots are recorded.');
    }

    public function cottages(Request $request): Response
    {
        $this->authorizeMunicipalityAccess($request);

        return $this->records(
            'Cottages',
            [],
            'Cottage records are not available in the current database.',
        );
    }

    public function reports(Request $request): Response
    {
        $user = $this->authorizeMunicipalityAccess($request);

        return Inertia::render('Municipality/Reports', [
            'user' => ['name' => $user->name],
            'stats' => $this->statistics(),
        ]);
    }

    private function authorizeMunicipalityAccess(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && in_array($user->role, ['municipality_admin', 'super_admin'], true),
            403,
        );

        return $user;
    }

    private function statistics(): array
    {
        return [
            'totalTouristSpots' => TouristSpot::count(),
            'totalHeritageSites' => TouristSpot::where('category', 'Heritage')->count(),
            'totalResorts' => Resort::count(),
            'totalEvents' => Announcement::whereIn('category', ['Event', 'Festival'])->count(),
            'totalRegisteredUsers' => User::where('role', 'user')->count(),
            'totalResortAdmins' => User::where('role', 'resort_admin')->count(),
            'totalBookings' => Booking::count(),
            'pendingBookings' => Booking::where('status', 'Pending')->count(),
            'confirmedBookings' => Booking::where('status', 'Confirmed')->count(),
            'totalInquiries' => Inquiry::count(),
            'totalAnnouncements' => Announcement::count(),
        ];
    }

    private function records(string $title, array $records, string $emptyMessage): Response
    {
        return Inertia::render('Municipality/Records', [
            'title' => $title,
            'records' => $records,
            'emptyMessage' => $emptyMessage,
        ]);
    }
}
