<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Group::class);
        
        $groups = Group::withCount('users')->get();
        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Group::class);
        
        $request->validate([
            'name' => 'required|string|unique:groups,name|max:255',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = Group::create($request->all());
        
        return response()->json($group, 201);
    }

    public function show(Group $group)
    {
        $this->authorize('view', $group);
        
        return response()->json($group->load('users'));
    }

    public function update(Request $request, Group $group)
    {
        $this->authorize('update', $group);
        
        $request->validate([
            'name' => 'required|string|max:255|unique:groups,name,' . $group->id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update($request->all());
        
        return response()->json($group);
    }

    public function destroy(Group $group)
    {
        $this->authorize('delete', $group);
        
        // 不允许删除默认工作组
        if ($group->name === 'default_group') {
            return response()->json(['message' => '不能删除默认工作组'], 403);
        }
        
        $group->delete();
        
        return response()->json(['message' => '工作组删除成功']);
    }

    /**
     * 添加用户到工作组
     */
    public function addUser(Group $group, User $user)
    {
        $this->authorize('update', $group);
        
        if ($group->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => '用户已在此工作组中'], 400);
        }
        
        $group->users()->attach($user->id);
        
        return response()->json(['message' => '用户添加成功']);
    }

    /**
     * 从工作组移除用户
     */
    public function removeUser(Group $group, User $user)
    {
        $this->authorize('update', $group);
        
        // 不允许从默认工作组移除用户
        if ($group->name === 'default_group') {
            return response()->json(['message' => '不能从默认工作组移除用户'], 403);
        }
        
        $group->users()->detach($user->id);
        
        return response()->json(['message' => '用户移除成功']);
    }
}
