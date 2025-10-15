# Bug 修复说明 - 用户状态字段问题

## 🐛 问题描述

使用管理员账号登录时收到错误提示：

```json
{
  "message": "您的账户正在等待管理员审核"
}
```

即使是通过 `php artisan user:create-super-admin` 命令创建的超级管理员也无法登录。

## 🔍 问题原因

### 根本原因

`User` 模型的 `$fillable` 数组中没有包含 `status` 字段，导致在创建用户时，即使代码中指定了 `'status' => 'active'`，该字段也被 Laravel 的批量赋值保护机制忽略了。

### 详细分析

1. **数据库默认值**
   ```php
   // 迁移文件中 status 字段的默认值是 'pending'
   $table->enum('status', ['pending', 'active', 'inactive'])->default('pending');
   ```

2. **User 模型的 fillable（修复前）**
   ```php
   protected $fillable = [
       'name',
       'email',
       'password',
       // ❌ 缺少 'status' 字段
   ];
   ```

3. **创建用户时**
   ```php
   // 虽然代码中指定了 status
   $user = User::create([
       'name' => $name,
       'email' => $email,
       'password' => Hash::make($password),
       'status' => 'active', // ❌ 这个值被忽略了
   ]);
   // 实际保存到数据库的 status 是默认值 'pending'
   ```

4. **登录检查**
   ```php
   // AuthController 中的登录检查
   if ($user->status === 'pending') {
       return response()->json([
           'message' => '您的账户正在等待管理员审核'
       ], 403);
   }
   ```

## ✅ 修复方案

### 修复代码

在 `User` 模型中添加 `status` 到 `$fillable` 数组：

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'status', // ✅ 添加 status 字段
];
```

### 已修复的文件

- ✅ `proposal-system-backend/app/Models/User.php`

## 🔧 修复现有用户

如果已经创建了一些用户，他们的状态可能还是 `'pending'`，需要手动更新：

### 方法 1：使用 Tinker（推荐）

```bash
php artisan tinker
```

```php
// 查看所有待审核的用户
$pendingUsers = \App\Models\User::where('status', 'pending')->get();
foreach ($pendingUsers as $user) {
    echo "{$user->id}: {$user->name} ({$user->email})\n";
}

// 激活特定用户
$user = \App\Models\User::where('email', 'admin@company.com')->first();
$user->status = 'active';
$user->save();
echo "用户 {$user->email} 已激活\n";

// 或者激活所有超级管理员
$superAdmins = \App\Models\User::role('super_admin')->get();
foreach ($superAdmins as $admin) {
    $admin->status = 'active';
    $admin->save();
    echo "超级管理员 {$admin->email} 已激活\n";
}

// 激活所有管理员
$admins = \App\Models\User::role(['super_admin', 'admin'])->get();
foreach ($admins as $admin) {
    $admin->status = 'active';
    $admin->save();
    echo "管理员 {$admin->email} 已激活\n";
}
```

### 方法 2：创建修复脚本

创建一个 Artisan 命令来修复：

```bash
php artisan make:command FixUserStatus
```

编辑 `app/Console/Commands/FixUserStatus.php`：

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixUserStatus extends Command
{
    protected $signature = 'user:fix-status';
    protected $description = '修复用户状态（将所有管理员设置为 active）';

    public function handle()
    {
        $this->info('开始修复用户状态...');
        
        // 获取所有管理员
        $admins = User::role(['super_admin', 'admin'])->get();
        
        $count = 0;
        foreach ($admins as $admin) {
            if ($admin->status !== 'active') {
                $admin->status = 'active';
                $admin->save();
                $this->info("✅ 已激活：{$admin->email}");
                $count++;
            }
        }
        
        if ($count > 0) {
            $this->info("\n✅ 共修复 {$count} 个管理员账户");
        } else {
            $this->info("\n✅ 所有管理员账户状态正常");
        }
        
        return 0;
    }
}
```

然后运行：

```bash
php artisan user:fix-status
```

### 方法 3：直接 SQL 更新（快速但需谨慎）

```bash
php artisan tinker
```

```php
// 激活所有超级管理员
\DB::table('users')
    ->whereIn('id', function($query) {
        $query->select('model_id')
              ->from('model_has_roles')
              ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
              ->where('roles.name', 'super_admin')
              ->where('model_has_roles.model_type', 'App\\Models\\User');
    })
    ->update(['status' => 'active']);

echo "所有超级管理员已激活\n";
```

