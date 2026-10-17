<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\ContentChange;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class ContentChangeLogger
{
    /**
     * @return array<string, mixed>
     */
    public function snapshot(Model $content): array
    {
        $fields = match ($content::class) {
            Announcement::class => [
                'title', 'category', 'status', 'published_at', 'event_start_date',
                'event_end_date', 'event_venue', 'excerpt', 'content',
            ],
            TouristSpot::class => ['name', 'category', 'status', 'location', 'description'],
            Resort::class => ['name', 'location', 'description', 'status', 'amenities', 'price_information'],
            default => [],
        };

        $snapshot = Arr::only($content->getAttributes(), $fields);

        foreach ($snapshot as $key => $value) {
            if (is_string($value)) {
                $snapshot[$key] = mb_substr($value, 0, 500);
            }
        }

        if (method_exists($content, 'images')) {
            $snapshot['gallery_image_count'] = $content->images()->count();
        }

        if (in_array($content::class, [Announcement::class, TouristSpot::class, Resort::class], true)) {
            $snapshot['has_cover_image'] = filled($content->getAttribute('featured_image') ?? $content->getAttribute('image_url') ?? $content->getAttribute('image'));
        }

        return $snapshot;
    }

    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function record(
        User $actor,
        Model $content,
        string $action,
        ?array $before = null,
        ?array $after = null,
    ): void {
        $name = $content->getAttribute('title') ?? $content->getAttribute('name') ?? 'content';
        $changedFields = array_values(array_unique(array_merge(
            array_keys($before ?? []),
            array_keys($after ?? []),
        )));

        if ($before !== null && $after !== null) {
            $changedFields = array_values(array_filter(
                $changedFields,
                static fn (string $field): bool => ($before[$field] ?? null) !== ($after[$field] ?? null),
            ));
        }

        $description = ucfirst($action).' '.class_basename($content).' "'.mb_substr((string) $name, 0, 180).'"';

        if ($changedFields !== []) {
            $description .= ' ('.implode(', ', $changedFields).')';
        }

        ContentChange::query()->create([
            'user_id' => $actor->id,
            'content_type' => $content::class,
            'content_id' => $content->getKey(),
            'action' => $action,
            'description' => mb_substr($description, 0, 500),
            'before_values' => $before,
            'after_values' => $after,
        ]);
    }
}
