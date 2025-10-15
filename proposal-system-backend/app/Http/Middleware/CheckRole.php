<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => '未登录'], 401);
        }

        if (!auth()->user()->hasAnyRole($roles)) {
            return response()->json([
                'message' => '角色权限不足',
                'required_roles' => $roles
            ], 403);
        }

        return $next($request);
    }
}
