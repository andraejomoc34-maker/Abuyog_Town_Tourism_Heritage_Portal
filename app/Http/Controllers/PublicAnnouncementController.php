<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicAnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('welcome', [
            'announcements' => Announcement::query()
                ->whereNull('resort_id')
                ->where('status', 'Published')
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->latest('published_at')
                ->limit(6)
                ->get(['id', 'title', 'slug', 'excerpt', 'category', 'featured_image', 'published_at'])
                ->map(fn (Announcement $announcement): array => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'slug' => $announcement->slug,
                    'excerpt' => $announcement->excerpt,
                    'category' => $announcement->category,
                    'featuredImageUrl' => $announcement->featured_image
                        ? Storage::disk('public')->url($announcement->featured_image)
                        : null,
                    'publishedAt' => $announcement->published_at?->toIso8601String(),
                ]),
        ]);
    }

    public function show(string $announcement): Response
    {
        $entry = Announcement::query()
            ->where('slug', $announcement)
            ->whereNull('resort_id')
            ->where('status', 'Published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->firstOrFail();

        return Inertia::render('announcements/Show', [
            'announcement' => [
                'title' => $entry->title,
                'excerpt' => $entry->excerpt,
                'content' => $entry->content,
                'category' => $entry->category,
                'featuredImageUrl' => $entry->featured_image
                    ? Storage::disk('public')->url($entry->featured_image)
                    : null,
                'publishedAt' => $entry->published_at?->toIso8601String(),
                'author' => 'Abuyog Municipal Tourism Office',
            ],
        ]);
    }
}
