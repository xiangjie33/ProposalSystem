<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => '未登录'], 401);
        }

        if (!auth()->user()->can($permission)) {
            return response()->json([
                'message' => '权限不足',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }
}
