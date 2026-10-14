<?php

namespace App\Http\Controllers;

use App\Exceptions\DuplicateFaceIdentityException;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use App\Services\FaceIdentityService;
use App\Services\FaceVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\FacebookProvider;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class AuthController extends Controller
{
    public function createLogin(): Response
    {
        return Inertia::render('auth/login', [
            'status' => session('status'),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $rules = [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];

        $credentials = $request->validate($rules);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        $user = User::query()->whereRaw('LOWER(email) = ?', [strtolower((string) $credentials['email'])])->first();

        if (! $user || ! Hash::check((string) $credentials['password'], (string) $user->password)) {
            return back()->withErrors([
                'email' => 'Those credentials do not match our records.',
            ])->onlyInput('email');
        }

        if (! $user->is_active) {
            return back()->withErrors([
                'email' => 'This account has been disabled.',
            ])->onlyInput('email');
        }

        Auth::login($user, $remember);
        $request->session()->regenerate();

        $intendedUrl = $request->session()->pull('intended_url');

        if ($user->role === 'hotel_admin') {
            return redirect()->to($intendedUrl ?: route('hotel-admin.dashboard'));
        }

        if ($user->role === 'resort_admin') {
            return redirect()->to($intendedUrl ?: route('admin.resort.dashboard'));
        }

        if ($user->role === 'super_admin') {
            return redirect()->to($intendedUrl ?: route('super-admin.dashboard'));
        }

        if ($user->role === 'municipality_admin') {
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
        } catch (Throwable) {
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

    public function createRegistration(Request $request, FaceVerificationService $faceProcessing): Response
    {
        return Inertia::render('auth/register', [
            'faceProcessing' => [
                'available' => $faceProcessing->isConfigured(),
                'model' => config('services.face_service.model', 'Facenet'),
                'warning' => 'We process a camera capture to confirm one usable face and securely store an encrypted face template to help prevent duplicate registrations. This does not prove your identity or detect presentation attacks.',
            ],
            'pendingFacebookSignup' => $request->session()->get('pending_facebook_signup') ? [
                'name' => $request->session()->get('pending_facebook_signup.name'),
                'email' => $request->session()->get('pending_facebook_signup.email'),
            ] : null,
        ]);
    }

    public function register(
        Request $request,
        FaceIdentityService $faceIdentity,
    ): RedirectResponse {
        $pendingFacebookSignup = $request->session()->get('pending_facebook_signup');
        $isFacebookSignup = is_array($pendingFacebookSignup);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'contact_number' => [$isFacebookSignup ? 'required' : 'nullable', 'string', 'max:30'],
            'password' => [$isFacebookSignup ? 'nullable' : 'required', 'confirmed', 'string', 'min:8'],
            'terms' => ['accepted'],
            'face_biometric_consent' => ['accepted'],
            'face_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];

        $validated = $request->validate($rules);

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

        $imageBytes = null;

        $faceImage = $request->file('face_image');

        if (! $faceImage instanceof UploadedFile || ! $faceImage->isValid()) {
            return back()->withErrors([
                'face_image' => 'Please capture a clear face image before continuing.',
            ]);
        }

        $imageBytes = $this->readUploadedImageBytes($faceImage);

        if (! is_string($imageBytes) || $imageBytes === '') {
            return back()->withErrors([
                'face_image' => 'The uploaded face image could not be read. Please try again.',
            ]);
        }

        try {
            $user = $faceIdentity->createUserWithEnrollment(
                $imageBytes,
                fn (): User => User::create([
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
                ]),
            );
        } catch (DuplicateFaceIdentityException) {
            return back()->withErrors([
                'face_verification' => 'This face is already enrolled. Please use your existing account or contact support.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_verification' => 'Face processing is temporarily unavailable or could not use this image. Please try again.',
            ]);
        }

        $request->session()->forget('pending_facebook_signup');
        Auth::login($user);
        $request->session()->regenerate();

        if (blank($user->contact_number)) {
            return redirect()->route('auth.complete-profile')->with('success', 'Please complete your account information.');
        }

        return redirect()->route('dashboard');
    }

    private function readUploadedImageBytes(UploadedFile $file): ?string
    {
        $candidatePaths = [
            $file->getRealPath(),
            $file->getPathname(),
            $file->path(),
        ];

        foreach ($candidatePaths as $path) {
            if (! is_string($path) || $path === '' || ! is_file($path)) {
                continue;
            }

            $contents = @file_get_contents($path);

            if (is_string($contents) && $contents !== '') {
                return $contents;
            }
        }

        try {
            $contents = $file->getContent();
        } catch (Throwable) {
            return null;
        }

        if (! is_string($contents) || $contents === '') {
            return null;
        }

        return $contents;
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

    public function profile(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('profile', [
            'faceEnrollment' => [
                'enrolled' => $user instanceof User && $user->role === 'user' && $user->faceIdentity()->exists(),
            ],
        ]);
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
            try {
                $newPhotoPath = Storage::disk('public')->putFile('profile-photos', $profilePhoto);
            } catch (Throwable $exception) {
                report($exception);

                return back()->withErrors([
                    'profile_photo' => 'The profile photo could not be saved. Please try again.',
                ]);
            }

            if (! is_string($newPhotoPath)) {
                report(new \RuntimeException('The public disk did not store the profile photo.'));

                return back()->withErrors([
                    'profile_photo' => 'The profile photo could not be saved. Please try again.',
                ]);
            }

            $user->profile_photo_path = $newPhotoPath;
        }

        try {
            $user->fill($validated)->save();
        } catch (Throwable $exception) {
            if ($profilePhoto && is_string($newPhotoPath ?? null)) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            report($exception);

            return back()->withErrors([
                'profile_photo' => 'Your profile could not be updated. Please try again.',
            ]);
        }

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
