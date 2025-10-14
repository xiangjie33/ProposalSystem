# 提案系统 - 项目概览

## 项目简介

这是一个完整的提案管理系统，采用前后端分离架构，实现了用户管理、目录文件管理和提案管理等核心功能。

## 核心功能

### 1. 用户管理
- ✅ 用户注册和登录
- ✅ 基于角色的权限控制（管理员/普通用户）
- ✅ JWT Token 认证（Laravel Sanctum）
- ✅ 用户信息管理

### 2. 目录管理
- ✅ 创建目录（支持多级目录）
- ✅ 修改目录名称
- ✅ 删除目录（级联删除子目录和文件）
- ✅ 树形结构展示
- ✅ 目录路径追踪

### 3. 文件管理
- ✅ 文件上传（支持拖拽）
- ✅ 文件下载
- ✅ 文件重命名
- ✅ 文件删除
- ✅ 文件信息展示（大小、类型、上传时间等）
- ✅ 按目录组织文件

### 4. 提案管理
- ✅ 创建提案
- ✅ 编辑提案信息
- ✅ 删除提案
- ✅ 提案状态管理（草稿/活动中/已过期/已关闭）
- ✅ 为提案分配权限
- ✅ 指定用户可在特定目录上传文件
- ✅ 设置权限有效期

## 技术架构

### 后端（Laravel）

**框架和库：**
- Laravel 10.x
- Laravel Sanctum - API 认证
- Spatie Laravel Permission - 角色权限管理
- MySQL - 数据库

**目录结构：**
```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php       # 认证控制器
│   ├── DirectoryController.php  # 目录管理
│   ├── FileController.php       # 文件管理
│   └── ProposalController.php   # 提案管理
└── Models/
    ├── User.php                 # 用户模型
    ├── Directory.php            # 目录模型
    ├── File.php                 # 文件模型
    ├── Proposal.php             # 提案模型
    └── ProposalPermission.php   # 提案权限模型
```

**API 设计：**
- RESTful API 设计
- 统一的响应格式
- 完善的错误处理
- 请求验证

### 前端（React）

**框架和库：**
- React 18
- Ant Design - UI 组件库
- Axios - HTTP 客户端
- React Router DOM - 路由管理

**组件结构：**
```
src/
├── components/
│   ├── Login.js           # 登录组件
│   ├── DirectoryTree.js   # 目录树组件
│   ├── FileList.js        # 文件列表组件
│   └── ProposalList.js    # 提案列表组件
├── services/
│   ├── api.js             # API 配置
│   ├── auth.js            # 认证服务
│   ├── directory.js       # 目录服务
│   ├── file.js            # 文件服务
│   └── proposal.js        # 提案服务
└── App.js                 # 主应用组件
```

## 数据库设计

### 表关系
```
users (用户表)
  ├── directories (目录表) - 一对多
  ├── files (文件表) - 一对多
  ├── proposals (提案表) - 一对多
  └── proposal_permissions (提案权限表) - 一对多

directories (目录表)
  ├── directories (子目录) - 自关联
  ├── files (文件表) - 一对多
  └── proposal_permissions (提案权限表) - 一对多

proposals (提案表)
  └── proposal_permissions (提案权限表) - 一对多
```

## 安全特性

1. **认证和授权**
   - Token 基础认证
   - 角色权限控制
   - API 路由保护

2. **数据验证**
   - 后端请求验证
   - 前端表单验证
   - 文件类型和大小限制

3. **数据保护**
   - 密码加密存储
   - SQL 注入防护（ORM）
   - XSS 防护

## 快速开始

### 1. 环境要求
- PHP >= 8.0
- Composer
- MySQL >= 5.7
- Node.js >= 14
- npm 或 yarn

### 2. 安装步骤

**后端：**
```bash
cd proposal-system-backend
composer install
cp .env.example .env
php artisan key:generate
# 配置 .env 数据库信息
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder
php artisan storage:link
php artisan serve
```

**前端：**
```bash
cd proposal-system-frontend
npm install
npm start
```

### 3. 使用 Windows 批处理脚本

- `setup-backend.bat` - 初始化后端
- `start-backend.bat` - 启动后端服务器
- `start-frontend.bat` - 启动前端服务器

## 功能演示流程

1. **注册/登录**
   - 访问 http://localhost:3000
   - 注册新用户或使用测试账户登录

2. **目录管理**
   - 创建根目录
   - 在目录下创建子目录
   - 重命名或删除目录

3. **文件管理**
   - 选择目录
   - 上传文件（支持拖拽）
   - 下载、重命名或删除文件

4. **提案管理**
   - 创建新提案
   - 设置提案信息和状态
   - 为提案添加权限（指定用户和目录）
   - 设置权限有效期

## 扩展建议

### 短期优化
- [ ] 添加文件预览功能
- [ ] 实现批量文件上传
- [ ] 添加文件搜索功能
- [ ] 实现用户管理界面
- [ ] 添加操作日志

### 长期规划
- [ ] 实现实时通知
- [ ] 添加文件版本控制
- [ ] 实现协作编辑
- [ ] 添加评论和审批流程
- [ ] 移动端适配
- [ ] 文件加密存储
- [ ] 集成第三方存储（OSS）

## 常见问题

### 1. 上传文件失败
- 检查 storage 目录权限
- 确认已运行 `php artisan storage:link`
- 检查 PHP 上传大小限制

### 2. 登录后无法访问
- 清除浏览器缓存
- 检查 Token 是否正确存储
- 验证后端 CORS 配置

### 3. 目录树不显示
- 检查 API 响应
- 确认数据库中有数据
- 查看浏览器控制台错误

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请通过 Issue 联系。
