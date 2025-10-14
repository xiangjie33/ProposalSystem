<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:admin,user',
        ]);

        $user->update([
            'name' => $request->name,
        ]);

        // 更新角色
        $user->syncRoles([$request->role]);

        return response()->json($user->load('roles'));
    }

    public function destroy(User $user)
    {
        // 不能删除自己
        if ($user->id === auth()->id()) {
            return response()->json(['message' => '不能删除自己的账户'], 403);
        }

        $user->delete();
        return response()->json(['message' => '用户删除成功']);
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('password123')
        ]);

        return response()->json(['message' => '密码重置成功']);
    }

    public function approve(User $user)
    {
        $user->update(['status' => 'active']);
        return response()->json(['message' => '用户已审核通过']);
    }

    public function reject(User $user)
    {
        $user->update(['status' => 'inactive']);
        return response()->json(['message' => '用户已被拒绝']);
    }
}
