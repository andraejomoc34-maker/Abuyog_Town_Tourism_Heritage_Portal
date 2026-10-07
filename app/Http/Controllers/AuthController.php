<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function createLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        if (! Auth::attempt($credentials, $remember)) {
            return back()->withErrors([
                'email' => 'Those credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user instanceof User && ! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'This account has been disabled.',
            ])->onlyInput('email');
        }

        $intendedUrl = $request->session()->pull('intended_url');

        if ($user && $user->role === 'hotel_admin') {
            return redirect()->to($intendedUrl ?: route('hotel-admin.dashboard'));
        }

        if ($user && $user->role === 'resort_admin') {
            return redirect()->to($intendedUrl ?: route('admin.resort.dashboard'));
        }

        if ($user && $user->role === 'super_admin') {
            return redirect()->to($intendedUrl ?: route('super-admin.dashboard'));
        }

        if ($user && $user->role === 'municipality_admin') {
            return redirect()->to($intendedUrl ?: route('municipality-admin.dashboard'));
        }

        return redirect()->to($intendedUrl ?: route('dashboard'));
    }

    public function redirectToFacebook(): \Symfony\Component\HttpFoundation\RedirectResponse
    {
        return Socialite::driver('facebook')->stateless()->redirect();
    }

    public function handleFacebookCallback(Request $request): RedirectResponse
    {
        $facebookUser = Socialite::driver('facebook')->stateless()->user();
        $email = strtolower((string) ($facebookUser->getEmail() ?? ''));
        $facebookId = $facebookUser->getId();
        $name = $facebookUser->getName() ?: 'Facebook User';
        $avatar = $facebookUser->getAvatar();

        if ($email === '') {
            return redirect()->route('login')->withErrors([
                'email' => 'Facebook did not provide an email address for this account.',
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user && $facebookId) {
            $user = User::query()->where('facebook_id', $facebookId)->first();
        }

        if (! $user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'role' => 'user',
                'contact_number' => null,
                'facebook_id' => $facebookId,
                'facebook_avatar' => $avatar,
            ]);
        } else {
            $user->fill([
                'name' => $user->name ?: $name,
                'email' => $email,
                'facebook_id' => $facebookId ?: $user->facebook_id,
                'facebook_avatar' => $avatar ?: $user->facebook_avatar,
            ]);
            $user->save();
        }

        if (! $user->is_active) {
            return redirect()->route('login')->withErrors([
                'email' => 'This account has been disabled.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        if (blank($user->contact_number)) {
            return redirect()->route('auth.complete-profile')->with('success', 'Please complete your account information.');
        }

        return redirect()->route($this->resolveDashboardRouteFor($user));
    }

    public function completeProfile(): Response
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            abort(401);
        }

        return Inertia::render('auth/complete-profile', [
            'user' => $user,
        ]);
    }

    public function storeCompleteProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'contact_number' => ['required', 'string', 'max:30'],
        ]);

        $user->update([
            'contact_number' => $validated['contact_number'],
        ]);

        return redirect()->route($this->resolveDashboardRouteFor($user))->with('success', 'Your account is ready.');
    }

    public function createRegistration(): Response
    {
        return Inertia::render('auth/register');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
            'terms' => ['accepted'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        if (blank($user->contact_number)) {
            return redirect()->route('auth.complete-profile')->with('success', 'Please complete your account information.');
        }

        return redirect()->route('dashboard');
    }

    public function dashboard(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User && $user->role === 'municipality_admin') {
            return redirect()->route('municipality-admin.dashboard');
        }

        if ($user && $user->role === 'resort_admin') {
            return Inertia::render('Admin/ResortDashboard', [
                'user' => $user->loadMissing('resort'),
                'resort' => $user->resort,
            ]);
        }

        if ($user && $user->role === 'super_admin') {
            return Inertia::render('dashboard', [
                'user' => $user,
            ]);
        }

        return Inertia::render('dashboard');
    }

    public function superAdminDashboard(): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'super_admin') {
            abort(403);
        }

        return Inertia::render('dashboard', [
            'user' => $user,
            'super_admin' => true,
            'stats' => [
                'totalUsers' => User::count(),
                'totalResorts' => Resort::count(),
                'totalBookings' => Booking::count(),
                'pendingBookings' => Booking::where('status', 'Pending')->count(),
                'confirmedBookings' => Booking::where('status', 'Confirmed')->count(),
                'totalInquiries' => Inquiry::count(),
            ],
        ]);
    }

    public function profile(): Response
    {
        return Inertia::render('profile');
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'contact_number' => ['nullable', 'string', 'max:30'],
        ]);

        $user->fill($validated)->save();

        return back();
    }

    protected function resolveDashboardRouteFor(User $user): string
    {
        return match ($user->role) {
            'resort_admin' => 'resort-admin.dashboard',
            'hotel_admin' => 'hotel-admin.dashboard',
            'super_admin' => 'super-admin.dashboard',
            'municipality_admin' => 'municipality-admin.dashboard',
            default => 'dashboard',
        };
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
