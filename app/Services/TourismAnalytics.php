<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Feedback;
use App\Models\Resort;
use App\Models\TouristSpot;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

class TourismAnalytics
{
    /**
     * @return array<string, mixed>
     */
    public function report(string $from, string $to, ?int $resortId, bool $includeResortAnnouncements): array
    {
        $applicationTimezone = (string) config('app.timezone');
        $start = CarbonImmutable::parse($from, 'Asia/Manila')
            ->startOfDay()
            ->setTimezone($applicationTimezone);
        $end = CarbonImmutable::parse($to, 'Asia/Manila')
            ->endOfDay()
            ->setTimezone($applicationTimezone);

        $feedbackQuery = Feedback::query()
            ->whereBetween('created_at', [$start, $end])
            ->when($resortId, fn ($query) => $query->where('resort_id', $resortId));
        $feedbackTotal = (clone $feedbackQuery)->count();
        $averageRating = (clone $feedbackQuery)
            ->whereBetween('rating', [1, 5])
            ->avg('rating');
        $ratings = (clone $feedbackQuery)
            ->select('rating', DB::raw('COUNT(*) as total'))
            ->whereBetween('rating', [1, 5])
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $dateOffsetMinutes = $this->manilaOffsetFromApplicationTimezone($applicationTimezone);
        $dateExpression = DB::connection()->getDriverName() === 'sqlite'
            ? "DATE(created_at, '{$dateOffsetMinutes} minutes')"
            : "DATE(DATE_ADD(created_at, INTERVAL {$dateOffsetMinutes} MINUTE))";
        $trendCounts = (clone $feedbackQuery)
            ->selectRaw("{$dateExpression} as local_date, COUNT(*) as total")
            ->groupBy('local_date')
            ->orderBy('local_date')
            ->pluck('total', 'local_date');
        $trends = [];

        for (
            $date = CarbonImmutable::parse($from, 'Asia/Manila');
            $date->lte(CarbonImmutable::parse($to, 'Asia/Manila'));
            $date = $date->addDay()
        ) {
            $key = $date->toDateString();
            $trends[] = ['date' => $key, 'count' => (int) ($trendCounts[$key] ?? 0)];
        }

        $views = $this->topDestinations($from, $to, $resortId);
        $contentQuery = Announcement::query()
            ->when(! $includeResortAnnouncements, fn ($query) => $query->whereNull('resort_id'));
        $contentCounts = (clone $contentQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');
        $announcementByType = (clone $contentQuery)
            ->select('category', 'status', DB::raw('COUNT(*) as total'))
            ->groupBy('category', 'status')
            ->orderBy('category')
            ->get()
            ->groupBy('category')
            ->map(fn ($rows, string $category): array => [
                'type' => $category,
                'published' => (int) ($rows->firstWhere('status', 'Published')->total ?? 0),
                'unpublished' => (int) ($rows->firstWhere('status', 'Draft')->total ?? 0),
                'archived' => (int) ($rows->firstWhere('status', 'Archived')->total ?? 0),
            ])
            ->values();
        $spotByType = TouristSpot::query()
            ->select('category', 'status', DB::raw('COUNT(*) as total'))
            ->groupBy('category', 'status')
            ->orderBy('category')
            ->get()
            ->groupBy(fn ($row): string => $row->category ?: 'Uncategorized destinations')
            ->map(fn ($rows, string $category): array => [
                'type' => 'Destination: '.$category,
                'published' => (int) ($rows->firstWhere('status', 'active')->total ?? 0),
                'unpublished' => (int) $rows->reject(fn ($row): bool => in_array($row->status, ['active', 'archived'], true))->sum('total'),
                'archived' => (int) ($rows->firstWhere('status', 'archived')->total ?? 0),
            ])
            ->values();
        $spotCounts = TouristSpot::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');
        $contentPublished = (int) ($contentCounts['Published'] ?? 0) + (int) ($spotCounts['active'] ?? 0);
        $contentUnpublished = (int) ($contentCounts['Draft'] ?? 0)
            + (int) $spotCounts->reject(fn ($total, $status): bool => in_array($status, ['active', 'archived'], true))->sum();
        $contentArchived = (int) ($contentCounts['Archived'] ?? 0) + (int) ($spotCounts['archived'] ?? 0);
        $contentByType = $announcementByType->concat($spotByType)->values()->all();

        return [
            'feedback' => [
                'total' => $feedbackTotal,
                'averageRating' => $averageRating === null ? null : round((float) $averageRating, 2),
                'ratingDistribution' => array_map(
                    fn (int $rating): array => [
                        'rating' => $rating,
                        'count' => (int) ($ratings[$rating] ?? 0),
                    ],
                    range(1, 5),
                ),
                'trends' => $trends,
            ],
            'destinations' => $views,
            'content' => [
                'published' => $contentPublished,
                'unpublished' => $contentUnpublished,
                'archived' => $contentArchived,
                'byType' => $contentByType,
            ],
            'operations' => [
                'bookings' => DB::table('bookings')
                    ->whereBetween('created_at', [$start, $end])
                    ->when($resortId, fn (QueryBuilder $builder) => $builder->where('resort_id', $resortId))
                    ->count(),
                'inquiries' => DB::table('inquiries')
                    ->whereBetween('created_at', [$start, $end])
                    ->when($resortId, fn (QueryBuilder $builder) => $builder->where('resort_id', $resortId))
                    ->count(),
                'resorts' => Resort::query()->count(),
            ],
            'filters' => [
                'from' => $from,
                'to' => $to,
                'resortId' => $resortId,
            ],
        ];
    }

    /**
     * @return array<int, array{id: int, type: string, name: string, views: int}>
     */
    private function topDestinations(string $from, string $to, ?int $resortId): array
    {
        $query = DB::table('destination_views')
            ->whereBetween('viewed_on', [$from, $to])
            ->when($resortId, fn (QueryBuilder $builder) => $builder
                ->where('destination_type', 'resort')
                ->where('destination_id', $resortId));
        $spots = (clone $query)
            ->where('destination_type', 'spot')
            ->join('tourist_spots', 'destination_views.destination_id', '=', 'tourist_spots.id')
            ->where('tourist_spots.status', 'active')
            ->select('tourist_spots.id', 'tourist_spots.name', DB::raw('COUNT(destination_views.id) as views'))
            ->groupBy('tourist_spots.id', 'tourist_spots.name')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row): array => [
                'id' => (int) $row->id,
                'type' => 'spot',
                'name' => $row->name,
                'views' => (int) $row->views,
            ]);
        $resorts = (clone $query)
            ->where('destination_type', 'resort')
            ->join('resorts', 'destination_views.destination_id', '=', 'resorts.id')
            ->where('resorts.status', 'active')
            ->select('resorts.id', 'resorts.name', DB::raw('COUNT(destination_views.id) as views'))
            ->groupBy('resorts.id', 'resorts.name')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row): array => [
                'id' => (int) $row->id,
                'type' => 'resort',
                'name' => $row->name,
                'views' => (int) $row->views,
            ]);

        return $spots->concat($resorts)
            ->sortByDesc('views')
            ->take(10)
            ->values()
            ->all();
    }

    private function manilaOffsetFromApplicationTimezone(string $applicationTimezone): int
    {
        return CarbonImmutable::now('Asia/Manila')->utcOffset()
            - CarbonImmutable::now($applicationTimezone)->utcOffset();
    }
}
