# 生产环境部署指南

## 🔐 生产环境超级管理员创建

在生产环境中，创建超级管理员需要特别注意安全性。以下是几种推荐的方法：

---

## 方法 1：使用 Artisan 命令（推荐）⭐

### 创建专用的 Artisan 命令

这是最安全和专业的方法。创建一个一次性使用的命令来创建超级管理员。

#### 1. 创建命令文件

```bash
php artisan make:command CreateSuperAdmin
```

#### 2. 编辑命令文件

编辑 `app/Console/Commands/CreateSuperAdmin.php`：

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdmin extends Command
{
    protected $signature = 'user:create-super-admin';
    protected $description = '创建超级管理员账户';

    public function handle()
    {
        $this->info('=== 创建超级管理员 ===');
        $this->warn('注意：此命令仅用于初始化超级管理员账户');
        
        // 检查是否已存在超级管理员
        $existingSuperAdmin = User::role('super_admin')->first();
        if ($existingSuperAdmin) {
            $this->error('系统中已存在超级管理员！');
            $this->info('现有超级管理员邮箱：' . $existingSuperAdmin->email);
            
            if (!$this->confirm('是否继续创建新的超级管理员？', false)) {
                $this->info('操作已取消');
                return 0;
            }
        }

        // 收集信息
        $name = $this->ask('请输入管理员姓名');
        $email = $this->ask('请输入管理员邮箱');
        
        // 验证邮箱
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email'
        ]);
        
        if ($validator->fails()) {
            $this->error('邮箱验证失败：' . $validator->errors()->first('email'));
            return 1;
        }

        // 输入密码（隐藏显示）
        $password = $this->secret('请输入密码（至少8位）');
        $passwordConfirm = $this->secret('请再次输入密码');
        
        if ($password !== $passwordConfirm) {
            $this->error('两次输入的密码不一致！');
            return 1;
        }
        
        if (strlen($password) < 8) {
            $this->error('密码长度至少为8位！');
            return 1;
        }

        // 确认信息
        $this->info("\n=== 请确认以下信息 ===");
        $this->table(
            ['字段', '值'],
            [
                ['姓名', $name],
                ['邮箱', $email],
                ['角色', '超级管理员'],
            ]
        );

        if (!$this->confirm('确认创建？', true)) {
            $this->info('操作已取消');
            return 0;
        }

        try {
            // 创建用户
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'status' => 'active',
            ]);

            // 分配超级管理员角色
            $user->assignRole('super_admin');

            // 加入默认工作组
            $defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
            if ($defaultGroup) {
                $user->groups()->attach($defaultGroup->id);
            }

            $this->info("\n✅ 超级管理员创建成功！");
            $this->info("邮箱：{$email}");
            $this->warn("\n⚠️  请妥善保管登录凭证！");
            $this->warn("⚠️  建议首次登录后立即修改密码！");
            
            // 记录日志
            \Log::info('超级管理员账户已创建', [
                'email' => $email,
                'created_by' => 'artisan_command',
                'ip' => request()->ip() ?? 'CLI'
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error('创建失败：' . $e->getMessage());
            return 1;
        }
    }
}
```

#### 3. 在生产服务器上执行

```bash
# SSH 登录到生产服务器
ssh user@your-server.com

# 进入项目目录
cd /path/to/proposal-system-backend

# 执行命令
php artisan user:create-super-admin
```

#### 4. 按提示输入信息

```
=== 创建超级管理员 ===
请输入管理员姓名: 张三
请输入管理员邮箱: admin@company.com
请输入密码（至少8位）: ********
请再次输入密码: ********

=== 请确认以下信息 ===
+------+----------+
| 字段 | 值       |
+------+----------+
| 姓名 | 张三     |
| 邮箱 | admin@company.com |
| 角色 | 超级管理员 |
+------+----------+

确认创建？ (yes/no) [yes]: yes

