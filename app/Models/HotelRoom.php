<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelRoom extends Model
{
    protected $appends = ['image_url'];

    protected $fillable = [
        'resort_id',
        'name',
        'room_type',
        'description',
        'capacity',
        'price',
        'available_quantity',
        'status',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'price' => 'decimal:2',
            'available_quantity' => 'integer',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        $image = $this->attributes['image'] ?? null;

        if ($image === null || $image === '') {
            return null;
        }

        if (str_starts_with($image, '/') || preg_match('/^https?:\/\//i', $image) === 1) {
            return $image;
        }

        if (str_starts_with($image, 'storage/')) {
            return asset($image);
        }

        return asset('storage/'.$image);
    }

    public function resort(): BelongsTo
    {
        return $this->belongsTo(Resort::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
