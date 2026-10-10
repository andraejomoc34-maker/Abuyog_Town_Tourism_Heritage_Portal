<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use App\Services\FaceLivenessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\FacebookProvider;
use Laravel\Socialite\Two\InvalidStateException;

class AuthController extends Controller
{
    private const FACE_LIVENESS_UNAVAILABLE = 'Face verification is currently unavailable. Please try again later.';

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
        if (! $this->facebookIsConfigured()) {
            return $this->facebookLoginError(
                request(),
                'Facebook login is not configured. Please use email and password or contact the site administrator.',
            );
        }

        /** @var FacebookProvider $facebookProvider */
        $facebookProvider = Socialite::driver('facebook');

        return $facebookProvider
            ->scopes(['email', 'public_profile'])
            ->redirect();
    }

    public function handleFacebookCallback(Request $request): RedirectResponse
    {
        if (! $this->facebookIsConfigured()) {
            return $this->facebookLoginError(
                $request,
                'Facebook login is not configured. Please use email and password or contact the site administrator.',
            );
        }

        if ($request->query('error') !== null || $request->query('error_reason') !== null) {
            return $this->facebookLoginError(
                $request,
                'Facebook sign-in was cancelled. You can continue with email and password.',
            );
        }

        try {
            $facebookUser = Socialite::driver('facebook')->user();
        } catch (InvalidStateException) {
            return $this->facebookLoginError(
                $request,
                'Facebook sign-in expired or could not be verified. Please try again.',
            );
        } catch (\Throwable) {
            return $this->facebookLoginError(
                $request,
                'Facebook could not complete sign-in. Please try again or use email and password.',
            );
        }

        $facebookId = trim((string) $facebookUser->getId());

        if ($facebookId === '') {
            return $this->facebookLoginError(
                $request,
                'Facebook did not return a valid account identifier. Please try again.',
            );
        }

        $user = User::query()->where('facebook_id', $facebookId)->first();

        if ($user) {
            if ($user->role !== 'user') {
                return $this->facebookLoginError(
                    $request,
                    'Facebook sign-in is available for customer accounts only. Use your existing administrator sign-in.',
                );
            }

            if (! $user->is_active) {
                return $this->facebookLoginError($request, 'This account has been disabled.');
            }

            $request->session()->forget('pending_facebook_signup');
            Auth::login($user);
            $request->session()->regenerate();

            if (blank($user->contact_number)) {
                return redirect()->route('auth.complete-profile')->with(
                    'success',
                    'Please complete your account information.',
                );
            }

            return redirect()->route($this->resolveDashboardRouteFor($user));
        }

        $validatedEmail = filter_var(
            strtolower(trim((string) ($facebookUser->getEmail() ?? ''))),
            FILTER_VALIDATE_EMAIL,
        );
        $email = is_string($validatedEmail) ? $validatedEmail : null;

        if ($email !== null && User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return $this->facebookLoginError(
                $request,
                'An account already uses this email address. Sign in with your existing method; Facebook was not linked.',
            );
        }

        $name = trim((string) ($facebookUser->getName() ?? ''));
        $request->session()->put('pending_facebook_signup', [
            'name' => $name !== '' ? $name : 'Facebook User',
            'email' => $email,
            'facebook_id' => $facebookId,
        ]);

        return redirect()->route('register');
    }

    private function facebookIsConfigured(): bool
    {
        return filled(config('services.facebook.client_id'))
            && filled(config('services.facebook.client_secret'))
            && filled(config('services.facebook.redirect'));
    }

    private function facebookLoginError(Request $request, string $message): RedirectResponse
    {
        $request->session()->forget('pending_facebook_signup');

        return redirect()->route('login')->withErrors(['email' => $message]);
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

    public function createRegistration(Request $request, FaceLivenessService $faceLiveness): Response
    {
        $verification = $request->session()->get('registration.face_liveness');
        $verifiedAt = is_array($verification) ? ($verification['verified_at'] ?? null) : null;

        return Inertia::render('auth/register', [
            'faceLiveness' => [
                'configured' => $faceLiveness->hasBrowserConfiguration(),
                'challengeToken' => is_array($verification) ? ($verification['challenge_token'] ?? null) : null,
                'confidenceThreshold' => (float) config('services.face_liveness.confidence_threshold', 80),
                'region' => config('services.face_liveness.region'),
                'identityPoolId' => config('services.face_liveness.identity_pool_id'),
                'sessionId' => is_array($verification) ? ($verification['session_id'] ?? null) : null,
                'verified' => is_numeric($verifiedAt)
                    && now()->timestamp - (int) $verifiedAt <= 175
                    && now()->timestamp >= (int) $verifiedAt,
            ],
            'pendingFacebookSignup' => $request->session()->get('pending_facebook_signup') ? [
                'name' => $request->session()->get('pending_facebook_signup.name'),
                'email' => $request->session()->get('pending_facebook_signup.email'),
            ] : null,
        ]);
    }

    public function createFaceLivenessSession(Request $request, FaceLivenessService $faceLiveness): RedirectResponse
    {
        if (! $faceLiveness->hasBrowserConfiguration()) {
            return back()->withErrors([
                'face_verification' => self::FACE_LIVENESS_UNAVAILABLE,
            ]);
        }

        try {
            $sessionId = $faceLiveness->createSession();
            $challengeToken = $faceLiveness->createChallengeToken();
            $faceLiveness->storeSessionChallenge($sessionId, $challengeToken);
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_verification' => self::FACE_LIVENESS_UNAVAILABLE,
            ]);
        }

        $request->session()->put('registration.face_liveness', [
            'session_id' => $sessionId,
            'challenge_token' => $challengeToken,
            'expires_at' => now()->addSeconds(175)->timestamp,
            'verified_at' => null,
        ]);

        return redirect()->route('register');
    }

    public function completeFaceVerification(Request $request, FaceLivenessService $faceLiveness): RedirectResponse
    {
        $verification = $request->session()->get('registration.face_liveness');

        if (! is_array($verification)
            || ! is_string($verification['session_id'] ?? null)
            || ! is_numeric($verification['expires_at'] ?? null)
            || now()->timestamp > (int) $verification['expires_at']) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'Verification expired. Please try again.',
            ]);
        }

        $localBrowserVerification = (bool) config('services.face_liveness.local_browser', true);
        $validated = $request->validate([
            'challenge_token' => [$localBrowserVerification ? 'required_with:capture' : 'nullable', 'string', 'max:128'],
            'capture' => [$localBrowserVerification ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'face_confidence' => [$localBrowserVerification ? 'required_with:capture' : 'nullable', 'numeric', 'min:0.5', 'max:1'],
            'face_count' => [$localBrowserVerification ? 'required_with:capture' : 'nullable', 'integer', 'in:1'],
        ]);

        if (isset($validated['capture'])) {
            try {
                $results = $faceLiveness->recordLocalVerification(
                    $verification['session_id'],
                    $validated['challenge_token'],
                    $validated['capture'],
                    (float) $validated['face_confidence'],
                    (int) $validated['face_count'],
                );
            } catch (\RuntimeException) {
                return back()->withErrors([
                    'face_verification' => 'Verification failed. Please try again.',
                ]);
            } catch (\Throwable $exception) {
                report($exception);

                return back()->withErrors([
                    'face_verification' => self::FACE_LIVENESS_UNAVAILABLE,
                ]);
            }
        } else {
            try {
                $results = $faceLiveness->getSessionResults($verification['session_id']);
            } catch (\Throwable $exception) {
                report($exception);

                return back()->withErrors([
                    'face_verification' => self::FACE_LIVENESS_UNAVAILABLE,
                ]);
            }
        }

        if ($results['status'] !== 'SUCCEEDED'
            || $results['confidence'] === null
            || $results['confidence'] < (float) config('services.face_liveness.confidence_threshold', 80)
            || $results['face_count'] !== 1) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'Verification failed. Please try again.',
            ]);
        }

        $request->session()->put('registration.face_liveness.verified_at', now()->timestamp);

        return redirect()->route('register');
    }

    public function cancelFaceLivenessSession(Request $request): RedirectResponse
    {
        $request->session()->forget('registration.face_liveness');

        return redirect()->route('register');
    }

    public function register(Request $request): RedirectResponse
    {
        if (! $this->hasCurrentFaceVerification($request)) {
            return back()->withErrors([
                'face_verification' => 'Complete face verification before creating your account.',
            ]);
        }

        $pendingFacebookSignup = $request->session()->get('pending_facebook_signup');
        $isFacebookSignup = is_array($pendingFacebookSignup);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'contact_number' => [$isFacebookSignup ? 'required' : 'nullable', 'string', 'max:30'],
            'password' => [$isFacebookSignup ? 'nullable' : 'required', 'confirmed', 'string', 'min:8'],
            'terms' => ['accepted'],
        ]);

        $pendingFacebookEmail = is_array($pendingFacebookSignup)
            ? ($pendingFacebookSignup['email'] ?? null)
            : null;

        if ($isFacebookSignup
            && filled($pendingFacebookEmail)
            && strtolower($validated['email']) !== strtolower((string) $pendingFacebookEmail)) {
            return back()->withErrors([
                'email' => 'Use the email address returned by Facebook to continue.',
            ]);
        }

        if ($isFacebookSignup
            && User::query()->whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->exists()) {
            return back()->withErrors([
                'email' => 'This email already belongs to an account. Sign in with your existing method; Facebook was not linked.',
            ]);
        }

        $verification = $request->session()->get('registration.face_liveness');
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        if (! is_string($sessionId)
            || ! Cache::add(
                'registration.face-liveness.consumed.'.hash('sha256', $sessionId),
                true,
                now()->addSeconds(175),
            )) {
            return back()->withErrors([
                'face_verification' => 'This verification was already used. Please verify again.',
            ]);
        }

        $user = User::create([
            'name' => $isFacebookSignup ? $pendingFacebookSignup['name'] : $validated['name'],
            'email' => $isFacebookSignup && filled($pendingFacebookEmail)
                ? $pendingFacebookEmail
                : $validated['email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'password' => Hash::make($isFacebookSignup
                ? bin2hex(random_bytes(16))
                : $validated['password']),
            'role' => 'user',
            'facebook_id' => $isFacebookSignup ? $pendingFacebookSignup['facebook_id'] : null,
        ]);

        $request->session()->forget(['registration.face_liveness', 'pending_facebook_signup']);
        Auth::login($user);
        $request->session()->regenerate();

        if (blank($user->contact_number)) {
            return redirect()->route('auth.complete-profile')->with('success', 'Please complete your account information.');
        }

        return redirect()->route('dashboard');
    }

    private function hasCurrentFaceVerification(Request $request): bool
    {
        $verification = $request->session()->get('registration.face_liveness');
        $verifiedAt = is_array($verification) ? ($verification['verified_at'] ?? null) : null;

        return is_numeric($verifiedAt)
            && now()->timestamp - (int) $verifiedAt <= 175
            && now()->timestamp >= (int) $verifiedAt;
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
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $previousPhotoPath = $user->profile_photo_path;
        $profilePhoto = $validated['profile_photo'] ?? null;
        unset($validated['profile_photo']);

        if ($profilePhoto) {
            $user->profile_photo_path = $profilePhoto->store('profile-photos', 'public');
        }

        $user->fill($validated)->save();

        if ($profilePhoto && $previousPhotoPath) {
            Storage::disk('public')->delete($previousPhotoPath);
        }

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
