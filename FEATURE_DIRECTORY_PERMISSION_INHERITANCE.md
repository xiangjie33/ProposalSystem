# 功能说明 - 目录权限继承

## 🎯 问题描述

当用户被授权访问子目录时，无法看到父目录，导致无法导航到子目录。

**示例：**
```
admin/
  └── xiangjie2/  ← 用户被授权访问这个

实际情况：
- 用户看不到 admin 目录
- 因此也无法访问 xiangjie2 目录
```

## ✅ 解决方案

实现"向上可见"的权限继承机制：
- 如果用户有子目录的访问权限
- 则自动可以看到（但不一定能操作）所有父目录
- 这样用户可以导航到被授权的子目录

## 🔧 实现逻辑

### 1. 目录树权限过滤

**原理：**
1. 获取用户被授权的所有目录ID
2. 查找这些目录的所有祖先目录ID
3. 合并授权目录和祖先目录
4. 只显示这些目录

**代码实现：**

```php
public function tree()
{
    $user = auth()->user();
    
    // 管理员可以看到所有目录
    if ($user->isAdmin()) {
        return Directory::with(['children.children', 'files'])
            ->whereNull('parent_id')
            ->get();
    }
    
    // 获取用户被授权的目录ID
    $authorizedDirectoryIds = $user->directories()->pluck('directories.id')->toArray();
    
    // 获取所有祖先目录ID
    $ancestorIds = $this->getAncestorDirectoryIds($authorizedDirectoryIds);
    
    // 合并可见目录
    $visibleDirectoryIds = array_unique(array_merge($authorizedDirectoryIds, $ancestorIds));
    
    // 返回过滤后的目录树
    return Directory::with(['children' => function($query) use ($visibleDirectoryIds) {
            $query->whereIn('id', $visibleDirectoryIds)
                  ->orWhere('is_public', true);
        }])
        ->whereNull('parent_id')
        ->where(function($q) use ($visibleDirectoryIds) {
            $q->whereIn('id', $visibleDirectoryIds)
              ->orWhere('is_public', true);
        })
        ->get();
}

/**
 * 递归获取祖先目录ID
 */
private function getAncestorDirectoryIds($directoryIds)
{
    $ancestorIds = [];
    
    foreach ($directoryIds as $dirId) {
        $directory = Directory::find($dirId);
        if ($directory) {
            $current = $directory;
            // 向上遍历到根目录
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
```

### 2. 权限级别

**可见性 vs 操作权限：**

| 目录 | 被授权 | 可见 | 可操作 |
|------|--------|------|--------|
| 根目录 | ❌ | ✅ (因为子目录被授权) | ❌ |
| 子目录 | ✅ | ✅ | ✅ |
| 孙目录 | ❌ | ❌ | ❌ |

**说明：**
- **可见**：可以在目录树中看到
- **可操作**：可以查看文件、上传、下载等

## 📋 使用场景

### 场景 1：项目子目录授权

**需求：**
```
项目A/
  ├── 文档/
  ├── 代码/  ← 只授权这个给开发人员
  └── 测试/
```

**效果：**
- 开发人员可以看到"项目A"（父目录）
- 开发人员可以看到"代码"（授权目录）
- 开发人员看不到"文档"和"测试"（未授权的兄弟目录）

### 场景 2：深层目录授权

**需求：**
```
公司/
  └── 部门A/
      └── 项目1/
          └── 文档/  ← 只授权这个
```

**效果：**
- 用户可以看到：公司 → 部门A → 项目1 → 文档
- 用户只能操作"文档"目录
- 其他目录只是导航路径

### 场景 3：多个子目录授权

**需求：**
```
admin/
  ├── sanguo/     ← 授权
  ├── xiangjie2/  ← 授权
  └── xiangjie33/ ← 授权
```

**效果：**
- 用户可以看到"admin"（父目录）
- 用户可以看到并操作所有三个子目录

## 🧪 测试验证

### 测试 1：子目录授权

```bash
# 1. 创建目录结构
admin/
  └── xiangjie2/

# 2. 只授权 xiangjie2 给用户

# 3. 用户登录后应该看到：
admin/  ← 可见但不可操作
  └── xiangjie2/  ← 可见且可操作
```

### 测试 2：多级目录

```bash
# 1. 创建深层结构
A/
  └── B/
      └── C/
          └── D/  ← 只授权这个

# 2. 用户应该看到完整路径：
A/ → B/ → C/ → D/

# 3. 但只能操作 D 目录
```

### 测试 3：兄弟目录隔离

