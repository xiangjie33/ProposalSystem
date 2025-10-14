<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\ProposalPermission;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    public function index()
    {
        $proposals = Proposal::with(['creator', 'permissions.user', 'permissions.directory'])
            ->latest()
            ->get();
        
        return response()->json($proposals);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,expired,closed',
            'permissions' => 'nullable|array',
            'permissions.*.user_id' => 'required|exists:users,id',
            'permissions.*.directory_id' => 'required|exists:directories,id',
            'permissions.*.expires_at' => 'nullable|date',
        ]);

        $proposal = Proposal::create([
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => auth()->id(),
            'status' => $request->status ?? 'draft',
        ]);

        if ($request->has('permissions')) {
            foreach ($request->permissions as $permission) {
                ProposalPermission::create([
                    'proposal_id' => $proposal->id,
                    'user_id' => $permission['user_id'],
                    'directory_id' => $permission['directory_id'],
                    'expires_at' => $permission['expires_at'] ?? null,
                    'can_upload' => true,
                ]);
            }
        }

        return response()->json($proposal->load(['creator', 'permissions']), 201);
    }

    public function show(Proposal $proposal)
    {
        return response()->json($proposal->load(['creator', 'permissions.user', 'permissions.directory']));
    }

    public function update(Request $request, Proposal $proposal)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,expired,closed',
        ]);

        $proposal->update($request->only(['title', 'description', 'status']));

        return response()->json($proposal);
    }

    public function destroy(Proposal $proposal)
    {
        $proposal->delete();
        return response()->json(['message' => '提案删除成功']);
    }

    public function addPermission(Request $request, Proposal $proposal)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'directory_id' => 'required|exists:directories,id',
            'expires_at' => 'nullable|date',
        ]);

        $permission = ProposalPermission::create([
            'proposal_id' => $proposal->id,
            'user_id' => $request->user_id,
            'directory_id' => $request->directory_id,
            'expires_at' => $request->expires_at,
            'can_upload' => true,
        ]);

        return response()->json($permission->load(['user', 'directory']), 201);
    }
}
