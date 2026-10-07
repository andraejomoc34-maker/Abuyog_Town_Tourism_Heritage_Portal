<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    private const CATEGORIES = [
        'Official Announcement',
        'Tourism Update',
        'Event',
        'Festival',
        'Heritage',
        'Community',
        'Travel Advisory',
        'Public Notice',
    ];

    public function index(Request $request): Response
    {
        $user = $this->authorizeManager($request);
        $announcements = Announcement::query();

        if ($user->role === 'municipality_admin') {
            $announcements->whereNull('resort_id');
        }

        return Inertia::render('Municipality/Announcements/Index', [
            'announcements' => $announcements
                ->latest('updated_at')
                ->get(['id', 'title', 'slug', 'category', 'status', 'published_at', 'updated_at'])
                ->map(fn (Announcement $announcement): array => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'slug' => $announcement->slug,
                    'category' => $announcement->category,
                    'status' => $announcement->status,
                    'publishedAt' => $announcement->published_at?->toIso8601String(),
                    'updatedAt' => $announcement->updated_at?->toIso8601String(),
                ]),
            'canManageAccounts' => $user->role === 'super_admin',
            'baseUrl' => $this->baseUrl($user),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeManager($request);

        return Inertia::render('Municipality/Announcements/Form', [
            'announcement' => null,
            'categories' => self::CATEGORIES,
            'baseUrl' => $this->baseUrl($this->authorizeManager($request)),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $validated = $request->validate($this->rules());
        $image = $validated['featured_image'] ?? null;
        unset($validated['featured_image']);

        $slugBase = Str::slug($validated['title']) ?: 'announcement';
        $slug = $slugBase;
        $suffix = 2;

        while (Announcement::query()->where('slug', $slug)->exists()) {
            $slug = $slugBase.'-'.$suffix;
            $suffix++;
        }

        Announcement::create([
            ...$validated,
            'slug' => $slug,
            'featured_image' => $image?->store('announcements', 'public'),
            'created_by' => $user->id,
            'published_at' => $validated['status'] === 'Published'
                ? ($validated['published_at'] ?? now())
                : null,
        ]);

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement created.');
    }

    public function edit(Request $request, Announcement $announcement): Response
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);

        return Inertia::render('Municipality/Announcements/Form', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'excerpt' => $announcement->excerpt,
                'content' => $announcement->content,
                'featuredImageUrl' => $this->imageUrl($announcement),
                'category' => $announcement->category,
                'status' => $announcement->status,
                'publishedAt' => $announcement->published_at?->format('Y-m-d\TH:i'),
            ],
            'categories' => self::CATEGORIES,
            'baseUrl' => $this->baseUrl($user),
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);
        $validated = $request->validate($this->rules());
        $image = $validated['featured_image'] ?? null;
        unset($validated['featured_image']);

        if ($image) {
            if ($announcement->featured_image) {
                Storage::disk('public')->delete($announcement->featured_image);
            }

            $validated['featured_image'] = $image->store('announcements', 'public');
        }

        $validated['published_at'] = match ($validated['status']) {
            'Published' => $validated['published_at'] ?? $announcement->published_at ?? now(),
            'Draft' => null,
            default => $announcement->published_at,
        };

        $announcement->update($validated);

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement updated.');
    }

    public function updateStatus(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
        ]);

        $announcement->update([
            'status' => $validated['status'],
            'published_at' => match ($validated['status']) {
                'Published' => $announcement->published_at ?? now(),
                'Draft' => null,
                default => $announcement->published_at,
            },
        ]);

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement status updated.');
    }

    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);

        if ($announcement->featured_image) {
            Storage::disk('public')->delete($announcement->featured_image);
        }

        $announcement->delete();

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement deleted.');
    }

    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:50000'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => ['required', Rule::in(self::CATEGORIES)],
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
            'published_at' => ['nullable', 'date'],
        ];
    }

    private function authorizeManager(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && in_array($user->role, ['municipality_admin', 'super_admin'], true),
            403,
        );

        return $user;
    }

    private function authorizeAnnouncement(User $user, Announcement $announcement): void
    {
        abort_unless($user->role === 'super_admin' || $announcement->resort_id === null, 403);
    }

    private function indexRoute(User $user): string
    {
        return $user->role === 'super_admin'
            ? 'super-admin.announcements.index'
            : 'municipality-admin.announcements.index';
    }

    private function baseUrl(User $user): string
    {
        return $user->role === 'super_admin'
            ? '/super-admin/announcements'
            : '/municipality-admin/announcements';
    }

    private function imageUrl(Announcement $announcement): ?string
    {
        return $announcement->featured_image
            ? Storage::disk('public')->url($announcement->featured_image)
            : null;
    }
}
