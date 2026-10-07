<?php

use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminResortController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\HotelAdminController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\MunicipalityAdminController;
use App\Http\Controllers\PublicAnnouncementController;
use App\Http\Controllers\ResortAnnouncementController;
use App\Http\Controllers\ResortController;
use App\Http\Controllers\ResortCottageController;
use App\Http\Controllers\ResortGuestController;
use App\Http\Middleware\EnsureResortAdminEnabled;
use App\Models\Resort;
use App\Models\TouristSpot;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

Route::get('/', [PublicAnnouncementController::class, 'index'])->name('home');
Route::get('/announcements/{announcement}', [PublicAnnouncementController::class, 'show'])->name('announcements.show');
Route::post('/feedback', [FeedbackController::class, 'store'])->middleware('throttle:5,1')->name('feedback.store');
Route::inertia('/travel-guide', 'travel-guide')->name('travel-guide');
Route::get('/map', function (): Response {
    return Inertia::render('map', [
        'resorts' => Resort::query()
            ->where('status', 'active')
            ->get([
                'id',
                'name',
                'description',
                'location',
                'image',
                'image_url',
                'status',
            ])
            ->map(fn (Resort $resort): array => [
                'id' => $resort->id,
                'name' => $resort->name,
                'description' => $resort->description,
                'location' => $resort->location,
                'image_url' => $resort->image_url,
                'status' => $resort->status,
            ])
            ->all(),
        'touristSpots' => TouristSpot::query()
            ->where('status', 'active')
            ->get([
                'id',
                'name',
                'description',
                'location',
                'category',
                'image_url',
                'status',
            ])
            ->map(fn (TouristSpot $spot): array => [
                'id' => $spot->id,
                'name' => $spot->name,
                'description' => $spot->description,
                'location' => $spot->location,
                'category' => $spot->category,
                'image_url' => $spot->image_url,
                'status' => $spot->status,
            ])
            ->all(),
    ]);
})->name('map');
Route::get('/discover', function (): Response {
    return Inertia::render('discover/index', [
        'touristSpots' => TouristSpot::query()->where('status', 'active')->get([
            'id',
            'name',
            'description',
            'location',
            'category',
            'image_url',
            'status',
        ])->map(fn (TouristSpot $spot): array => [
            'id' => $spot->id,
            'name' => $spot->name,
            'description' => $spot->description,
            'location' => $spot->location,
            'category' => $spot->category,
            'image_url' => $spot->image_url,
            'status' => $spot->status,
        ])->all(),
    ]);
})->name('discover');
Route::inertia('/discover/nature', 'discover/nature')->name('discover.nature');
Route::inertia('/discover/heritage', 'discover/heritage')->name('discover.heritage');
Route::inertia('/discover/culture', 'discover/culture')->name('discover.culture');
Route::get('/resorts', [ResortController::class, 'index'])->name('resorts.index');
Route::get('/resorts/{resort}', [ResortController::class, 'show'])->name('resorts.show');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'createLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'createRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
    Route::get('/auth/facebook', [AuthController::class, 'redirectToFacebook'])->name('auth.facebook.redirect');
    Route::get('/auth/facebook/callback', [AuthController::class, 'handleFacebookCallback'])->name('auth.facebook.callback');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [AuthController::class, 'dashboard'])->name('dashboard');
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::patch('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::get('/auth/complete-profile', [AuthController::class, 'completeProfile'])->name('auth.complete-profile');
    Route::post('/auth/complete-profile', [AuthController::class, 'storeCompleteProfile'])->name('auth.complete-profile.store');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/resorts/{resort}/book', [ResortController::class, 'book'])->name('resorts.book');
    Route::post('/resorts/{resort}/book', [BookingController::class, 'store'])->name('resorts.book.store');
    Route::get('/resorts/{resort}/inquire', [ResortController::class, 'inquire'])->name('resorts.inquire');
    Route::post('/resorts/{resort}/inquire', [InquiryController::class, 'store'])->name('resorts.inquire.store');

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings/{booking}/feedback', [FeedbackController::class, 'storeForBooking'])->name('bookings.feedback.store');
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.status');
    Route::get('/my-bookings', [BookingController::class, 'index'])->name('my-bookings');
    Route::get('/my-bookings/{booking}', [BookingController::class, 'show'])->name('my-bookings.show');

    Route::get('/inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
    Route::get('/inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
    Route::patch('/inquiries/{inquiry}/status', [InquiryController::class, 'updateStatus'])->name('inquiries.status');
    Route::get('/my-inquiries', [InquiryController::class, 'index'])->name('my-inquiries');
    Route::get('/my-inquiries/{inquiry}', [InquiryController::class, 'show'])->name('my-inquiries.show');

    Route::middleware(EnsureResortAdminEnabled::class)->group(function (): void {
        Route::get('/admin', fn () => redirect()->route('resort-admin.dashboard'));
        Route::get('/admin/resort', fn () => redirect()->route('resort-admin.dashboard'));
        Route::get('/admin/resort/dashboard', [AdminResortController::class, 'dashboard'])->name('admin.resort.dashboard');
        Route::get('/admin/resort/bookings', [BookingController::class, 'adminIndex'])->name('admin.resort.bookings');
        Route::get('/admin/resort/bookings/{booking}', [BookingController::class, 'showForAdmin'])->name('admin.resort.bookings.show');
        Route::get('/admin/resort/inquiries', [InquiryController::class, 'adminIndex'])->name('admin.resort.inquiries');
        Route::get('/admin/resort/inquiries/{inquiry}', [InquiryController::class, 'showForAdmin'])->name('admin.resort.inquiries.show');

        Route::get('/resort-admin', [AdminResortController::class, 'dashboard'])->name('resort-admin.dashboard');
        Route::get('/resort-admin/bookings', [BookingController::class, 'resortAdminIndex'])->name('resort-admin.bookings');
        Route::get('/resort-admin/bookings/{booking}', [BookingController::class, 'showForResortAdmin'])->name('resort-admin.bookings.show');
        Route::get('/resort-admin/calendar', [AdminResortController::class, 'calendar'])->name('resort-admin.calendar');
        Route::get('/resort-admin/cottages', [ResortCottageController::class, 'index'])->name('resort-admin.cottages');
        Route::post('/resort-admin/cottages', [ResortCottageController::class, 'store'])->name('resort-admin.cottages.store');
        Route::put('/resort-admin/cottages/{cottage}', [ResortCottageController::class, 'update'])->name('resort-admin.cottages.update');
        Route::delete('/resort-admin/cottages/{cottage}', [ResortCottageController::class, 'destroy'])->name('resort-admin.cottages.destroy');
        Route::get('/resort-admin/inquiries', [InquiryController::class, 'resortAdminIndex'])->name('resort-admin.inquiries');
        Route::get('/resort-admin/inquiries/{inquiry}', [InquiryController::class, 'showForResortAdmin'])->name('resort-admin.inquiries.show');
        Route::get('/resort-admin/guests', [ResortGuestController::class, 'index'])->name('resort-admin.guests');
        Route::get('/resort-admin/guests/{guest}', [ResortGuestController::class, 'show'])->name('resort-admin.guests.show');
        Route::get('/resort-admin/reviews', [FeedbackController::class, 'resortAdminIndex'])->name('resort-admin.reviews');
        Route::get('/resort-admin/reports', [AdminResortController::class, 'reports'])->name('resort-admin.reports');
        Route::get('/resort-admin/announcements', [ResortAnnouncementController::class, 'index'])->name('resort-admin.announcements');
        Route::get('/resort-admin/announcements/create', [ResortAnnouncementController::class, 'create'])->name('resort-admin.announcements.create');
        Route::post('/resort-admin/announcements', [ResortAnnouncementController::class, 'store'])->name('resort-admin.announcements.store');
        Route::get('/resort-admin/announcements/{announcement}/edit', [ResortAnnouncementController::class, 'edit'])->name('resort-admin.announcements.edit');
        Route::put('/resort-admin/announcements/{announcement}', [ResortAnnouncementController::class, 'update'])->name('resort-admin.announcements.update');
        Route::patch('/resort-admin/announcements/{announcement}/status', [ResortAnnouncementController::class, 'updateStatus'])->name('resort-admin.announcements.status');
        Route::get('/resort-admin/settings', [AdminResortController::class, 'settings'])->name('resort-admin.settings');
        Route::patch('/resort-admin/settings', [AdminResortController::class, 'updateSettings'])->name('resort-admin.settings.update');
        Route::patch('/resort-admin/notifications/{notification}/read', [AdminResortController::class, 'markNotificationRead'])->name('resort-admin.notifications.read');
        Route::get('/resort-admin/profile', [AuthController::class, 'profile'])->name('resort-admin.profile');
    });

    Route::prefix('hotel-admin')->name('hotel-admin.')->group(function (): void {
        Route::get('/', [HotelAdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/bookings', [HotelAdminController::class, 'bookings'])->name('bookings');
        Route::get('/bookings/{booking}', [HotelAdminController::class, 'showBooking'])->whereNumber('booking')->name('bookings.show');
        Route::patch('/bookings/{booking}/status', [HotelAdminController::class, 'updateBookingStatus'])->whereNumber('booking')->name('bookings.status');
        Route::get('/calendar', [HotelAdminController::class, 'calendar'])->name('calendar');
        Route::get('/rooms', [HotelAdminController::class, 'rooms'])->name('rooms');
        Route::post('/rooms', [HotelAdminController::class, 'storeRoom'])->name('rooms.store');
        Route::put('/rooms/{room}', [HotelAdminController::class, 'updateRoom'])->whereNumber('room')->name('rooms.update');
        Route::get('/guests', [HotelAdminController::class, 'guests'])->name('guests');
        Route::get('/reports', [HotelAdminController::class, 'reports'])->name('reports');
        Route::get('/profile', [HotelAdminController::class, 'profile'])->name('profile');
        Route::get('/settings', [HotelAdminController::class, 'settings'])->name('settings');
        Route::patch('/settings', [HotelAdminController::class, 'updateSettings'])->name('settings.update');
    });

    Route::get('/super-admin', [AuthController::class, 'superAdminDashboard'])->name('super-admin.dashboard');
    Route::get('/super-admin/users', [AuthController::class, 'superAdminDashboard'])->name('super-admin.users');
    Route::get('/super-admin/resorts', [AuthController::class, 'superAdminDashboard'])->name('super-admin.resorts');
    Route::get('/super-admin/bookings', [AuthController::class, 'superAdminDashboard'])->name('super-admin.bookings');
    Route::get('/super-admin/inquiries', [AuthController::class, 'superAdminDashboard'])->name('super-admin.inquiries');
    Route::get('/super-admin/feedback', [FeedbackController::class, 'index'])->name('super-admin.feedback');
    Route::get('/super-admin/accounts', [AdminAccountController::class, 'index'])->name('super-admin.accounts.index');
    Route::get('/super-admin/accounts/create', [AdminAccountController::class, 'create'])->name('super-admin.accounts.create');
    Route::post('/super-admin/accounts', [AdminAccountController::class, 'store'])->name('super-admin.accounts.store');
    Route::get('/super-admin/accounts/{user}/edit', [AdminAccountController::class, 'edit'])->name('super-admin.accounts.edit');
    Route::put('/super-admin/accounts/{user}', [AdminAccountController::class, 'update'])->name('super-admin.accounts.update');
    Route::patch('/super-admin/accounts/{user}/status', [AdminAccountController::class, 'updateStatus'])->name('super-admin.accounts.status');
    Route::get('/super-admin/announcements', [AnnouncementController::class, 'index'])->name('super-admin.announcements.index');
    Route::get('/super-admin/announcements/create', [AnnouncementController::class, 'create'])->name('super-admin.announcements.create');
    Route::post('/super-admin/announcements', [AnnouncementController::class, 'store'])->name('super-admin.announcements.store');
    Route::get('/super-admin/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('super-admin.announcements.edit');
    Route::put('/super-admin/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('super-admin.announcements.update');
    Route::patch('/super-admin/announcements/{announcement}/status', [AnnouncementController::class, 'updateStatus'])->name('super-admin.announcements.status');
    Route::delete('/super-admin/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('super-admin.announcements.destroy');

    Route::get('/municipality-admin', [MunicipalityAdminController::class, 'dashboard'])->name('municipality-admin.dashboard');
    Route::get('/municipality-admin/tourist-spots', [MunicipalityAdminController::class, 'touristSpots'])->name('municipality-admin.tourist-spots');
    Route::get('/municipality-admin/resorts', [MunicipalityAdminController::class, 'resorts'])->name('municipality-admin.resorts');
    Route::get('/municipality-admin/cottages', [MunicipalityAdminController::class, 'cottages'])->name('municipality-admin.cottages');
    Route::get('/municipality-admin/bookings', [MunicipalityAdminController::class, 'bookings'])->name('municipality-admin.bookings');
    Route::get('/municipality-admin/inquiries', [MunicipalityAdminController::class, 'inquiries'])->name('municipality-admin.inquiries');
    Route::get('/municipality-admin/users', [MunicipalityAdminController::class, 'users'])->name('municipality-admin.users');
    Route::get('/municipality-admin/feedback', [FeedbackController::class, 'index'])->name('municipality-admin.feedback');
    Route::get('/municipality-admin/reports', [MunicipalityAdminController::class, 'reports'])->name('municipality-admin.reports');
    Route::get('/municipality-admin/announcements', [AnnouncementController::class, 'index'])->name('municipality-admin.announcements.index');
    Route::get('/municipality-admin/announcements/create', [AnnouncementController::class, 'create'])->name('municipality-admin.announcements.create');
    Route::post('/municipality-admin/announcements', [AnnouncementController::class, 'store'])->name('municipality-admin.announcements.store');
    Route::get('/municipality-admin/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('municipality-admin.announcements.edit');
    Route::put('/municipality-admin/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('municipality-admin.announcements.update');
    Route::patch('/municipality-admin/announcements/{announcement}/status', [AnnouncementController::class, 'updateStatus'])->name('municipality-admin.announcements.status');
    Route::delete('/municipality-admin/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('municipality-admin.announcements.destroy');
});