```bash
# 1. 创建结构
parent/
  ├── child1/  ← 授权
  ├── child2/  ← 不授权
  └── child3/  ← 授权

# 2. 用户应该看到：
parent/
  ├── child1/  ← 可见
  └── child3/  ← 可见

# 3. child2 不可见
```

## 💡 权限检查逻辑

### 查看目录内容

```php
// 用户可以查看目录内容的条件：
1. 用户是管理员
2. 目录是公开的
3. 用户被明确授权该目录
4. 用户被授权该目录的任何子目录（可以看到但不能操作）
```

### 操作目录

```php
// 用户可以操作目录（上传、下载等）的条件：
1. 用户是管理员
2. 目录是公开的 AND 用户有相应权限
3. 用户被明确授权该目录
```

## 🚨 注意事项

### 1. 性能考虑

**问题：**
- 递归查询祖先目录可能影响性能

**优化方案：**
```php
// 方案 1：缓存祖先目录
Cache::remember("user_{$userId}_ancestor_dirs", 3600, function() {
    return $this->getAncestorDirectoryIds($authorizedIds);
});

// 方案 2：使用闭包表（Closure Table）
// 在数据库中预先存储所有祖先关系

// 方案 3：使用路径字段
// 在 directories 表添加 path 字段，存储完整路径
```

### 2. 权限更新

**问题：**
- 授权变更后，缓存可能不一致

**解决方案：**
```php
// 在更新用户目录权限时清除缓存
public function update(Request $request, User $user)
{
    // ... 更新逻辑
    
    if ($request->has('directories')) {
        $user->directories()->sync($request->directories);
        
        // 清除缓存
        Cache::forget("user_{$user->id}_ancestor_dirs");
        Cache::forget("user_{$user->id}_visible_dirs");
    }
}
```

### 3. 公开目录

**规则：**
- 公开目录始终可见
- 公开目录的子目录不自动公开
- 需要单独设置

### 4. 文件访问

**重要：**
- 能看到目录 ≠ 能访问目录中的文件
- 文件访问需要检查目录是否被明确授权

```php
// 文件下载权限检查
public function download(File $file)
{
    $user = auth()->user();
    $directory = $file->directory;
    
    // 检查是否有下载权限
    if (!$user->hasPermission('download-file')) {
        return response()->json(['message' => '无下载权限'], 403);
    }
    
    // 检查目录权限（必须明确授权，不能只是可见）
    if (!$user->isAdmin() && 
        !$directory->is_public && 
        !$user->directories->contains($directory->id)) {
        return response()->json(['message' => '无权访问此目录的文件'], 403);
    }
    
    return Storage::download($file->path);
}
```

## 📊 权限矩阵

| 场景 | 目录可见 | 文件可见 | 可上传 | 可下载 | 可删除 |
|------|---------|---------|--------|--------|--------|
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 公开目录 | ✅ | ✅ | ❌ | ✅* | ❌ |
| 明确授权 | ✅ | ✅ | ✅* | ✅* | ✅* |
| 子目录授权（父目录） | ✅ | ❌ | ❌ | ❌ | ❌ |
| 未授权 | ❌ | ❌ | ❌ | ❌ | ❌ |

*需要相应的权限（upload-file, download-file等）

## ✅ 功能清单

### 已实现

- ✅ 子目录授权时父目录可见
- ✅ 递归查找祖先目录
- ✅ 目录树正确过滤
- ✅ 兄弟目录隔离
- ✅ 公开目录支持

### 待优化（可选）

- ⏳ 性能优化（缓存）
- ⏳ 使用闭包表优化查询
- ⏳ 添加路径字段
- ⏳ 批量权限检查
- ⏳ 权限预加载

## 🔄 升级建议

### 短期优化

```php
// 1. 添加缓存
public function tree()
{
    $user = auth()->user();
    $cacheKey = "user_{$user->id}_directory_tree";
    
    return Cache::remember($cacheKey, 3600, function() use ($user) {
        // 原有逻辑
    });
}

// 2. 清除缓存
Event::listen(DirectoryPermissionUpdated::class, function($event) {
    Cache::forget("user_{$event->userId}_directory_tree");
});
```

### 长期优化

```sql
-- 添加闭包表
CREATE TABLE directory_paths (
    ancestor_id BIGINT,
    descendant_id BIGINT,
    depth INT,
    PRIMARY KEY (ancestor_id, descendant_id)
);

-- 查询变得非常简单
SELECT DISTINCT ancestor_id 
FROM directory_paths 
WHERE descendant_id IN (授权的目录IDs);
```

---

**功能完成日期**：2025-10-15  
**版本**：1.3.0  
**状态**：✅ 已完成
