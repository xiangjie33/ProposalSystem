<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'original_name', 'directory_id', 'uploaded_by', 'file_path', 'mime_type', 'size'];

    public function directory()
    {
        return $this->belongsTo(Directory::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
