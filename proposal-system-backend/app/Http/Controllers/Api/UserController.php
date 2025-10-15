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
        $currentUser = auth()->user();
        
        // 超级管理员可以看到所有用户
        if ($currentUser->isSuperAdmin()) {
            $users = User::with(['roles', 'groups', 'directories'])->latest()->get();
        } 
        // 普通管理员只能看到非管理员用户
        else if ($currentUser->isAdmin()) {
            $users = User::with(['roles', 'groups', 'directories'])
                ->whereDoesntHave('roles', function ($query) {
                    $query->whereIn('name', ['super_admin', 'admin']);
                })
                ->latest()
                ->get();
        }
        // 其他用户无权查看用户列表
        else {
            return response()->json(['message' => '无权查看用户列表'], 403);
        }
        
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin,senior_member,member',
            'groups' => 'nullable|array',
            'groups.*' => 'exists:groups,id',
        ]);

        // 检查权限：管理员不能创建管理员角色
        if (!auth()->user()->isSuperAdmin() && in_array($request->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => '无权创建管理员角色'], 403);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'active', // 管理员创建的用户直接激活
        ]);

        $user->assignRole($request->role);

        // 分配工作组
        if ($request->has('groups')) {
            $user->groups()->sync($request->groups);
        } else {
            // 默认分配到用户组
            $defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
            if ($defaultGroup) {
                $user->groups()->attach($defaultGroup->id);
            }
        }
        
        // 分配目录权限
        if ($request->has('directories')) {
            $user->directories()->sync($request->directories);
        }

        return response()->json($user->load(['roles', 'groups', 'directories']), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load(['roles', 'groups', 'directories']));
    }

    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        
        // 权限检查：不能编辑自己
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => '不能编辑自己的账户，请使用个人信息功能'], 403);
        }
        
        // 权限检查：管理员不能编辑管理员用户
        if (!$currentUser->isSuperAdmin() && $user->isAdmin()) {
            return response()->json(['message' => '无权编辑管理员用户'], 403);
        }
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'required|in:super_admin,admin,senior_member,member',
            'status' => 'sometimes|in:active,pending,inactive',
            'groups' => 'nullable|array',
            'groups.*' => 'exists:groups,id',
            'directories' => 'nullable|array',
            'directories.*' => 'exists:directories,id',
        ]);

        // 权限检查：管理员不能设置管理员角色
        if (!$currentUser->isSuperAdmin() && in_array($request->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => '无权设置管理员角色'], 403);
        }

        // 更新基本信息
        $updateData = [];
        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }
        if (!empty($updateData)) {
            $user->update($updateData);
        }

        // 更新角色
        $user->syncRoles([$request->role]);

        // 更新工作组
        if ($request->has('groups')) {
            $user->groups()->sync($request->groups);
        }
        
        // 更新目录访问权限
        if ($request->has('directories')) {
            $user->directories()->sync($request->directories);
        }

        return response()->json($user->load(['roles', 'groups', 'directories']));
    }

    public function destroy(User $user)
    {
        $currentUser = auth()->user();
        
        // 不能删除自己
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => '不能删除自己的账户'], 403);
        }
        
        // 管理员不能删除管理员用户
        if (!$currentUser->isSuperAdmin() && $user->isAdmin()) {
            return response()->json(['message' => '无权删除管理员用户'], 403);
        }

        $user->delete();
        return response()->json(['message' => '用户删除成功']);
    }

    public function resetPassword(User $user)
    {
        $currentUser = auth()->user();
        
        // 不能重置自己的密码
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => '不能重置自己的密码，请使用修改密码功能'], 403);
        }
        
        // 管理员不能重置管理员用户的密码
        if (!$currentUser->isSuperAdmin() && $user->isAdmin()) {
            return response()->json(['message' => '无权重置管理员用户的密码'], 403);
        }
        
        $user->update([
            'password' => Hash::make('password123')
        ]);

        return response()->json([
            'message' => '密码重置成功，新密码为：password123'
        ]);
    }

    public function approve(User $user)
    {
        $currentUser = auth()->user();
        
        // 管理员不能审核管理员用户
        if (!$currentUser->isSuperAdmin() && $user->isAdmin()) {
            return response()->json(['message' => '无权审核管理员用户'], 403);
        }
        
        $user->update(['status' => 'active']);
        return response()->json(['message' => '用户已审核通过']);
    }

    public function reject(User $user)
    {
        $currentUser = auth()->user();
        
        // 不能拒绝自己
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => '不能拒绝自己的账户'], 403);
        }
        
        // 管理员不能拒绝管理员用户
        if (!$currentUser->isSuperAdmin() && $user->isAdmin()) {
            return response()->json(['message' => '无权拒绝管理员用户'], 403);
        }
        
        $user->update(['status' => 'inactive']);
        return response()->json(['message' => '用户已被拒绝']);
    }
    
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . auth()->id(),
        ]);
        
        $user = auth()->user();
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);
        
        return response()->json([
            'message' => '个人信息更新成功',
            'user' => $user->load(['roles', 'groups'])
        ]);
    }
}
