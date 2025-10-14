# 提案系统

一个基于 Laravel + React 的提案管理系统，支持用户管理、目录文件管理和提案管理。

## 功能特性

- **用户管理**：角色权限管理（管理员/普通用户）
- **目录管理**：创建、修改、删除、重命名目录，支持树形结构
- **文件管理**：上传、修改、删除、重命名文件，支持拖拽上传
- **提案管理**：创建提案，指定用户在特定目录上传文件，设置有效期

## 技术栈

### 后端
- Laravel 10
- Laravel Sanctum (API 认证)
- Spatie Laravel Permission (角色权限)
- MySQL

### 前端
- React 18
- Ant Design (UI 组件库)
- Axios (HTTP 客户端)
- React Router DOM

## 安装步骤

### 1. 后端设置

```bash
cd proposal-system-backend

# 配置数据库
# 编辑 .env 文件，设置数据库连接信息
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=your_password

# 运行迁移
php artisan migrate

# 运行 Seeder（创建角色和权限）
php artisan db:seed --class=RolePermissionSeeder

# 创建存储链接
php artisan storage:link

# 启动开发服务器
php artisan serve
```

### 2. 前端设置

```bash
cd proposal-system-frontend

# 启动开发服务器
npm start
```

前端将在 http://localhost:3000 运行
后端 API 在 http://localhost:8000 运行

## 默认账户

首次使用需要通过注册页面创建账户。注册后的用户默认为普通用户角色。

## API 端点

### 认证
- POST /api/register - 注册
- POST /api/login - 登录
- POST /api/logout - 退出
- GET /api/me - 获取当前用户信息

### 目录管理
- GET /api/directories/tree - 获取目录树
- GET /api/directories - 获取目录列表
- POST /api/directories - 创建目录
- PUT /api/directories/{id} - 更新目录
- DELETE /api/directories/{id} - 删除目录

### 文件管理
- GET /api/files - 获取文件列表
- POST /api/files - 上传文件
- PUT /api/files/{id} - 更新文件信息
- DELETE /api/files/{id} - 删除文件
- GET /api/files/{id}/download - 下载文件

### 提案管理
- GET /api/proposals - 获取提案列表
- POST /api/proposals - 创建提案
- GET /api/proposals/{id} - 获取提案详情
- PUT /api/proposals/{id} - 更新提案
- DELETE /api/proposals/{id} - 删除提案
- POST /api/proposals/{id}/permissions - 添加提案权限

## 项目结构

```
proposal-system-backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── DirectoryController.php
│   │   ├── FileController.php
│   │   └── ProposalController.php
│   └── Models/
│       ├── User.php
│       ├── Directory.php
│       ├── File.php
│       ├── Proposal.php
│       └── ProposalPermission.php
├── database/migrations/
└── routes/api.php

proposal-system-frontend/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── DirectoryTree.js
│   │   ├── FileList.js
│   │   └── ProposalList.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── directory.js
│   │   ├── file.js
│   │   └── proposal.js
│   └── App.js
└── package.json
```

## 注意事项

1. 确保 PHP 版本 >= 8.0
2. 确保 Node.js 版本 >= 14
3. 确保 MySQL 数据库已创建
4. 上传文件大小限制为 10MB，可在后端配置中修改
5. 文件存储在 storage/app/public/uploads 目录

## 开发建议

- 使用 Postman 或类似工具测试 API
- 前端开发时可以使用 React DevTools
- 后端日志位于 storage/logs/laravel.log
