<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'category',
        'status',
        'published_at',
        'created_by',
        'resort_id',
        'event_start_date',
        'event_end_date',
        'event_start_time',
        'event_venue',
        'event_organizer',
        'event_contact_information',
        'event_source_url',
        'event_date_status',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'event_start_date' => 'date:Y-m-d',
            'event_end_date' => 'date:Y-m-d',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function resort(): BelongsTo
    {
        return $this->belongsTo(Resort::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(ContentImage::class, 'imageable')->orderBy('sort_order')->orderBy('id');
    }
}
