<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountSecurityEvent extends Model
{
    protected $fillable = [
        'actor_id',
        'target_user_id',
        'scam_report_id',
        'action',
        'reason',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function scamReport(): BelongsTo
    {
        return $this->belongsTo(ScamReport::class);
    }
}
