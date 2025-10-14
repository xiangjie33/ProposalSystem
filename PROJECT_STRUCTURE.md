# 项目结构说明

## 根目录文件

```
ProposalSystem/
├── proposal-system-backend/     # Laravel 后端项目
├── proposal-system-frontend/    # React 前端项目
├── .gitignore                   # Git 忽略文件配置
├── README.md                    # 项目主文档
├── PROJECT_OVERVIEW.md          # 项目概览
├── PROJECT_STRUCTURE.md         # 项目结构说明（本文件）
├── QUICK_START.md              # 快速启动指南
├── DATABASE_SETUP.md           # 数据库设置指南
├── setup-backend.bat           # 后端初始化脚本
├── start-backend.bat           # 启动后端脚本
└── start-frontend.bat          # 启动前端脚本
```

## 后端项目结构

```
proposal-system-backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php          # 认证控制器
│   │           ├── DirectoryController.php     # 目录管理控制器
│   │           ├── FileController.php          # 文件管理控制器
│   │           └── ProposalController.php      # 提案管理控制器
│   └── Models/
│       ├── User.php                            # 用户模型
│       ├── Directory.php                       # 目录模型
│       ├── File.php                            # 文件模型
│       ├── Proposal.php                        # 提案模型
│       └── ProposalPermission.php              # 提案权限模型
├── config/
│   ├── cors.php                                # CORS 配置
│   ├── permission.php                          # 权限配置
│   └── ...                                     # 其他配置文件
├── database/
│   ├── migrations/
│   │   ├── 2014_10_12_000000_create_users_table.php
│   │   ├── 2025_10_14_145005_create_directories_table.php
│   │   ├── 2025_10_14_145007_create_files_table.php
│   │   ├── 2025_10_14_145008_create_proposals_table.php
│   │   ├── 2025_10_14_145009_create_proposal_permissions_table.php
│   │   └── 2025_10_14_145104_create_permission_tables.php
│   └── seeders/
│       └── RolePermissionSeeder.php            # 角色权限初始化
├── routes/
│   └── api.php                                 # API 路由定义
├── storage/
│   ├── app/
│   │   └── public/
│   │       └── uploads/                        # 文件上传目录
│   └── logs/
│       └── laravel.log                         # 应用日志
├── .env                                        # 环境配置文件
├── composer.json                               # PHP 依赖配置
└── artisan                                     # Laravel 命令行工具
```

## 前端项目结构

```
proposal-system-frontend/
├── public/
│   ├── index.html                              # HTML 模板
│   └── ...
├── src/
│   ├── components/                             # React 组件
│   │   ├── Login.js                            # 登录组件
│   │   ├── DirectoryTree.js                    # 目录树组件
│   │   ├── FileList.js                         # 文件列表组件
│   │   └── ProposalList.js                     # 提案列表组件
│   ├── services/                               # API 服务
│   │   ├── api.js                              # Axios 配置
│   │   ├── auth.js                             # 认证服务
│   │   ├── directory.js                        # 目录服务
│   │   ├── file.js                             # 文件服务
│   │   └── proposal.js                         # 提案服务
│   ├── App.js                                  # 主应用组件
│   ├── App.css                                 # 应用样式
│   ├── index.js                                # 应用入口
│   └── index.css                               # 全局样式
├── package.json                                # npm 依赖配置
└── README.md                                   # React 项目说明
```

## 核心文件说明

### 后端核心文件

#### 控制器（Controllers）

**AuthController.php**
- 用户注册、登录、登出
- 获取当前用户信息
- Token 管理

**DirectoryController.php**
- 目录的增删改查
- 获取目录树结构
- 目录层级管理

**FileController.php**
- 文件上传、下载
- 文件信息管理
- 文件删除

**ProposalController.php**
- 提案的增删改查
- 提案权限管理
- 提案状态管理

#### 模型（Models）

**User.php**
- 用户基本信息
- 角色关联
- 认证相关

**Directory.php**
- 目录信息
- 父子关系
- 文件关联