✅ 超级管理员创建成功！
邮箱：admin@company.com
⚠️  请妥善保管登录凭证！
⚠️  建议首次登录后立即修改密码！
```

---

## 方法 2：使用 Seeder（适合初始部署）

### 创建专用的 Seeder

#### 1. 创建 Seeder

```bash
php artisan make:seeder ProductionSuperAdminSeeder
```

#### 2. 编辑 Seeder

编辑 `database/seeders/ProductionSuperAdminSeeder.php`：

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProductionSuperAdminSeeder extends Seeder
{
    public function run()
    {
        // 从环境变量读取管理员信息
        $email = env('SUPER_ADMIN_EMAIL');
        $password = env('SUPER_ADMIN_PASSWORD');
        $name = env('SUPER_ADMIN_NAME', '系统管理员');

        if (!$email || !$password) {
            $this->command->error('请在 .env 文件中设置 SUPER_ADMIN_EMAIL 和 SUPER_ADMIN_PASSWORD');
            return;
        }

        // 检查是否已存在
        if (User::where('email', $email)->exists()) {
            $this->command->warn("用户 {$email} 已存在，跳过创建");
            return;
        }

        // 创建超级管理员
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'status' => 'active',
        ]);

        $user->assignRole('super_admin');

        // 加入默认工作组
        $defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
        if ($defaultGroup) {
            $user->groups()->attach($defaultGroup->id);
        }

        $this->command->info("✅ 超级管理员创建成功：{$email}");
        
        // 记录日志
        \Log::info('超级管理员账户已创建', [
            'email' => $email,
            'created_by' => 'seeder'
        ]);
    }
}
```

#### 3. 配置环境变量

编辑生产服务器的 `.env` 文件：

```env
# 超级管理员配置（仅用于初始化）
SUPER_ADMIN_NAME="系统管理员"
SUPER_ADMIN_EMAIL="admin@company.com"
SUPER_ADMIN_PASSWORD="YourSecurePassword123!"
```

#### 4. 执行 Seeder

```bash
php artisan db:seed --class=ProductionSuperAdminSeeder
```

#### 5. 清理敏感信息

**重要：创建完成后立即删除 .env 中的密码配置！**

```bash
# 编辑 .env 文件，删除或注释掉这些行
# SUPER_ADMIN_NAME="系统管理员"
# SUPER_ADMIN_EMAIL="admin@company.com"
# SUPER_ADMIN_PASSWORD="YourSecurePassword123!"
```

---

## 方法 3：使用 Tinker（临时方案）

如果需要快速创建，可以使用 tinker：

```bash
php artisan tinker
```

```php
// 创建超级管理员
$user = \App\Models\User::create([
    'name' => '系统管理员',
    'email' => 'admin@company.com',
    'password' => bcrypt('YourSecurePassword123!'),
    'status' => 'active'
]);

// 分配角色
$user->assignRole('super_admin');

// 加入默认工作组
$defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
$user->groups()->attach($defaultGroup->id);

// 验证
$user->roles;
$user->getAllPermissions()->pluck('name');

// 退出
exit
```

---

## 方法 4：通过现有管理员创建（推荐用于后续）

一旦有了第一个超级管理员，后续的超级管理员应该通过系统界面创建：

1. 使用超级管理员账号登录系统
2. 进入"用户管理"
3. 点击"新建用户"
4. 填写信息并选择"超级管理员"角色
5. 提交创建

---

## 🔒 安全最佳实践

### 1. 密码安全

```bash
# 使用强密码生成器
openssl rand -base64 32

# 或使用 pwgen
pwgen -s 32 1
```

**强密码要求：**
- 至少 12 位字符
- 包含大小写字母
- 包含数字
- 包含特殊字符
- 不使用常见词汇

### 2. 环境变量保护

```bash
# 设置 .env 文件权限
chmod 600 .env

# 确保 .env 不被提交到版本控制
echo ".env" >> .gitignore
```

### 3. 首次登录后的操作

1. **立即修改密码**
   - 登录系统
   - 点击用户菜单 → 修改密码
   - 设置新的强密码

2. **启用双因素认证**（如果已实现）
   - 进入安全设置
   - 启用 2FA

3. **审查系统日志**
   - 检查是否有异常登录
   - 确认账户创建记录

### 4. 限制超级管理员数量

