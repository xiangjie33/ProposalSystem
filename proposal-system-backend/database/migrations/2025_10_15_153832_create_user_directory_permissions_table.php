<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_directory_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('directory_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // 确保同一用户不会重复授权同一目录
            $table->unique(['user_id', 'directory_id']);
        });
        
        // 添加目录的公开访问标记
        Schema::table('directories', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('path')->comment('是否公开访问');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_directory_permissions');
        
        Schema::table('directories', function (Blueprint $table) {
            $table->dropColumn('is_public');
        });
    }
};