**File.php**
- 文件信息
- 目录关联
- 上传者信息

**Proposal.php**
- 提案信息
- 创建者关联
- 权限关联

**ProposalPermission.php**
- 权限信息
- 用户、目录、提案关联
- 有效期管理

#### 路由（Routes）

**api.php**
- 定义所有 API 端点
- 中间件配置
- 路由分组

### 前端核心文件

#### 组件（Components）

**Login.js**
- 登录表单
- 用户认证
- Token 存储

**DirectoryTree.js**
- 树形目录展示
- 目录操作（增删改）
- 目录选择

**FileList.js**
- 文件列表展示
- 文件上传（支持拖拽）
- 文件操作（下载、重命名、删除）

**ProposalList.js**
- 提案列表展示
- 提案操作（增删改）
- 提案状态管理

#### 服务（Services）

**api.js**
- Axios 实例配置
- 请求拦截器（添加 Token）
- 响应拦截器（错误处理）

**auth.js**
- 登录/注册 API 调用
- Token 管理
- 用户信息存储

**directory.js**
- 目录相关 API 调用
- 目录树获取
- 目录操作

**file.js**
- 文件相关 API 调用
- 文件上传/下载
- 文件操作

**proposal.js**
- 提案相关 API 调用
- 提案管理
- 权限管理

## 数据流向

### 用户登录流程
```
Login.js (前端)
  → auth.js (服务)
    → api.js (Axios)
      → AuthController.php (后端)
        → User Model
          → 数据库
```

### 文件上传流程
```
FileList.js (前端)
  → file.js (服务)
    → api.js (Axios)
      → FileController.php (后端)
        → File Model
          → 存储文件到 storage/app/public/uploads
          → 保存记录到数据库
```

### 目录树加载流程
```
DirectoryTree.js (前端)
  → directory.js (服务)
    → api.js (Axios)
      → DirectoryController.php (后端)
        → Directory Model
          → 递归查询数据库
          → 返回树形结构
```

## 配置文件

### 后端配置

**.env**
- 数据库连接信息
- 应用密钥
- 调试模式
- 其他环境变量

**config/cors.php**
- 跨域资源共享配置
- 允许的源、方法、头部

**config/permission.php**
- 角色权限配置
- 表名、模型配置

### 前端配置

**package.json**
- 项目依赖
- 脚本命令
- 项目元信息

**src/services/api.js**
- API 基础 URL
- 请求/响应拦截器
- 默认配置

## 扩展指南

### 添加新的 API 端点

1. **创建控制器方法**（后端）
```bash
php artisan make:controller Api/NewController
```

2. **定义路由**（routes/api.php）
```php
Route::apiResource('new-resource', NewController::class);
```

3. **创建服务**（前端）
```javascript
// src/services/newService.js
export const newService = {
  getAll: async () => {
    const response = await api.get('/new-resource');
    return response.data;
  },
};
```

4. **创建组件**（前端）
```javascript
// src/components/NewComponent.js
import { newService } from '../services/newService';
```

### 添加新的数据表

1. **创建迁移**
```bash
php artisan make:migration create_table_name
```

2. **创建模型**
```bash
php artisan make:model ModelName
```

3. **运行迁移**
```bash
php artisan migrate
```

## 部署结构

### 开发环境
- 后端：http://localhost:8000
- 前端：http://localhost:3000

### 生产环境建议
```
服务器/
├── backend/                    # Laravel 后端
│   ├── public/                 # Web 根目录
│   └── ...
├── frontend/                   # React 构建文件
│   └── build/                  # npm run build 生成
└── nginx/                      # Web 服务器配置
    └── sites-available/
        └── proposal-system.conf
```

## 维护建议

1. **定期备份**
   - 数据库
   - 上传的文件（storage/app/public/uploads）

2. **日志管理**
   - 定期清理 storage/logs
   - 监控错误日志

3. **依赖更新**
   - 定期更新 Composer 依赖
   - 定期更新 npm 依赖

4. **安全检查**
   - 定期更新框架版本
   - 检查安全漏洞
   - 审查权限配置
