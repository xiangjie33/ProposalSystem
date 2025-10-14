<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Directory;
use Illuminate\Http\Request;

class DirectoryController extends Controller
{
    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');
        $directories = Directory::with(['children', 'files', 'creator'])
            ->where('parent_id', $parentId)
            ->get();
        
        return response()->json($directories);
    }

    public function tree()
    {
        $directories = Directory::with(['children.children', 'files'])
            ->whereNull('parent_id')
            ->get();
        
        return response()->json($directories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:directories,id',
        ]);

        $path = $request->name;
        if ($request->parent_id) {
            $parent = Directory::find($request->parent_id);
            $path = $parent->path . '/' . $request->name;
        }

        $directory = Directory::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'created_by' => auth()->id(),
            'path' => $path,
        ]);

        return response()->json($directory->load(['creator', 'parent']), 201);
    }

    public function show(Directory $directory)
    {
        return response()->json($directory->load(['children', 'files', 'creator', 'parent']));
    }

    public function update(Request $request, Directory $directory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $directory->update(['name' => $request->name]);

        return response()->json($directory);
    }

    public function destroy(Directory $directory)
    {
        $directory->delete();
        return response()->json(['message' => '目录删除成功']);
    }
}
