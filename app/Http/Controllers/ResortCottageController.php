<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Cottage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ResortCottageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $this->resortAdmin($request);

        return Inertia::render('Admin/Cottages/Index', [
            'cottages' => Cottage::query()
                ->where('resort_id', $user->resort_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->resortAdmin($request);
        $validated = $request->validate($this->rules());

        Cottage::create([
            ...$validated,
            'resort_id' => $user->resort_id,
        ]);

        return redirect()->route('resort-admin.cottages')->with('success', 'Cottage added.');
    }

    public function update(Request $request, Cottage $cottage): RedirectResponse
    {
        $user = $this->resortAdmin($request);
        $this->authorizeCottage($cottage, $user);
        $validated = $request->validate($this->rules());

        $overAllocatedDateExists = Booking::query()
            ->where('cottage_id', $cottage->id)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->select('booking_date')
            ->groupBy('booking_date')
            ->havingRaw('SUM(cottage_quantity) > ?', [$validated['quantity']])
            ->exists();

        if ($overAllocatedDateExists) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity cannot be lower than existing pending or confirmed reservations.',
            ]);
        }

        $capacityConflictExists = Booking::query()
            ->where('cottage_id', $cottage->id)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->where('guests', '>', $validated['capacity'])
            ->exists();

        if ($capacityConflictExists) {
            throw ValidationException::withMessages([
                'capacity' => 'Capacity cannot be lowered below an existing pending or confirmed booking.',
            ]);
        }

        $cottage->update($validated);

        return redirect()->route('resort-admin.cottages')->with('success', 'Cottage updated.');
    }

    public function destroy(Request $request, Cottage $cottage): RedirectResponse
    {
        $user = $this->resortAdmin($request);
        $this->authorizeCottage($cottage, $user);

        if ($cottage->bookings()->exists()) {
            return back()->with('error', 'Cottages with booking history cannot be removed. Set the cottage to Unavailable instead.');
        }

        $cottage->delete();

        return redirect()->route('resort-admin.cottages')->with('success', 'Cottage removed.');
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

    private function authorizeCottage(Cottage $cottage, User $user): void
    {
        abort_unless((int) $cottage->resort_id === (int) $user->resort_id, 403);
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'capacity' => ['required', 'integer', 'min:1', 'max:500'],
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'status' => ['required', 'in:Available,Maintenance,Unavailable'],
        ];
    }
}
