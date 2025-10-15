<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Directory;
use Illuminate\Http\Request;

class DirectoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $parentId = $request->query('parent_id');
        
        $query = Directory::with(['children', 'files', 'creator'])
            ->where('parent_id', $parentId);
        
        // 非管理员只能看到有权限的目录
        if (!$user->isAdmin()) {
            $query->where(function($q) use ($user) {
                // 公开目录
                $q->where('is_public', true)
                  // 或者直接授权的目录
                  ->orWhereHas('users', function($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  })
                  // 或者有子目录被授权的目录（父目录可见）
                  ->orWhereHas('children.users', function($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
            });
        }
        
        $directories = $query->get();
        
        return response()->json($directories);
    }

    public function tree()
    {
        $user = auth()->user();
        
        // 管理员可以看到所有目录
        if ($user->isAdmin()) {
            $directories = Directory::with(['children.children', 'files'])
                ->whereNull('parent_id')
                ->get();
            return response()->json($directories);
        }
        
        // 非管理员：获取所有有权限的目录ID（包括子孙目录）
        $authorizedDirectoryIds = $user->directories()->pluck('directories.id')->toArray();
        
        if (empty($authorizedDirectoryIds)) {
            // 如果没有任何授权，只返回公开目录
            $directories = Directory::with(['children.children', 'files'])
                ->whereNull('parent_id')
                ->where('is_public', true)
                ->get();
            return response()->json($directories);
        }
        
        // 获取所有授权目录的祖先目录ID
        $ancestorIds = $this->getAncestorDirectoryIds($authorizedDirectoryIds);
        
        // 合并授权目录和祖先目录
        $visibleDirectoryIds = array_unique(array_merge($authorizedDirectoryIds, $ancestorIds));
        
        // 获取根目录（必须是可见的或公开的）
        $directories = Directory::with(['children' => function($query) use ($visibleDirectoryIds) {
                $query->whereIn('id', $visibleDirectoryIds)
                      ->orWhere('is_public', true)
                      ->with(['children' => function($q) use ($visibleDirectoryIds) {
                          $q->whereIn('id', $visibleDirectoryIds)
                            ->orWhere('is_public', true);
                      }]);
            }, 'files'])
            ->whereNull('parent_id')
            ->where(function($q) use ($visibleDirectoryIds) {
                $q->whereIn('id', $visibleDirectoryIds)
                  ->orWhere('is_public', true);
            })
            ->get();
        
        return response()->json($directories);
    }
    
    /**
     * 获取指定目录的所有祖先目录ID
     */
    private function getAncestorDirectoryIds($directoryIds)
    {
        $ancestorIds = [];
        
        foreach ($directoryIds as $dirId) {
            $directory = Directory::find($dirId);
            if ($directory) {
                $current = $directory;
                while ($current->parent_id) {
                    if (!in_array($current->parent_id, $ancestorIds)) {
                        $ancestorIds[] = $current->parent_id;
                    }
                    $current = Directory::find($current->parent_id);
                    if (!$current) break;
                }
            }
        }
        
        return $ancestorIds;
    }

    public function store(Request $request)
    {
        // 检查创建目录权限
        if (!auth()->user()->can('create-directory')) {
            return response()->json(['message' => '无权创建目录'], 403);
        }

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
        // 检查修改目录权限
        if (!auth()->user()->can('update-directory')) {
            return response()->json(['message' => '无权修改目录'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $directory->update(['name' => $request->name]);

        return response()->json($directory);
    }

    public function destroy(Directory $directory)
    {
        // 检查删除目录权限
        if (!auth()->user()->can('delete-directory')) {
            return response()->json(['message' => '无权删除目录'], 403);
        }

        $directory->delete();
        return response()->json(['message' => '目录删除成功']);
    }
}
