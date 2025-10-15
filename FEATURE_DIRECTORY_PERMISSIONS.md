# 新功能说明 - 目录访问权限控制

## ✨ 新增功能

### 1. 用户目录访问权限控制

管理员可以为每个用户指定可以访问哪些目录，实现细粒度的目录访问控制。

### 2. 公开目录功能

可以将某些目录设置为公开，所有用户都可以访问。

### 3. 编辑用户限制

- 姓名字段在编辑时不可修改（保持用户身份一致性）
- 管理员只能设置用户为"首席会员"或"普通会员"角色

### 4. 个人信息完善

个人信息页面现在显示完整的用户信息，包括角色、工作组、状态等。

---

## 🗄️ 数据库变更

### 新增表：user_directory_permissions

用于存储用户和目录的访问权限关联。

```sql
CREATE TABLE user_directory_permissions (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    directory_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, directory_id)
);
```

### 修改表：directories

添加 `is_public` 字段，标记目录是否公开访问。

```sql
ALTER TABLE directories ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
```

---

## 🔧 功能实现

### 1. 目录访问权限控制

#### 权限规则

1. **管理员（超级管理员和普通管理员）**
   - 可以访问所有目录
   - 不受权限限制

2. **普通用户（首席会员和普通会员）**
   - 只能访问被授权的目录
   - 可以访问公开目录
   - 未授权的目录不可见

#### 后端实现

**User 模型新增方法：**

```php
public function canAccessDirectory($directoryId): bool
{
    // 管理员可以访问所有目录
    if ($this->isAdmin()) {
        return true;
    }
    
    // 检查目录是否公开
    $directory = Directory::find($directoryId);
    if ($directory && $directory->is_public) {
        return true;
    }
    
    // 检查用户是否有该目录的访问权限
    return $this->directories()->where('directory_id', $directoryId)->exists();
}
```

**DirectoryController 权限过滤：**

```php
public function index(Request $request)
{
    $user = auth()->user();
    $query = Directory::with(['children', 'files', 'creator']);
    
    // 非管理员只能看到有权限的目录
    if (!$user->isAdmin()) {
        $query->where(function($q) use ($user) {
            $q->where('is_public', true)
              ->orWhereHas('users', function($q2) use ($user) {
                  $q2->where('user_id', $user->id);
              });
        });
    }
    
    return response()->json($query->get());
}
```

### 2. 用户管理界面改进

#### 编辑用户功能

**姓名字段处理：**

```php
// 后端：姓名字段变为可选
$request->validate([
    'name' => 'sometimes|required|string|max:255', // sometimes = 可选
    // ...
]);

// 只有提供了name才更新
if ($request->has('name')) {
    $user->update(['name' => $request->name]);
}
```

**前端：姓名字段禁用**

```javascript
<Form.Item
  name="name"
  label="姓名"
>
  <Input disabled={!!editingUser} placeholder="请输入姓名" />
</Form.Item>
```

#### 角色选择限制

管理员只能选择以下角色：
- 首席会员（senior_member）
- 普通会员（member）

不显示：
- 超级管理员（super_admin）
- 管理员（admin）

```javascript
<Select>
  <Select.Option value="senior_member">首席会员</Select.Option>
  <Select.Option value="member">普通会员</Select.Option>
</Select>
```

#### 目录权限选择

```javascript
<Form.Item
  name="directories"
  label="可访问目录"
  extra="不选择则无法访问任何目录，管理员可访问所有目录"
>
  <Select
    mode="multiple"
    placeholder="请选择可访问的目录"
    allowClear
    showSearch
  >
    {directories.map(dir => (
      <Select.Option key={dir.id} value={dir.id}>
        {dir.name}
      </Select.Option>
    ))}
  </Select>
</Form.Item>
```

### 3. 个人信息页面

#### 显示内容

- ✅ 用户ID
- ✅ 角色（带颜色标签）
- ✅ 工作组（带颜色标签）
- ✅ 账户状态
- ✅ 注册时间
- ✅ 可编辑的姓名和邮箱

#### 界面效果

```
┌─────────────────────────────────────┐
│ 个人信息                             │
├─────────────────────────────────────┤
│ 用户ID:      1                      │
│ 角色:        [超级管理员]            │
│ 工作组:      [用户组] [开发组]       │
│ 账户状态:    [正常]                  │
│ 注册时间:    2025-10-15 10:00:00    │
├─────────────────────────────────────┤
│ 修改信息                             │
│                                     │
│ 姓名: [张三          ]              │
│ 邮箱: [admin@test.com]              │
│                                     │
│           [取消]  [保存]            │
└─────────────────────────────────────┘
```

---

## 📋 使用场景

### 场景 1：限制用户访问特定目录

**需求：**
某个用户只能访问"项目A"和"项目B"目录。

**操作步骤：**
1. 进入用户管理
2. 点击编辑用户
3. 在"可访问目录"中选择"项目A"和"项目B"
4. 保存

**效果：**
- 该用户登录后只能看到"项目A"和"项目B"目录
- 其他目录对该用户不可见

### 场景 2：设置公开目录

**需求：**
"公告"目录需要所有用户都能访问。

**操作步骤：**
1. 进入数据库或通过API
2. 将"公告"目录的 `is_public` 设置为 `true`

```php
$directory = Directory::where('name', '公告')->first();
$directory->is_public = true;
$directory->save();
```

**效果：**
- 所有用户都能看到"公告"目录
- 无需单独授权

### 场景 3：批量授权

**需求：**
将多个用户授权访问同一个目录。

