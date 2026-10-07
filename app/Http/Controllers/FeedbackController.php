<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Feedback;
use App\Models\User;
use App\Services\ResortAdminNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function resortAdminIndex(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->role === 'resort_admin' && $user->resort_id,
            403,
        );

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => Feedback::query()
                ->where('resort_id', $user->resort_id)
                ->with('user')
                ->latest()
                ->get(['id', 'user_id', 'name', 'email', 'rating', 'message', 'status', 'created_at']),
        ]);
    }

    public function storeForBooking(Request $request, Booking $booking, ResortAdminNotifier $notifier): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User && $booking->user_id === $user->id, 403);
        abort_unless($booking->status === 'Completed', 403, 'Feedback is available after a completed booking.');

        if ($booking->feedback()->exists()) {
            return back()->with('error', 'Feedback has already been submitted for this booking.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Feedback::create([
            ...$validated,
            'user_id' => $user->id,
            'resort_id' => $booking->resort_id,
            'booking_id' => $booking->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);

        $notifier->notifyForResort(
            $booking->resort_id,
            'New resort review',
            $user->name.' submitted a '.$validated['rating'].'-star review.',
            '/resort-admin/reviews',
        );

        return back()->with('success', 'Thank you for reviewing your stay.');
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            $request->merge([
                'name' => $user->name,
                'email' => $user->email,
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Feedback::create([
            ...$validated,
            'user_id' => $user instanceof User ? $user->id : null,
        ]);

        return back()->with('success', 'Thank you for your feedback!');
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && in_array($user->role, ['municipality_admin', 'super_admin'], true),
            403,
        );

        return Inertia::render('Admin/Feedback', [
            'feedback' => Feedback::query()
                ->latest()
                ->get(['id', 'name', 'email', 'rating', 'message', 'status', 'created_at']),
        ]);
    }
}
