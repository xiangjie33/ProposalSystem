# RBAC 权限系统 - 快速启动指南

## 🚀 5分钟快速启动

### 前提条件
- PHP >= 8.1
- Composer
- Node.js >= 16
- MySQL >= 5.7
- Git

---

## 📦 第一步：后端设置

### 1. 进入后端目录
```bash
cd proposal-system-backend
```

### 2. 安装依赖
```bash
composer install
```

### 3. 配置环境
```bash
# 复制环境配置文件
cp .env.example .env

# 生成应用密钥
php artisan key:generate
```

### 4. 配置数据库
编辑 `.env` 文件，设置数据库连接：
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. 运行迁移和初始化
```bash
# 创建数据库表
php artisan migrate

# 初始化角色和权限
php artisan db:seed --class=RBACSeeder

# 初始化工作组
php artisan db:seed --class=GroupSeeder

# 如果有现有用户需要迁移
php artisan db:seed --class=MigrateUsersSeeder
```

### 6. 启动后端服务
```bash
php artisan serve
```

后端现在运行在 `http://localhost:8000`

---

## 🎨 第二步：前端设置

### 1. 打开新终端，进入前端目录
```bash
cd proposal-system-frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 API 地址（如果需要）
编辑 `src/services/api.js`，确认 baseURL：
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // ...
});
```

### 4. 启动前端服务
```bash
npm start
```

前端现在运行在 `http://localhost:3000`

---

## 👤 第三步：创建测试用户

### 方法 1：使用 Tinker（推荐）

在后端目录打开 tinker：
```bash
php artisan tinker
```

创建超级管理员：
```php
$user = \App\Models\User::create([
    'name' => '超级管理员',
    'email' => 'admin@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$user->assignRole('super_admin');
$defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
$user->groups()->attach($defaultGroup->id);
```

创建普通会员：
```php
$user = \App\Models\User::create([
    'name' => '测试用户',
    'email' => 'user@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$user->assignRole('member');
$defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
$user->groups()->attach($defaultGroup->id);
```

### 方法 2：使用注册功能

1. 访问 `http://localhost:3000`
2. 点击"注册"
3. 填写信息并提交
4. 使用 tinker 激活用户并分配角色：
```php
$user = \App\Models\User::where('email', 'your@email.com')->first();
$user->status = 'active';
$user->save();
$user->assignRole('member'); // 或其他角色
```

---

## 🎯 第四步：登录测试

### 1. 访问系统
打开浏览器访问：`http://localhost:3000`

### 2. 使用测试账号登录

**超级管理员账号：**
- 邮箱：admin@test.com
- 密码：password123

**普通会员账号：**
- 邮箱：user@test.com
- 密码：password123

### 3. 验证功能

#### 超级管理员应该看到：
- ✅ 文件管理菜单
- ✅ 用户管理菜单
- ✅ 工作组管理菜单
- ✅ 提案管理菜单
- ✅ 所有操作按钮（创建、编辑、删除、上传、下载）

#### 普通会员应该看到：
- ✅ 文件管理菜单
- ✅ 提案管理菜单
- ❌ 没有用户管理和工作组管理菜单
- ❌ 没有任何操作按钮（只能查看）

---

## 📋 快速功能测试

### 测试用户管理（需要管理员权限）
1. 登录管理员账号
2. 点击左侧"用户管理"
3. 点击"新建用户"
4. 填写信息，选择角色和工作组
5. 提交创建

### 测试工作组管理（需要管理员权限）
1. 点击左侧"工作组管理"
2. 点击"新建工作组"
3. 填写工作组信息
4. 点击某个工作组的"成员"按钮
5. 添加或移除成员

### 测试文件管理
1. 点击左侧"文件管理"
2. 点击"新建根目录"（需要权限）
3. 创建一个目录
4. 选择目录后，点击"上传文件"（需要权限）
5. 上传一个文件
6. 测试下载、重命名、删除功能

---

## 🔍 验证系统状态

### 检查角色和权限
```bash
php artisan tinker
```

