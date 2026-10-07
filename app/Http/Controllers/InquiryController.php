<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Resort;
use App\Services\ResortAdminNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $query = Inquiry::query()->with('resort');

        if ($user?->role === 'resort_admin') {
            $query->where('resort_id', $user->resort_id);
        } elseif ($user?->role === 'user') {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Inquiries/Index', [
            'inquiries' => $query->latest()->get(),
        ]);
    }

    public function adminIndex(): Response
    {
        $user = Auth::user();

        if (! $user || ! in_array($user->role, ['resort_admin', 'municipality_admin', 'super_admin'], true)) {
            abort(403);
        }

        $query = Inquiry::query()->with('resort', 'user');

        if ($user->role === 'resort_admin') {
            $query->where('resort_id', $user->resort_id);
        }

        return Inertia::render('Admin/Inquiries/Index', [
            'inquiries' => $query->latest()->get(),
        ]);
    }

    public function resortAdminIndex(): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'resort_admin' || ! $user->resort_id) {
            abort(403);
        }

        return Inertia::render('Admin/Inquiries/Index', [
            'inquiries' => Inquiry::query()
                ->where('resort_id', $user->resort_id)
                ->with('resort', 'user')
                ->latest()
                ->get(),
        ]);
    }

    public function show(Inquiry $inquiry): Response
    {
        $this->authorize('view', $inquiry);

        return Inertia::render('Inquiries/Show', [
            'inquiry' => $inquiry->load('resort', 'user'),
        ]);
    }

    public function showForAdmin(Inquiry $inquiry): Response
    {
        $this->authorize('view', $inquiry);

        return Inertia::render('Admin/Inquiries/Show', [
            'inquiry' => $inquiry->load('resort', 'user'),
        ]);
    }

    public function showForResortAdmin(Inquiry $inquiry): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'resort_admin' || ! $user->resort_id) {
            abort(403);
        }

        abort_unless((int) $inquiry->resort_id === (int) $user->resort_id, 403);
        $this->authorize('view', $inquiry);

        return Inertia::render('Admin/Inquiries/Show', [
            'inquiry' => $inquiry->load('resort', 'user'),
        ]);
    }

    public function store(Request $request, Resort $resort, ResortAdminNotifier $notifier): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if (strtolower((string) ($resort->status ?? 'active')) !== 'active') {
            abort(403, 'This resort is currently unavailable.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'contact_information' => ['nullable', 'string', 'max:255'],
        ]);

        $inquiry = Inquiry::create([
            'user_id' => $user->id,
            'resort_id' => $resort->id,
            'message' => $validated['message'],
            'contact_information' => $validated['contact_information'] ?? null,
            'status' => 'Pending',
        ]);

        $notifier->notifyForResort(
            $resort->id,
            'New inquiry',
            $user->name.' sent a new inquiry.',
            '/resort-admin/inquiries/'.$inquiry->id,
        );

        return redirect()->route('inquiries.index')->with('success', 'Inquiry submitted successfully.');
    }

    public function updateStatus(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $this->authorize('update', $inquiry);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Pending,Answered,Closed'],
        ]);

        $inquiry->update([
            'status' => $validated['status'],
        ]);

        if ($validated['status'] === 'Answered') {
            return back()->with('success', 'Inquiry answered.');
        }

        if ($validated['status'] === 'Closed') {
            return back()->with('success', 'Inquiry closed.');
        }

        return back()->with('success', 'Inquiry status updated.');
    }
}
