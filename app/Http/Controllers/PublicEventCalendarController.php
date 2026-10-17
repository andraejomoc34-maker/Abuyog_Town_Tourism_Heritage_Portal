<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventCalendarController extends Controller
{
    public function __invoke(): Response
    {
        $now = Carbon::now('Asia/Manila');

        $events = Announcement::query()
            ->whereNull('resort_id')
            ->whereIn('category', ['Event', 'Festival'])
            ->where('status', 'Published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', $now->copy()->setTimezone(config('app.timezone')))
            ->whereNotNull('event_start_date')
            ->where(fn (Builder $query) => $query
                ->whereNull('event_end_date')
                ->orWhereColumn('event_end_date', '>=', 'event_start_date'))
            ->with('images')
            ->orderBy('event_start_date')
            ->orderBy('event_start_time')
            ->get([
                'id',
                'title',
                'slug',
                'excerpt',
                'content',
                'category',
                'featured_image',
                'event_start_date',
                'event_end_date',
                'event_start_time',
                'event_venue',
                'event_organizer',
                'event_contact_information',
                'event_source_url',
                'event_date_status',
            ])
            ->map(fn (Announcement $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'excerpt' => $event->excerpt,
                'description' => $event->content,
                'category' => $event->category,
                'imageUrl' => $event->featured_image
                    ? Storage::disk('public')->url($event->featured_image)
                    : $event->images->first()?->url,
                'images' => $event->images->map(fn ($image): array => ['url' => $image->url])->all(),
                'startDate' => $event->event_start_date?->toDateString(),
                'endDate' => ($event->event_end_date ?? $event->event_start_date)?->toDateString(),
                'startTime' => $event->event_start_time
                    ? substr((string) $event->event_start_time, 0, 5)
                    : null,
                'venue' => $event->event_venue,
                'organizer' => $event->event_organizer,
                'contactInformation' => $event->event_contact_information,
                'sourceUrl' => $event->event_source_url,
                'dateStatus' => $event->event_date_status,
            ])
            ->values();

        return Inertia::render('events/index', [
            'events' => $events,
            'today' => $now->toDateString(),
        ]);
    }
}
