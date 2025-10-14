<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalPermission extends Model
{
    use HasFactory;

    protected $fillable = ['proposal_id', 'user_id', 'directory_id', 'expires_at', 'can_upload'];

    protected $casts = [
        'expires_at' => 'datetime',
        'can_upload' => 'boolean',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function directory()
    {
        return $this->belongsTo(Directory::class);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
