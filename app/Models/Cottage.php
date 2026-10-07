<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cottage extends Model
{
    protected $fillable = [
        'resort_id',
        'quantity',
        'name',
        'description',
        'capacity',
        'price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'quantity' => 'integer',
            'price' => 'decimal:2',
        ];
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
