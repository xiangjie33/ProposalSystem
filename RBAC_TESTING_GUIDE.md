# RBAC 权限系统测试指南

## 🚀 启动系统

### 后端启动
```bash
cd proposal-system-backend
php artisan serve
```

### 前端启动
```bash
cd proposal-system-frontend
npm start
```

## 📋 测试准备

### 1. 确保数据库已初始化
```bash
cd proposal-system-backend

# 运行迁移
php artisan migrate

# 运行 Seeders
php artisan db:seed --class=RBACSeeder
php artisan db:seed --class=GroupSeeder
php artisan db:seed --class=MigrateUsersSeeder
```

### 2. 创建测试用户

使用 tinker 创建不同角色的测试用户：

```bash
php artisan tinker
```

```php
// 创建超级管理员
$superAdmin = \App\Models\User::create([
    'name' => '超级管理员',
    'email' => 'superadmin@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$superAdmin->assignRole('super_admin');

// 创建管理员
$admin = \App\Models\User::create([
    'name' => '管理员',
    'email' => 'admin@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$admin->assignRole('admin');

// 创建首席会员
$senior = \App\Models\User::create([
    'name' => '首席会员',
    'email' => 'senior@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$senior->assignRole('senior_member');

// 创建普通会员
$member = \App\Models\User::create([
    'name' => '普通会员',
    'email' => 'member@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$member->assignRole('member');

// 将用户加入默认工作组
$defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
$superAdmin->groups()->attach($defaultGroup->id);
$admin->groups()->attach($defaultGroup->id);
$senior->groups()->attach($defaultGroup->id);
$member->groups()->attach($defaultGroup->id);
```

## 🧪 测试场景

### 场景 1：超级管理员测试

**登录信息：**
- 邮箱：superadmin@test.com
- 密码：password123

**预期行为：**
- ✅ 可以看到"用户管理"和"工作组管理"菜单
- ✅ 可以创建、编辑、删除所有用户（包括其他管理员）
- ✅ 可以创建、编辑、删除工作组
- ✅ 可以管理工作组成员
- ✅ 可以创建、编辑、删除目录
- ✅ 可以上传、下载、编辑、删除文件

**测试步骤：**
1. 登录系统
2. 进入"用户管理"，尝试创建一个新管理员
3. 进入"工作组管理"，创建一个新工作组
4. 添加用户到新工作组
5. 进入"文件管理"，创建目录、上传文件
6. 测试所有文件操作（下载、重命名、删除）

---

### 场景 2：管理员测试

**登录信息：**
- 邮箱：admin@test.com
- 密码：password123

**预期行为：**
- ✅ 可以看到"用户管理"和"工作组管理"菜单
- ✅ 可以创建、编辑普通用户和首席会员
- ❌ 不能创建或编辑管理员和超级管理员
- ✅ 可以创建、编辑、删除工作组
- ✅ 可以管理工作组成员
- ✅ 可以创建、编辑、删除目录
- ✅ 可以上传、下载、编辑、删除文件

**测试步骤：**
1. 登录系统
2. 进入"用户管理"，尝试创建一个普通会员（应该成功）
3. 尝试创建一个管理员（应该失败或被限制）
4. 进入"工作组管理"，测试工作组管理功能
5. 进入"文件管理"，测试所有文件和目录操作

---

### 场景 3：首席会员测试

**登录信息：**
- 邮箱：senior@test.com
- 密码：password123

**预期行为：**
- ❌ 看不到"用户管理"和"工作组管理"菜单
- ❌ 不能创建、编辑、删除目录
- ❌ 不能上传、编辑、删除文件
- ✅ 可以查看目录
- ✅ 可以查看和下载文件

**测试步骤：**
1. 登录系统
2. 确认左侧菜单只有"文件管理"和"提案管理"
3. 进入"文件管理"，确认没有"新建根目录"按钮
4. 选择一个目录，确认没有"上传文件"按钮
5. 确认文件列表中只有"下载"按钮，没有"重命名"和"删除"按钮
6. 测试下载文件功能（应该成功）

---

### 场景 4：普通会员测试

**登录信息：**
- 邮箱：member@test.com
- 密码：password123

**预期行为：**
- ❌ 看不到"用户管理"和"工作组管理"菜单
- ❌ 不能创建、编辑、删除目录
- ❌ 不能上传、编辑、删除文件
- ❌ 不能下载文件
- ✅ 可以查看目录
- ✅ 可以查看文件列表

**测试步骤：**
1. 登录系统
2. 确认左侧菜单只有"文件管理"和"提案管理"
3. 进入"文件管理"，确认没有"新建根目录"按钮
4. 选择一个目录，确认没有"上传文件"按钮
5. 确认文件列表中没有任何操作按钮（下载、重命名、删除都不显示）
6. 可以看到文件列表，但不能进行任何操作

---

## 🔍 API 测试

### 使用 Postman 或 curl 测试

#### 1. 登录获取 Token
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.com",
    "password": "password123"
  }'
