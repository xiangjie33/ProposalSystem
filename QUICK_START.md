# 快速启动指南

## 第一次运行

### 步骤 1：配置数据库

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE proposal_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 编辑 `proposal-system-backend/.env` 文件：
```env
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=你的密码
```

### 步骤 2：初始化后端

在项目根目录双击运行：
```
setup-backend.bat
```

或手动执行：
```bash
cd proposal-system-backend
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder
php artisan storage:link
```

### 步骤 3：启动服务

**启动后端（端口 8000）：**
双击 `start-backend.bat` 或执行：
```bash
cd proposal-system-backend
php artisan serve
```

**启动前端（端口 3000）：**
双击 `start-frontend.bat` 或执行：
```bash
cd proposal-system-frontend
npm start
```

### 步骤 4：访问系统

打开浏览器访问：http://localhost:3000

## 创建第一个账户

1. 在登录页面，先注册一个新账户
2. 填写姓名、邮箱和密码
3. 注册成功后自动跳转到登录页面
4. 使用刚注册的账户登录

## 基本操作流程

### 1. 创建目录结构
- 点击"新建根目录"按钮
- 输入目录名称，如"项目文档"
- 点击目录旁的 + 按钮创建子目录

### 2. 上传文件
- 在左侧选择一个目录
- 右侧会显示该目录的文件列表
- 点击"上传文件"按钮选择文件
- 或直接拖拽文件到上传区域

### 3. 管理文件
- 点击下载图标下载文件
- 点击编辑图标重命名文件
- 点击删除图标删除文件

### 4. 创建提案
- 切换到"提案管理"标签
- 点击"新建提案"按钮
- 填写提案标题和描述
- 选择提案状态
- 保存提案

## 常用命令

### 后端命令

```bash
# 清除缓存
php artisan cache:clear
php artisan config:clear

# 重置数据库
php artisan migrate:fresh --seed

# 查看路由
php artisan route:list

# 创建新的控制器
php artisan make:controller ControllerName

# 创建新的模型和迁移
php artisan make:model ModelName -m
```

### 前端命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 默认端口

- 后端 API：http://localhost:8000
- 前端应用：http://localhost:3000

## 测试 API

可以使用 Postman 或 curl 测试 API：

### 注册用户
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### 登录
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 获取目录树（需要 Token）
```bash
curl -X GET http://localhost:8000/api/directories/tree \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 故障排除

### 问题：后端启动失败
**解决方案：**
- 检查 PHP 版本：`php -v`（需要 >= 8.0）
- 检查 Composer 是否安装：`composer -v`
- 运行 `composer install`

### 问题：前端启动失败
**解决方案：**
- 检查 Node.js 版本：`node -v`（需要 >= 14）
- 删除 node_modules 文件夹
- 重新运行 `npm install`

### 问题：数据库连接失败
**解决方案：**
- 确认 MySQL 服务正在运行
- 检查 .env 文件中的数据库配置
- 确认数据库已创建
- 测试数据库连接：`php artisan tinker` 然后 `DB::connection()->getPdo();`

### 问题：文件上传失败
**解决方案：**
- 运行 `php artisan storage:link`
- 检查 storage 目录权限
- 确认 PHP 上传大小限制（php.ini 中的 upload_max_filesize）
- 查看详细配置：参考 `FILE_UPLOAD_CONFIG.md`

**当前上传限制：100MB**
如需修改，请参考 `FILE_UPLOAD_CONFIG.md` 文档

### 问题：CORS 错误
**解决方案：**
- 确认后端 config/cors.php 配置正确
- 清除配置缓存：`php artisan config:clear`
- 重启后端服务器

## 开发提示

1. **修改后端代码后**：无需重启服务器，Laravel 会自动重载

2. **修改前端代码后**：React 会自动热重载

3. **修改 .env 文件后**：需要运行 `php artisan config:clear`

4. **修改数据库结构后**：需要运行新的迁移或重置数据库

5. **查看日志**：
   - 后端日志：`proposal-system-backend/storage/logs/laravel.log`
   - 前端日志：浏览器控制台

## 下一步

- 阅读 `PROJECT_OVERVIEW.md` 了解项目架构
- 阅读 `DATABASE_SETUP.md` 了解数据库设计
- 查看 `README.md` 获取完整文档

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 查看后端日志文件
3. 确认所有服务都在运行
4. 参考故障排除部分

祝你使用愉快！🚀
