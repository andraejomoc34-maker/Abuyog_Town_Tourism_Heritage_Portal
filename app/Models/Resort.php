<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resort extends Model
{
    protected $fillable = [
        'name',
        'description',
        'location',
        'image',
        'image_url',
        'contact_information',
        'amenities',
        'price_information',
        'status',
        'property_type',
        'property_code',
    ];

    protected $casts = [
        'amenities' => 'array',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->attributes['image_url'] ?? $this->attributes['image'] ?? null;
    }

    public function setImageUrlAttribute(?string $value): void
    {
        $this->attributes['image_url'] = $value;
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function cottages(): HasMany
    {
        return $this->hasMany(Cottage::class);
    }

    public function hotelRooms(): HasMany
    {
        return $this->hasMany(HotelRoom::class);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function isBookable(): bool
    {
        return $this->property_type === 'hotel'
            && $this->property_code === 'abuyog-hotel';
    }

    public function hasResortAdminAccess(): bool
    {
        return $this->property_type !== 'hotel'
            && ! in_array($this->property_code, [
                'castanas-spring-resort',
                'valida-makablack-resort',
                'village-condotel',
                'habitat-budget-inn',
                'florina-country-lodge',
                'ellen-fuentes-travellers-inn',
            ], true)
            && ! in_array($this->name, [
                'Castañas Spring Resort',
                'VALIDA MAKABLACK RESORT',
            ], true);
    }
}
