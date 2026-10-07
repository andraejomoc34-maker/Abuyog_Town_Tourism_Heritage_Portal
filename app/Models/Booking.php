<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'reference_number',
        'cottage_id',
        'cottage_quantity',
        'hotel_room_id',
        'user_id',
        'resort_id',
        'booking_date',
        'guests',
        'message',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $booking): void {
            $booking->reference_number ??= self::generateReferenceNumber();
        });
    }

    public static function generateReferenceNumber(string $propertyType = 'resort'): string
    {
        $date = now()->format('Ymd');
        $prefix = $propertyType === 'hotel'
            ? 'ABY-HOTEL-'.$date.'-'
            : 'ABY-'.$date.'-';
        $lastBooking = static::query()
            ->where('reference_number', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->first();

        $sequence = 1;

        $pattern = '/'.preg_quote($prefix, '/').'(\d+)$/';

        if ($lastBooking && preg_match($pattern, (string) $lastBooking->reference_number, $matches)) {
            $sequence = (int) $matches[1] + 1;
        }

        return $prefix.sprintf('%04d', $sequence);
    }

    protected $casts = [
        'booking_date' => 'date',
    ];

    protected $attributes = [
        'status' => 'Pending',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resort(): BelongsTo
    {
        return $this->belongsTo(Resort::class);
    }

    public function cottage(): BelongsTo
    {
        return $this->belongsTo(Cottage::class);
    }

    public function hotelRoom(): BelongsTo
    {
        return $this->belongsTo(HotelRoom::class);
    }

    public function feedback(): HasOne
    {
        return $this->hasOne(Feedback::class);
    }
}
