<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * 获取工作组的所有用户
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_groups');
    }
}
