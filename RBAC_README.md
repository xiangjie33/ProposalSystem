# 提案管理系统 - RBAC 权限系统

<div align="center">

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Laravel](https://img.shields.io/badge/Laravel-10.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)

**一个完整的基于角色的访问控制（RBAC）系统**

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [文档](#-文档) • [截图](#-系统截图)

</div>

---

## 📖 简介

这是一个为提案管理系统开发的完整 RBAC（基于角色的访问控制）权限系统。系统实现了4级角色体系、17个细粒度权限、灵活的工作组管理，以及完整的前后端集成。

### 核心特性

- ✅ **4级角色体系**：超级管理员、管理员、首席会员、普通会员
- ✅ **17个细粒度权限**：覆盖用户、工作组、文件、目录、提案管理
- ✅ **工作组管理**：支持多工作组、动态成员管理
- ✅ **完整的前后端集成**：Laravel + React + Ant Design
- ✅ **安全的权限控制**：中间件、策略、前端守卫多重保护
- ✅ **用户友好界面**：基于 Ant Design 的现代化 UI

---

## 🚀 快速开始

### 前提条件

- PHP >= 8.1
- Composer
- Node.js >= 16
- MySQL >= 5.7

### 安装步骤

#### 1. 后端设置
```bash
cd proposal-system-backend
composer install
cp .env.example .env
php artisan key:generate
# 配置 .env 中的数据库连接
php artisan migrate
php artisan db:seed --class=RBACSeeder
php artisan db:seed --class=GroupSeeder
php artisan serve
```

#### 2. 前端设置
```bash
cd proposal-system-frontend
npm install
npm start
```

#### 3. 创建测试用户
```bash
php artisan tinker
```
```php
$user = \App\Models\User::create([
    'name' => '管理员',
    'email' => 'admin@test.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);
$user->assignRole('super_admin');
```

#### 4. 登录系统
- 访问：http://localhost:3000
- 邮箱：admin@test.com
- 密码：password123

📚 **详细安装指南**：查看 [快速启动指南](QUICK_START.md)

---

## ✨ 功能特性

### 角色体系

| 角色 | 权限数 | 主要功能 |
|------|--------|---------|
| 🔴 超级管理员 | 17 | 系统最高权限，可管理所有用户和资源 |
| 🟠 管理员 | 15 | 可管理普通用户和资源，不能管理其他管理员 |
| 🔵 首席会员 | 5 | 可查看和下载文件 |
| ⚪ 普通会员 | 4 | 仅可查看文件和目录 |

### 权限列表

#### 👥 用户管理
- `manage-all-users` - 管理所有用户
- `manage-users` - 管理普通用户
- `view-users` - 查看用户列表

#### 👨‍👩‍👧‍👦 工作组管理
- `manage-groups` - 管理工作组
- `view-groups` - 查看工作组

#### 📁 目录管理
- `create-directory` - 创建目录
- `update-directory` - 修改目录
- `delete-directory` - 删除目录
- `view-directory` - 查看目录

#### 📄 文件管理
- `upload-file` - 上传文件
- `download-file` - 下载文件
- `update-file` - 修改文件
- `delete-file` - 删除文件
- `view-file` - 查看文件

#### 📋 提案管理
- `manage-proposals` - 管理提案
- `view-proposals` - 查看提案

### 工作组系统

- **用户组（default_group）** - 默认工作组，所有用户自动加入
- **开发组（dev_group）** - 开发人员工作组
- **测试组（test_group）** - 测试人员工作组
- **评审组（review_group）** - 评审人员工作组

支持：
- ✅ 用户多工作组归属
- ✅ 动态添加/移除成员
- ✅ 自定义工作组创建
- ✅ 默认工作组保护

---

## 🏗️ 技术架构

### 后端技术栈
- **框架**：Laravel 10.x
- **权限包**：Spatie Laravel Permission
- **认证**：Laravel Sanctum
- **数据库**：MySQL

### 前端技术栈
- **框架**：React 18.x
- **UI 库**：Ant Design
- **状态管理**：React Hooks
- **HTTP 客户端**：Axios

### 核心依赖
```json
{
  "后端": {
    "laravel/framework": "^10.0",
    "spatie/laravel-permission": "^5.0",
    "laravel/sanctum": "^3.0"
  },
  "前端": {
    "react": "^18.0",
    "antd": "^5.0",
    "axios": "^1.0"
  }
}
```

---

## 📚 文档

### 主要文档
- 📖 [快速启动指南](QUICK_START.md) - 5分钟快速上手
- 📋 [系统总结](RBAC_SYSTEM_SUMMARY.md) - 完整的技术文档
- 🧪 [测试指南](RBAC_TESTING_GUIDE.md) - 详细的测试场景
- 📊 [实施进度](RBAC_IMPLEMENTATION_PROGRESS.md) - 开发进度追踪

### 规格文档
- 📝 [需求文档](.kiro/specs/rbac-system/requirements.md)
- 🎨 [设计文档](.kiro/specs/rbac-system/design.md)
- ✅ [任务列表](.kiro/specs/rbac-system/tasks.md)

---

## 🎯 使用示例

### 后端权限检查

```php
// 在控制器中检查权限
if (auth()->user()->can('upload-file')) {
    // 允许上传
}

// 使用中间件
Route::middleware(['auth:sanctum', 'permission:manage-users'])
    ->get('/users', [UserController::class, 'index']);

// 使用策略
$this->authorize('update', $group);
```

### 前端权限控制

```javascript
import { usePermission } from '../hooks/usePermission';

function FileManager() {
  const { hasPermission, hasRole, isAdmin } = usePermission();
  
  return (
    <>
      {hasPermission('upload-file') && (
        <Button>上传文件</Button>
      )}
      
      {isAdmin && (
        <Link to="/admin">管理面板</Link>
      )}
    </>
  );
}
```

---

## 🔌 API 端点

### 认证
```
POST   /api/login              # 登录
POST   /api/logout             # 登出
GET    /api/me                 # 获取当前用户
```

### 用户管理
```
GET    /api/users              # 获取用户列表
POST   /api/users              # 创建用户
PUT    /api/users/{id}         # 更新用户
DELETE /api/users/{id}         # 删除用户
```

### 工作组管理
```
GET    /api/groups                    # 获取工作组列表
POST   /api/groups                    # 创建工作组
PUT    /api/groups/{id}               # 更新工作组
DELETE /api/groups/{id}               # 删除工作组
POST   /api/groups/{id}/users/{uid}  # 添加成员
DELETE /api/groups/{id}/users/{uid}  # 移除成员
```

### 文件和目录
```
GET    /api/directories        # 获取目录列表
POST   /api/directories        # 创建目录
GET    /api/files              # 获取文件列表
POST   /api/files              # 上传文件
GET    /api/files/{id}/download # 下载文件
```

📖 **完整 API 文档**：查看 [系统总结](RBAC_SYSTEM_SUMMARY.md#-api-端点)

---

## 🎨 系统截图

### 管理员视图
- 完整的用户管理界面
- 工作组管理和成员分配
- 所有文件和目录操作权限

### 普通用户视图
- 简洁的文件浏览界面
- 根据权限显示操作按钮
- 清晰的权限提示

---

## 🧪 测试

### 运行测试
```bash
# 后端测试
cd proposal-system-backend
php artisan test

# 前端测试
cd proposal-system-frontend
npm test
```

### 手动测试
参考 [测试指南](RBAC_TESTING_GUIDE.md) 进行完整的功能测试。

---

## 📊 权限矩阵

| 功能 | 超级管理员 | 管理员 | 首席会员 | 普通会员 |
|------|-----------|--------|---------|---------|
| 管理所有用户 | ✅ | ❌ | ❌ | ❌ |
| 管理普通用户 | ✅ | ✅ | ❌ | ❌ |
| 管理工作组 | ✅ | ✅ | ❌ | ❌ |
| 创建/编辑/删除目录 | ✅ | ✅ | ❌ | ❌ |
| 上传/编辑/删除文件 | ✅ | ✅ | ❌ | ❌ |
| 下载文件 | ✅ | ✅ | ✅ | ❌ |
| 查看文件和目录 | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 配置

### 环境变量
```env
# 数据库配置
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=

# 应用配置
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Sanctum 配置
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### CORS 配置
编辑 `config/cors.php`：
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000'],
```

---

## 🐛 故障排除

### 常见问题

**权限不生效？**
```bash
php artisan cache:clear
php artisan config:clear
php artisan permission:cache-reset
```

**前端无法连接后端？**
- 检查 CORS 配置
- 确认后端服务运行中
- 检查 API baseURL 配置

**登录后看不到权限？**
- 退出登录重新登录
- 清除浏览器 localStorage
- 检查用户是否已分配角色

📖 **更多问题**：查看 [快速启动指南](QUICK_START.md#-常见问题)

---

## 🚀 部署

### 生产环境部署

1. **后端部署**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. **前端部署**
```bash
npm run build
# 将 build 目录部署到 Web 服务器
```

3. **环境配置**
- 设置 `APP_ENV=production`
- 配置 HTTPS
- 设置强密码策略
- 配置数据库备份

---

## 📈 性能优化

- ✅ 权限自动缓存
- ✅ 数据库查询优化
- ✅ 前端懒加载
- ✅ API 响应压缩
- ✅ 静态资源 CDN

---

## 🔒 安全特性

- ✅ 基于 Token 的认证（Sanctum）
- ✅ 密码加密存储（bcrypt）
- ✅ CSRF 保护
- ✅ XSS 防护
- ✅ SQL 注入防护
- ✅ 权限多层验证

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues]
- 📖 文档: [项目文档]

---

## 🙏 致谢

感谢以下开源项目：

- [Laravel](https://laravel.com/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)

---

## 📅 更新日志

### v1.0.0 (2025-10-15)
- ✅ 初始版本发布
- ✅ 实现4级角色体系
- ✅ 实现17个细粒度权限
- ✅ 实现工作组管理
- ✅ 完成前后端集成
- ✅ 完善文档和测试

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by Your Team

</div>