```

响应示例：
```json
{
  "access_token": "1|xxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "超级管理员",
    "email": "superadmin@test.com",
    "roles": [
      {
        "id": 1,
        "name": "super_admin"
      }
    ],
    "groups": [
      {
        "id": 1,
        "name": "用户组"
      }
    ]
  },
  "permissions": [
    "manage-all-users",
    "manage-users",
    "view-users",
    ...
  ]
}
```

#### 2. 获取工作组列表
```bash
curl -X GET http://localhost:8000/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. 创建工作组
```bash
curl -X POST http://localhost:8000/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试组",
    "description": "这是一个测试工作组"
  }'
```

#### 4. 添加用户到工作组
```bash
curl -X POST http://localhost:8000/api/groups/1/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. 获取用户列表（包含角色和工作组）
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 权限矩阵验证

使用以下表格验证每个角色的权限：

| 功能 | 超级管理员 | 管理员 | 首席会员 | 普通会员 |
|------|-----------|--------|---------|---------|
| 管理所有用户 | ✅ | ❌ | ❌ | ❌ |
| 管理普通用户 | ✅ | ✅ | ❌ | ❌ |
| 查看用户 | ✅ | ✅ | ❌ | ❌ |
| 管理工作组 | ✅ | ✅ | ❌ | ❌ |
| 查看工作组 | ✅ | ✅ | ❌ | ❌ |
| 创建目录 | ✅ | ✅ | ❌ | ❌ |
| 修改目录 | ✅ | ✅ | ❌ | ❌ |
| 删除目录 | ✅ | ✅ | ❌ | ❌ |
| 查看目录 | ✅ | ✅ | ✅ | ✅ |
| 上传文件 | ✅ | ✅ | ❌ | ❌ |
| 下载文件 | ✅ | ✅ | ✅ | ❌ |
| 修改文件 | ✅ | ✅ | ❌ | ❌ |
| 删除文件 | ✅ | ✅ | ❌ | ❌ |
| 查看文件 | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 常见问题排查

### 问题 1：权限不生效
```bash
# 清除缓存
php artisan cache:clear
php artisan config:clear
php artisan permission:cache-reset
```

### 问题 2：用户没有角色
```bash
php artisan tinker

# 检查用户角色
$user = \App\Models\User::find(1);
$user->roles;

# 分配角色
$user->assignRole('member');
```

### 问题 3：前端权限信息未更新
- 退出登录后重新登录
- 检查浏览器 localStorage 中的 permissions 数据
- 检查 API 响应是否包含 permissions 字段

### 问题 4：CORS 错误
确保后端 `config/cors.php` 配置正确：
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000'],
```

---

## ✅ 测试检查清单

### 后端测试
- [ ] 所有迁移成功运行
- [ ] Seeders 成功创建角色、权限和工作组
- [ ] 用户可以成功分配角色
- [ ] 用户可以成功加入工作组
- [ ] API 返回正确的权限信息
- [ ] 权限中间件正确拦截未授权请求

### 前端测试
- [ ] 不同角色登录后看到正确的菜单
- [ ] 文件操作按钮根据权限正确显示/隐藏
- [ ] 目录操作按钮根据权限正确显示/隐藏
- [ ] 用户管理界面正确显示角色和工作组
- [ ] 工作组管理功能正常工作
- [ ] 权限不足时显示正确的错误提示

### 集成测试
- [ ] 超级管理员可以执行所有操作
- [ ] 管理员不能管理其他管理员
- [ ] 首席会员只能查看和下载
- [ ] 普通会员只能查看
- [ ] 工作组成员管理正常工作
- [ ] 默认工作组不能被删除

---

## 📝 测试报告模板

```markdown
## 测试日期：YYYY-MM-DD

### 测试环境
- 后端：Laravel x.x
- 前端：React x.x
- 数据库：MySQL x.x

### 测试结果

#### 超级管理员
- [ ] 用户管理：通过/失败
- [ ] 工作组管理：通过/失败
- [ ] 文件操作：通过/失败
- [ ] 目录操作：通过/失败

#### 管理员
- [ ] 用户管理：通过/失败
- [ ] 工作组管理：通过/失败
- [ ] 文件操作：通过/失败
- [ ] 目录操作：通过/失败

#### 首席会员
- [ ] 查看权限：通过/失败
- [ ] 下载权限：通过/失败
- [ ] 无编辑权限：通过/失败

#### 普通会员
- [ ] 查看权限：通过/失败
- [ ] 无操作权限：通过/失败

### 发现的问题
1. 
2. 
3. 

### 建议改进
1. 
2. 
3. 
```

---

## 🎓 提示

1. **测试顺序**：建议按照超级管理员 → 管理员 → 首席会员 → 普通会员的顺序测试
2. **清除缓存**：每次修改权限配置后记得清除缓存
3. **使用隐私模式**：测试不同用户时使用浏览器隐私模式，避免 token 混淆
4. **检查控制台**：前端测试时注意查看浏览器控制台的错误信息
5. **查看日志**：后端测试时查看 `storage/logs/laravel.log` 了解详细错误

祝测试顺利！🎉