## 🧪 验证修复

### 1. 创建新用户测试

```bash
php artisan user:create-super-admin
```

创建后，使用 tinker 验证状态：

```php
$user = \App\Models\User::where('email', 'your-email@example.com')->first();
echo "状态：" . $user->status; // 应该输出：active
```

### 2. 登录测试

使用创建的管理员账号登录系统，应该能够成功登录。

### 3. 检查所有用户状态

```bash
php artisan tinker
```

```php
// 查看所有用户的状态
\App\Models\User::all()->each(function($user) {
    $roles = $user->roles->pluck('name')->join(', ');
    echo "{$user->id}: {$user->name} ({$user->email}) - 状态: {$user->status} - 角色: {$roles}\n";
});
```

## 📋 用户状态说明

系统支持三种用户状态：

| 状态 | 值 | 说明 | 可以登录 |
|------|-----|------|---------|
| 待审核 | `pending` | 新注册用户的默认状态 | ❌ 否 |
| 正常 | `active` | 已激活的用户 | ✅ 是 |
| 已禁用 | `inactive` | 被管理员禁用的用户 | ❌ 否 |

## 🔐 最佳实践

### 1. 创建管理员时始终设置为 active

```php
$user = User::create([
    'name' => $name,
    'email' => $email,
    'password' => Hash::make($password),
    'status' => 'active', // ✅ 明确设置状态
]);
```

### 2. 注册普通用户时使用默认状态

```php
// 普通用户注册，使用默认的 pending 状态
$user = User::create([
    'name' => $request->name,
    'email' => $request->email,
    'password' => Hash::make($request->password),
    // status 使用默认值 'pending'，需要管理员审核
]);
```

### 3. 在 UserController 中审核用户

```php
public function approve($id)
{
    $user = User::findOrFail($id);
    $user->status = 'active';
    $user->save();
    
    return response()->json(['message' => '用户已审核通过']);
}

public function reject($id)
{
    $user = User::findOrFail($id);
    $user->status = 'inactive';
    $user->save();
    
    return response()->json(['message' => '用户已被拒绝']);
}
```

## 🚨 注意事项

### 1. 批量赋值保护

Laravel 的批量赋值保护是一个安全特性，确保只有 `$fillable` 中列出的字段才能通过 `create()` 或 `fill()` 方法赋值。

### 2. 敏感字段

如果某些字段不应该被批量赋值（如 `is_admin`、`email_verified_at` 等），不要添加到 `$fillable` 中，而是使用 `$guarded` 或直接赋值：

```php
// 不推荐：将敏感字段加入 fillable
protected $fillable = ['name', 'email', 'password', 'status', 'is_admin'];

// 推荐：使用 guarded 保护敏感字段
protected $guarded = ['is_admin', 'email_verified_at'];

// 或者直接赋值
$user = new User();
$user->name = $name;
$user->email = $email;
$user->password = Hash::make($password);
$user->status = 'active';
$user->save();
```

### 3. 数据库默认值

虽然我们在代码中设置了 `status`，但保持数据库的默认值 `'pending'` 是合理的，因为：
- 普通用户注册时应该默认为待审核状态
- 只有管理员创建的用户或通过命令创建的用户才应该直接激活

## 📝 相关文件

### 需要检查的文件

- ✅ `app/Models/User.php` - User 模型（已修复）
- ✅ `app/Console/Commands/CreateSuperAdmin.php` - 创建超级管理员命令
- ✅ `app/Http/Controllers/Api/AuthController.php` - 登录控制器
- ✅ `app/Http/Controllers/Api/UserController.php` - 用户管理控制器
- ✅ `database/migrations/2025_10_14_155645_add_status_to_users_table.php` - 状态字段迁移

## ✅ 修复完成

现在 `status` 字段已经添加到 `User` 模型的 `$fillable` 数组中，创建用户时可以正确设置状态了。

### 后续步骤

1. ✅ 修复现有用户的状态（如果有）
2. ✅ 重新创建超级管理员（或激活现有的）
3. ✅ 测试登录功能
4. ✅ 验证用户管理功能

---

**修复日期**：2025-10-15  
**影响范围**：用户创建和登录功能  
**修复状态**：✅ 已完成
