<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * 获取用户的所有工作组
     */
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'user_groups');
    }
    
    /**
     * 获取用户可以访问的目录
     */
    public function directories()
    {
        return $this->belongsToMany(Directory::class, 'user_directory_permissions');
    }

    /**
     * 检查用户是否是超级管理员
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * 检查用户是否是管理员（包括超级管理员）
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * 检查当前用户是否可以管理目标用户
     */
    public function canManageUser(User $targetUser): bool
    {
        // 超级管理员可以管理所有用户
        if ($this->isSuperAdmin()) {
            return true;
        }

        // 管理员只能管理非管理员用户
        if ($this->isAdmin()) {
            return !$targetUser->isAdmin();
        }

        return false;
    }
    
    /**
     * 检查用户是否可以访问指定目录
     */
    public function canAccessDirectory($directoryId): bool
    {
        // 管理员可以访问所有目录
        if ($this->isAdmin()) {
            return true;
        }
        
        // 检查目录是否公开
        $directory = Directory::find($directoryId);
        if ($directory && $directory->is_public) {
            return true;
        }
        
        // 检查用户是否有该目录的访问权限
        return $this->directories()->where('directory_id', $directoryId)->exists();
    }
}
