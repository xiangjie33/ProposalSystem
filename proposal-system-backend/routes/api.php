<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DirectoryController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\ProposalController;

// 公开路由
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 需要认证的路由
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    
    // 目录管理
    Route::get('/directories/tree', [DirectoryController::class, 'tree']);
    Route::apiResource('directories', DirectoryController::class);
    
    // 文件管理
    Route::get('/files/{file}/download', [FileController::class, 'download']);
    Route::apiResource('files', FileController::class);
    
    // 用户管理
    Route::post('/users/{user}/reset-password', [App\Http\Controllers\Api\UserController::class, 'resetPassword']);
    Route::post('/users/{user}/approve', [App\Http\Controllers\Api\UserController::class, 'approve']);
    Route::post('/users/{user}/reject', [App\Http\Controllers\Api\UserController::class, 'reject']);
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
    
    // 提案管理
    Route::post('/proposals/{proposal}/permissions', [ProposalController::class, 'addPermission']);
    Route::apiResource('proposals', ProposalController::class);
});
