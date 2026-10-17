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
use Illuminate\Validation\ValidationException;
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

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['Draft', 'Published', 'Archived'])],
            'category' => ['nullable', Rule::in(self::CATEGORIES)],
        ]);

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $announcements->where(function (Builder $query) use ($search): void {
                $query->where('title', 'like', '%'.$search.'%')
                    ->orWhere('excerpt', 'like', '%'.$search.'%')
                    ->orWhere('content', 'like', '%'.$search.'%');
            });
        }

        if (filled($filters['status'] ?? null)) {
            $announcements->where('status', $filters['status']);
        }

        if (filled($filters['category'] ?? null)) {
            $announcements->where('category', $filters['category']);
        }

        return Inertia::render('Municipality/Announcements/Index', [
            'announcements' => $announcements
                ->latest('updated_at')
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Announcement $announcement): array => [
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
            'categories' => self::CATEGORIES,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
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

    public function store(Request $request, ContentImageManager $imageManager, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $validated = $request->validate($this->rules($request));
        $image = $validated['featured_image'] ?? null;
        $galleryImages = $validated['images'] ?? [];
        unset($validated['featured_image']);
        unset($validated['images'], $validated['remove_image_ids'], $validated['remove_featured_image']);

        $slugBase = Str::slug($validated['title']) ?: 'announcement';
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
                'published_at' => $validated['status'] === 'Published'
                    ? ($validated['published_at'] ?? now())
                    : null,
            ]);

            $manager->sync($announcement, $galleryImages, []);
            $history->record($user, $announcement, 'created', null, $history->snapshot($announcement));
        });

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
                'images' => $announcement->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'url' => $image->url,
                ])->all(),
                'category' => $announcement->category,
                'status' => $announcement->status,
                'publishedAt' => $announcement->published_at?->format('Y-m-d\TH:i'),
                'eventStartDate' => $announcement->event_start_date?->format('Y-m-d'),
                'eventEndDate' => $announcement->event_end_date?->format('Y-m-d'),
                'eventStartTime' => $announcement->event_start_time
                    ? substr((string) $announcement->event_start_time, 0, 5)
                    : null,
                'eventVenue' => $announcement->event_venue,
                'eventOrganizer' => $announcement->event_organizer,
                'eventContactInformation' => $announcement->event_contact_information,
                'eventSourceUrl' => $announcement->event_source_url,
                'eventDateStatus' => $announcement->event_date_status,
            ],
            'categories' => self::CATEGORIES,
            'baseUrl' => $this->baseUrl($user),
        ]);
    }

    public function update(Request $request, Announcement $announcement, ContentImageManager $imageManager, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);
        $validated = $request->validate($this->rules($request, $announcement));
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

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement updated.');
    }

    public function updateStatus(Request $request, Announcement $announcement, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
        ]);

        if (
            $validated['status'] === 'Published'
            && in_array($announcement->category, ['Event', 'Festival'], true)
            && $announcement->event_start_date === null
        ) {
            throw ValidationException::withMessages([
                'event_start_date' => 'Add an event start date before publishing this Event or Festival announcement.',
            ]);
        }

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

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement status updated.');
    }

    public function restore(Request $request, Announcement $announcement, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);
        abort_unless($announcement->status === 'Archived', 404);

        DB::transaction(function () use ($announcement, $history, $user): void {
            $before = $history->snapshot($announcement);
            $announcement->update(['status' => 'Draft', 'published_at' => null]);
            $history->record($user, $announcement, 'restored', $before, $history->snapshot($announcement));
        });

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement restored as a draft.');
    }

    public function destroy(Request $request, Announcement $announcement, ContentImageManager $imageManager, ContentChangeLogger $history): RedirectResponse
    {
        $user = $this->authorizeManager($request);
        $this->authorizeAnnouncement($user, $announcement);

        $imageManager->transaction(function (ContentImageManager $manager) use ($announcement, $history, $user): void {
            $before = $history->snapshot($announcement);
            $history->record($user, $announcement, 'deleted', $before, null);
            $manager->deleteAll($announcement);
            $manager->deleteAfterCommit($announcement->featured_image);
            $announcement->delete();
        });

        return redirect()->route($this->indexRoute($user))->with('success', 'Announcement deleted.');
    }

    private function rules(Request $request, ?Announcement $announcement = null): array
    {
        $isPublishedEvent = $request->input('status') === 'Published'
            && in_array($request->input('category'), ['Event', 'Festival'], true);

        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:50000'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('tourism.image_upload.max_kilobytes', 5120)],
            ...ContentImageManager::validationRules(),
            'remove_featured_image' => ['sometimes', 'boolean'],
            'category' => ['required', Rule::in(self::CATEGORIES)],
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
            'published_at' => ['nullable', 'date'],
            'event_start_date' => [$isPublishedEvent ? 'required' : 'nullable', 'date'],
            'event_end_date' => ['nullable', 'date', 'after_or_equal:event_start_date'],
            'event_start_time' => ['nullable', 'date_format:H:i'],
            'event_venue' => ['nullable', 'string', 'max:255'],
            'event_organizer' => ['nullable', 'string', 'max:255'],
            'event_contact_information' => ['nullable', 'string', 'max:2000'],
            'event_source_url' => ['nullable', 'url', 'max:2048'],
            'event_date_status' => ['sometimes', Rule::in(['Confirmed', 'Tentative', 'Unverified'])],
        ];

        if (
            $isPublishedEvent
            && is_string($request->input('event_start_date'))
            && $request->input('event_start_date') !== ''
        ) {
            $rules['title'][] = Rule::unique('announcements', 'title')
                ->where(fn ($query) => $query
                    ->whereNull('resort_id')
                    ->where('category', $request->input('category'))
                    ->where('event_start_date', $request->input('event_start_date')))
                ->ignore($announcement?->id);
        }

        return $rules;
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