```php
// 查看所有角色
\Spatie\Permission\Models\Role::with('permissions')->get();

// 查看所有权限
\Spatie\Permission\Models\Permission::all();

// 查看用户的角色和权限
$user = \App\Models\User::first();
$user->roles;
$user->permissions;
$user->getAllPermissions();
```

### 检查工作组
```php
// 查看所有工作组
\App\Models\Group::with('users')->get();

// 查看用户的工作组
$user = \App\Models\User::first();
$user->groups;
```

---

## 🐛 常见问题

### 问题 1：数据库连接失败
**解决方案：**
1. 确认 MySQL 服务正在运行
2. 检查 `.env` 文件中的数据库配置
3. 确认数据库已创建：`CREATE DATABASE proposal_system;`

### 问题 2：迁移失败
**解决方案：**
```bash
# 重置数据库
php artisan migrate:fresh

# 重新运行 Seeders
php artisan db:seed --class=RBACSeeder
php artisan db:seed --class=GroupSeeder
```

### 问题 3：前端无法连接后端
**解决方案：**
1. 确认后端服务正在运行（`php artisan serve`）
2. 检查 CORS 配置：`config/cors.php`
3. 清除缓存：`php artisan config:clear`

### 问题 4：权限不生效
**解决方案：**
```bash
# 清除所有缓存
php artisan cache:clear
php artisan config:clear
php artisan permission:cache-reset
```

### 问题 5：登录后看不到权限
**解决方案：**
1. 退出登录
2. 清除浏览器 localStorage
3. 重新登录
4. 检查浏览器控制台是否有错误

---

## 📊 系统角色说明

| 角色 | 可以做什么 |
|------|-----------|
| **超级管理员** | 所有操作，包括管理其他管理员 |
| **管理员** | 管理普通用户、工作组、文件和目录 |
| **首席会员** | 查看和下载文件 |
| **普通会员** | 仅查看文件和目录 |

---

## 🎓 下一步

### 学习更多
- 📖 阅读 [系统总结文档](RBAC_SYSTEM_SUMMARY.md)
- 🧪 查看 [测试指南](RBAC_TESTING_GUIDE.md)
- 📋 查看 [实施进度](RBAC_IMPLEMENTATION_PROGRESS.md)

### 自定义系统
- 添加新的角色和权限
- 创建自定义工作组
- 扩展用户管理功能
- 添加审计日志

### 部署到生产
- 配置生产环境变量
- 设置 HTTPS
- 配置数据库备份
- 设置监控和日志

---

## 💡 提示

1. **默认密码**：所有通过系统创建的用户默认密码都是 `password123`
2. **首次登录**：建议首次登录后立即修改密码
3. **权限缓存**：修改权限后记得清除缓存
4. **测试环境**：建议使用浏览器隐私模式测试不同角色
5. **数据备份**：定期备份数据库

---

## 📞 获取帮助

如果遇到问题：
1. 查看 Laravel 日志：`storage/logs/laravel.log`
2. 查看浏览器控制台错误
3. 检查网络请求（浏览器开发者工具 Network 标签）
4. 参考相关文档

---

## ✅ 快速检查清单

启动前确认：
- [ ] PHP 版本 >= 8.1
- [ ] Composer 已安装
- [ ] Node.js 已安装
- [ ] MySQL 服务运行中
- [ ] 数据库已创建

后端设置：
- [ ] 依赖已安装（composer install）
- [ ] .env 文件已配置
- [ ] 迁移已运行（migrate）
- [ ] Seeders 已运行
- [ ] 后端服务已启动（php artisan serve）

前端设置：
- [ ] 依赖已安装（npm install）
- [ ] API 地址已配置
- [ ] 前端服务已启动（npm start）

测试：
- [ ] 可以访问前端页面
- [ ] 可以成功登录
- [ ] 权限控制正常工作
- [ ] 可以进行基本操作

---

🎉 **恭喜！你的 RBAC 权限系统已经启动成功！**

现在可以开始使用系统了。祝你使用愉快！
