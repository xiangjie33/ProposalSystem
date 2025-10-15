<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Directory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'parent_id', 'created_by', 'path', 'is_public'];
    
    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Directory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Directory::class, 'parent_id');
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_directory_permissions');
    }
}
