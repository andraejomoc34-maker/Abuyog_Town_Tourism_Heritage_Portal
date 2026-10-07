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

class ResortAnnouncementController extends Controller
{
    private const CATEGORIES = ['Resort Update', 'Event', 'Offer', 'Travel Advisory'];

    public function index(Request $request): Response
    {
        $user = $this->resortAdmin($request);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => Announcement::query()
                ->where('resort_id', $user->resort_id)
                ->latest('updated_at')
                ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'status', 'published_at', 'updated_at'])
                ->map(fn (Announcement $announcement): array => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'excerpt' => $announcement->excerpt,
                    'featuredImageUrl' => $this->imageUrl($announcement),
                    'status' => $announcement->status,
                    'publishedAt' => $announcement->published_at?->toIso8601String(),
                    'updatedAt' => $announcement->updated_at?->toIso8601String(),
                ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->resortAdmin($request);

        return Inertia::render('Admin/Announcements/Form', [
            'announcement' => null,
            'categories' => self::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->resortAdmin($request);
        $validated = $request->validate($this->rules());
        $image = $validated['featured_image'] ?? null;
        unset($validated['featured_image']);

        $slugBase = Str::slug($validated['title']) ?: 'resort-announcement';
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
            'resort_id' => $user->resort_id,
            'published_at' => $validated['status'] === 'Published'
                ? ($validated['published_at'] ?? now())
                : null,
        ]);

        return redirect()->route('resort-admin.announcements')->with('success', 'Resort announcement created.');
    }

    public function edit(Request $request, Announcement $announcement): Response
    {
        $this->authorizeOwnedAnnouncement($request, $announcement);

        return Inertia::render('Admin/Announcements/Form', [
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
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->authorizeOwnedAnnouncement($request, $announcement);
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

        return redirect()->route('resort-admin.announcements')->with('success', 'Resort announcement updated.');
    }

    public function updateStatus(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->authorizeOwnedAnnouncement($request, $announcement);
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

        return redirect()->route('resort-admin.announcements')->with('success', 'Resort announcement status updated.');
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

    private function authorizeOwnedAnnouncement(Request $request, Announcement $announcement): User
    {
        $user = $this->resortAdmin($request);
        abort_unless((int) $announcement->resort_id === (int) $user->resort_id, 403);

        return $user;
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

    private function imageUrl(Announcement $announcement): ?string
    {
        return $announcement->featured_image
            ? Storage::disk('public')->url($announcement->featured_image)
            : null;
    }
}
