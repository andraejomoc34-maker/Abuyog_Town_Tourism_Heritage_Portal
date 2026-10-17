<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use App\Services\ContentChangeLogger;
use App\Services\ContentImageManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['Draft', 'Published', 'Archived'])],
            'category' => ['nullable', Rule::in(self::CATEGORIES)],
        ]);
        $query = Announcement::query()->where('resort_id', $user->resort_id);

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('excerpt', 'like', '%'.$search.'%')
                    ->orWhere('content', 'like', '%'.$search.'%');
            });
        }

        if (filled($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }

        if (filled($filters['category'] ?? null)) {
            $query->where('category', $filters['category']);
        }

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $query
                ->latest('updated_at')
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Announcement $announcement): array => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'excerpt' => $announcement->excerpt,
                    'featuredImageUrl' => $this->imageUrl($announcement),
                    'status' => $announcement->status,
                    'publishedAt' => $announcement->published_at?->toIso8601String(),
                    'updatedAt' => $announcement->updated_at?->toIso8601String(),
                ]),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'categories' => self::CATEGORIES,
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

    public function store(Request $request, ContentImageManager $imageManager, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->resortAdmin($request);
        $validated = $request->validate($this->rules());
        $image = $validated['featured_image'] ?? null;
        $galleryImages = $validated['images'] ?? [];
        unset($validated['featured_image']);
        unset($validated['images'], $validated['remove_image_ids'], $validated['remove_featured_image']);

        $slugBase = Str::slug($validated['title']) ?: 'resort-announcement';
        $slug = $slugBase;
        $suffix = 2;

        while (Announcement::query()->where('slug', $slug)->exists()) {
            $slug = $slugBase.'-'.$suffix;
            $suffix++;
        }

        $imageManager->transaction(function (ContentImageManager $manager) use ($validated, $image, $galleryImages, $slug, $user, $history): void {
            $announcement = Announcement::create([
                ...$validated,
                'slug' => $slug,
                'featured_image' => $image ? $manager->store($image, 'announcements') : null,
                'created_by' => $user->id,
                'resort_id' => $user->resort_id,
                'published_at' => $validated['status'] === 'Published'
                    ? ($validated['published_at'] ?? now())
                    : null,
            ]);

            $manager->sync($announcement, $galleryImages, []);
            $history->record($user, $announcement, 'created', null, $history->snapshot($announcement));
        });

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
                'images' => $announcement->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'url' => $image->url,
                ])->all(),
                'category' => $announcement->category,
                'status' => $announcement->status,
                'publishedAt' => $announcement->published_at?->format('Y-m-d\TH:i'),
            ],
            'categories' => self::CATEGORIES,
        ]);
    }

    public function update(Request $request, Announcement $announcement, ContentImageManager $imageManager, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeOwnedAnnouncement($request, $announcement);
        $validated = $request->validate($this->rules());
        $image = $validated['featured_image'] ?? null;
        $galleryImages = $validated['images'] ?? [];
        $removeImageIds = $validated['remove_image_ids'] ?? [];
        $removeFeaturedImage = (bool) ($validated['remove_featured_image'] ?? false);
        unset($validated['featured_image']);
        unset($validated['images'], $validated['remove_image_ids'], $validated['remove_featured_image']);

        $imageManager->transaction(function (ContentImageManager $manager) use ($announcement, $validated, $image, $galleryImages, $removeImageIds, $removeFeaturedImage, $history, $user): void {
            $before = $history->snapshot($announcement);
            $oldFeaturedImage = $announcement->featured_image;

            if ($image) {
                $validated['featured_image'] = $manager->store($image, 'announcements');
                $manager->deleteAfterCommit($oldFeaturedImage);
            } elseif ($removeFeaturedImage) {
                $validated['featured_image'] = null;
                $manager->deleteAfterCommit($oldFeaturedImage);
            }

            $validated['published_at'] = match ($validated['status']) {
                'Published' => $validated['published_at'] ?? $announcement->published_at ?? now(),
                'Draft' => null,
                default => $announcement->published_at,
            };

            $announcement->update($validated);
            $manager->sync($announcement, $galleryImages, $removeImageIds);
            $history->record($user, $announcement, 'edited', $before, $history->snapshot($announcement));
        });

        return redirect()->route('resort-admin.announcements')->with('success', 'Resort announcement updated.');
    }

    public function updateStatus(Request $request, Announcement $announcement, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeOwnedAnnouncement($request, $announcement);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
        ]);

        DB::transaction(function () use ($announcement, $validated, $history, $user): void {
            $before = $history->snapshot($announcement);
            $announcement->update([
                'status' => $validated['status'],
                'published_at' => match ($validated['status']) {
                    'Published' => $announcement->published_at ?? now(),
                    'Draft' => null,
                    default => $announcement->published_at,
                },
            ]);
            $action = match ($validated['status']) {
                'Published' => 'published',
                'Draft' => 'unpublished',
                default => 'archived',
            };
            $history->record($user, $announcement, $action, $before, $history->snapshot($announcement));
        });

        return redirect()->route('resort-admin.announcements')->with('success', 'Resort announcement status updated.');
    }

    public function restore(Request $request, Announcement $announcement, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeOwnedAnnouncement($request, $announcement);
        abort_unless($announcement->status === 'Archived', 404);

        DB::transaction(function () use ($announcement, $history, $user): void {
            $before = $history->snapshot($announcement);
            $announcement->update(['status' => 'Draft', 'published_at' => null]);
            $history->record($user, $announcement, 'restored', $before, $history->snapshot($announcement));
        });

        return redirect()->route('resort-admin.announcements')->with('success', 'Announcement restored as a draft.');
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
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('tourism.image_upload.max_kilobytes', 5120)],
            ...ContentImageManager::validationRules(),
            'remove_featured_image' => ['sometimes', 'boolean'],
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
