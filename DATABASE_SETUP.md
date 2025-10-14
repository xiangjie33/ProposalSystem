# 数据库设置指南

## 创建数据库

### 使用 MySQL 命令行

```sql
CREATE DATABASE proposal_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 或使用 phpMyAdmin

1. 打开 phpMyAdmin
2. 点击"新建"
3. 输入数据库名称：`proposal_system`
4. 选择排序规则：`utf8mb4_unicode_ci`
5. 点击"创建"

## 配置 Laravel 环境

编辑 `proposal-system-backend/.env` 文件：

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

## 运行迁移

在 `proposal-system-backend` 目录下执行：

```bash
# 运行所有迁移
php artisan migrate

# 如果需要重置数据库
php artisan migrate:fresh

# 运行迁移并填充数据
php artisan migrate:fresh --seed
```

## 数据库表结构

### users 表
- id: 主键
- name: 用户名
- email: 邮箱（唯一）
- password: 密码（加密）
- created_at, updated_at: 时间戳

### directories 表
- id: 主键
- name: 目录名称
- parent_id: 父目录 ID（可为空）
- created_by: 创建者用户 ID
- path: 目录路径
- created_at, updated_at: 时间戳

### files 表
- id: 主键
- name: 文件名
- original_name: 原始文件名
- directory_id: 所属目录 ID
- uploaded_by: 上传者用户 ID
- file_path: 文件存储路径
- mime_type: 文件类型
- size: 文件大小（字节）
- created_at, updated_at: 时间戳

### proposals 表
- id: 主键
- title: 提案标题
- description: 提案描述
- created_by: 创建者用户 ID
- status: 状态（draft/active/expired/closed）
- created_at, updated_at: 时间戳

### proposal_permissions 表
- id: 主键
- proposal_id: 提案 ID
- user_id: 用户 ID
- directory_id: 目录 ID
- expires_at: 过期时间
- can_upload: 是否可上传
- created_at, updated_at: 时间戳

### roles 表（由 spatie/laravel-permission 创建）
- id: 主键
- name: 角色名称
- guard_name: 守卫名称

### permissions 表（由 spatie/laravel-permission 创建）
- id: 主键
- name: 权限名称
- guard_name: 守卫名称

## 初始化角色和权限

运行 Seeder：

```bash
php artisan db:seed --class=RolePermissionSeeder
```

这将创建：

### 角色
- admin: 管理员（拥有所有权限）
- user: 普通用户（可上传和下载文件）

### 权限
- manage-users: 管理用户
- manage-directories: 管理目录
- manage-files: 管理文件
- manage-proposals: 管理提案
- upload-files: 上传文件
- download-files: 下载文件

## 创建测试用户

可以使用 tinker 创建测试用户：

```bash
php artisan tinker
```

然后执行：

```php
$user = \App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123')
]);
$user->assignRole('admin');

$user = \App\Models\User::create([
    'name' => 'Test User',
    'email' => 'user@example.com',
    'password' => bcrypt('password123')
]);
$user->assignRole('user');
```

## 故障排除

### 连接错误
- 检查 MySQL 服务是否运行
- 验证 .env 文件中的数据库凭据
- 确保数据库已创建

### 迁移错误
- 清除配置缓存：`php artisan config:clear`
- 清除缓存：`php artisan cache:clear`
- 检查数据库用户权限

### 权限错误
- 确保已运行 `php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"`
- 运行 `php artisan config:clear`
- 重新运行迁移