**操作步骤：**
1. 逐个编辑用户
2. 为每个用户添加该目录权限

或使用代码批量授权：

```php
$directory = Directory::find(1);
$userIds = [2, 3, 4, 5];

foreach ($userIds as $userId) {
    $user = User::find($userId);
    if (!$user->directories->contains($directory->id)) {
        $user->directories()->attach($directory->id);
    }
}
```

---

## 🔍 API 变更

### UserController

#### 更新用户（PUT /api/users/{id}）

**新增请求参数：**

```json
{
  "name": "张三",  // 可选，编辑时可以不传
  "role": "senior_member",
  "groups": [1, 2],
  "directories": [1, 3, 5]  // 新增：可访问的目录ID数组
}
```

**响应数据：**

```json
{
  "id": 1,
  "name": "张三",
  "email": "user@test.com",
  "roles": [...],
  "groups": [...],
  "directories": [  // 新增：用户可访问的目录列表
    {
      "id": 1,
      "name": "项目A",
      "path": "/项目A"
    },
    {
      "id": 3,
      "name": "项目B",
      "path": "/项目B"
    }
  ]
}
```

### DirectoryController

#### 获取目录列表（GET /api/directories）

**权限过滤：**
- 管理员：返回所有目录
- 普通用户：只返回有权限的目录（授权的 + 公开的）

#### 获取目录树（GET /api/directories/tree）

**权限过滤：**
- 管理员：返回完整目录树
- 普通用户：只返回有权限的目录树

---

## 🧪 测试指南

### 测试 1：目录权限控制

```bash
# 1. 创建测试用户
php artisan tinker

$user = User::create([
    'name' => '测试用户',
    'email' => 'test@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$user->assignRole('member');

# 2. 创建测试目录
$dir1 = Directory::create(['name' => '目录1', 'path' => '/目录1']);
$dir2 = Directory::create(['name' => '目录2', 'path' => '/目录2']);

# 3. 授权用户访问目录1
$user->directories()->attach($dir1->id);

# 4. 测试权限
$user->canAccessDirectory($dir1->id); // true
$user->canAccessDirectory($dir2->id); // false

# 5. 设置目录2为公开
$dir2->is_public = true;
$dir2->save();

# 6. 再次测试
$user->canAccessDirectory($dir2->id); // true（因为是公开目录）
```

### 测试 2：用户管理界面

1. **测试编辑用户**
   - 登录管理员账号
   - 进入用户管理
   - 编辑一个用户
   - 确认姓名字段不可修改
   - 确认角色只有"首席会员"和"普通会员"
   - 选择可访问的目录
   - 保存

2. **测试目录可见性**
   - 登录被编辑的用户
   - 查看文件管理
   - 确认只能看到被授权的目录

### 测试 3：个人信息页面

1. 登录任意用户
2. 点击右上角用户菜单 → 个人信息
3. 确认显示：
   - 用户ID
   - 角色标签
   - 工作组标签
   - 账户状态
   - 注册时间
4. 修改姓名和邮箱
5. 保存并确认更新成功

---

## 💡 最佳实践

### 1. 目录权限设计

**推荐做法：**
- 为项目创建独立目录
- 将团队成员授权到对应项目目录
- 公共资料放在公开目录

**示例结构：**
```
/
├── 公告（公开）
├── 项目A
│   └── 授权：开发组成员
├── 项目B
│   └── 授权：测试组成员
└── 共享资料（公开）
```

### 2. 权限管理

**原则：**
- 最小权限原则：只授予必要的访问权限
- 定期审查：定期检查用户的目录权限
- 及时回收：用户离职或角色变更时及时回收权限

### 3. 公开目录使用

**适合设为公开的目录：**
- ✅ 公司公告
- ✅ 规章制度
- ✅ 共享资料
- ✅ 培训材料

**不适合设为公开的目录：**
- ❌ 项目文档
- ❌ 财务资料
- ❌ 人事档案
- ❌ 敏感信息

---

## 🚨 注意事项

### 1. 权限继承

目前权限不会自动继承到子目录，如果需要访问子目录，需要：
- 授权父目录
- 或单独授权子目录

### 2. 管理员权限

管理员始终可以访问所有目录，无法限制。如果需要限制管理员，需要：
- 降级为普通用户
- 然后授予特定目录权限

### 3. 数据迁移

如果系统已有用户和目录，需要：
1. 决定默认策略（全部授权 or 全部不授权）
2. 批量授权或逐个授权
3. 通知用户权限变更

### 4. 性能考虑

大量用户和目录时，权限检查可能影响性能，建议：
- 使用缓存
- 优化查询
- 考虑使用索引

---

## ✅ 功能清单

### 已实现

- ✅ 用户-目录权限关联表
- ✅ 目录公开访问标记
- ✅ 用户目录权限检查方法
- ✅ 目录列表权限过滤
- ✅ 用户管理界面目录权限选择
- ✅ 编辑用户时姓名禁用
- ✅ 角色选择限制（只显示首席会员和普通会员）
- ✅ 个人信息页面完善

### 待实现（可选）

- ⏳ 目录权限批量管理界面
- ⏳ 公开目录管理界面
- ⏳ 权限继承功能
- ⏳ 权限审计日志
- ⏳ 权限过期时间
- ⏳ 权限申请流程

---

## 📝 数据库迁移记录

```bash
# 运行迁移
php artisan migrate

# 迁移文件
2025_10_15_153832_create_user_directory_permissions_table.php
```

---

**功能完成日期**：2025-10-15  
**版本**：1.1.0  
**状态**：✅ 已完成