```php
// 在 UserController 中添加限制
public function store(Request $request)
{
    // 限制超级管理员数量
    if ($request->role === 'super_admin') {
        $superAdminCount = User::role('super_admin')->count();
        if ($superAdminCount >= 3) { // 最多3个超级管理员
            return response()->json([
                'message' => '超级管理员数量已达上限'
            ], 403);
        }
    }
    
    // ... 其他代码
}
```

---

## 📋 生产环境部署检查清单

### 部署前

- [ ] 确保已运行所有迁移
- [ ] 确保已运行 RBACSeeder（角色和权限）
- [ ] 确保已运行 GroupSeeder（工作组）
- [ ] 配置好 .env 文件
- [ ] 设置正确的 APP_ENV=production
- [ ] 配置好数据库连接

### 创建超级管理员

- [ ] 选择合适的创建方法
- [ ] 使用强密码
- [ ] 记录管理员信息（安全存储）
- [ ] 验证账户创建成功
- [ ] 测试登录功能

### 部署后

- [ ] 删除 .env 中的临时密码配置
- [ ] 首次登录并修改密码
- [ ] 检查角色和权限是否正确
- [ ] 检查工作组关联
- [ ] 测试所有管理功能
- [ ] 查看系统日志

---

## 🚨 紧急情况处理

### 忘记超级管理员密码

```bash
php artisan tinker
```

```php
// 重置密码
$user = \App\Models\User::where('email', 'admin@company.com')->first();
$user->password = bcrypt('NewSecurePassword123!');
$user->save();

// 验证
$user->email;
exit
```

### 超级管理员账户被锁定

```bash
php artisan tinker
```

```php
// 解锁账户
$user = \App\Models\User::where('email', 'admin@company.com')->first();
$user->status = 'active';
$user->save();
exit
```

### 需要临时提升权限

```bash
php artisan tinker
```

```php
// 临时给用户超级管理员权限
$user = \App\Models\User::where('email', 'user@company.com')->first();
$user->assignRole('super_admin');

// 完成操作后移除
$user->removeRole('super_admin');
exit
```

---

## 📝 审计日志

建议记录所有超级管理员的创建和操作：

```php
// 在创建超级管理员时记录日志
\Log::channel('security')->info('超级管理员账户已创建', [
    'email' => $email,
    'created_by' => auth()->user()->email ?? 'system',
    'ip' => request()->ip(),
    'user_agent' => request()->userAgent(),
    'timestamp' => now()
]);
```

---

## 🔧 自动化脚本

创建一个部署脚本 `deploy-production.sh`：

```bash
#!/bin/bash

echo "=== 生产环境部署脚本 ==="

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
composer install --no-dev --optimize-autoloader

# 3. 运行迁移
php artisan migrate --force

# 4. 运行 Seeders
php artisan db:seed --class=RBACSeeder --force
php artisan db:seed --class=GroupSeeder --force

# 5. 清除缓存
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. 创建超级管理员（如果需要）
read -p "是否需要创建超级管理员？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    php artisan user:create-super-admin
fi

# 7. 设置权限
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "✅ 部署完成！"
```

使用方法：

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

---

## 📞 需要帮助？

如果在生产环境部署过程中遇到问题：

1. 检查 Laravel 日志：`storage/logs/laravel.log`
2. 检查 Web 服务器日志
3. 确认数据库连接正常
4. 验证文件权限设置
5. 查看本文档的故障排除部分

---

## ✅ 推荐方案总结

**最佳实践：**

1. **初次部署**：使用方法 1（Artisan 命令）
2. **自动化部署**：使用方法 2（Seeder + 环境变量）
3. **后续管理员**：使用方法 4（通过系统界面）
4. **紧急情况**：使用方法 3（Tinker）

**安全提示：**
- ✅ 使用强密码
- ✅ 首次登录后立即修改密码
- ✅ 限制超级管理员数量
- ✅ 记录所有管理员操作
- ✅ 定期审查权限分配
- ✅ 不要在代码中硬编码密码
- ✅ 妥善保管 .env 文件

---

**最后更新**：2025-10-15  
**版本**：1.0.0
