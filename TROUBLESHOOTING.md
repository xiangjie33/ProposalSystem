# 故障排除指南

## 已修复的问题

### ✅ JSX 标签未正确关闭

**问题：** ConfigProvider 和 Layout 标签未正确关闭

**修复：**
- 正确关闭所有 JSX 标签
- 确保 ConfigProvider 包裹整个应用
- 移除未使用的 React 导入

## 常见问题

### 1. 页面空白或报错

**可能原因：**
- 国际化文件未正确导入
- 组件导入路径错误
- localStorage 数据异常

**解决方案：**
```bash
# 清除浏览器缓存和 localStorage
# 在浏览器控制台执行：
localStorage.clear();
location.reload();
```

### 2. 语言切换不生效

**解决方案：**
```javascript
// 检查 localStorage
console.log(localStorage.getItem('locale'));

// 手动设置
localStorage.setItem('locale', 'zh-CN');
location.reload();
```

### 3. 用户信息不显示

**解决方案：**
```javascript
// 检查用户数据
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('token'));

// 如果数据异常，重新登录
localStorage.clear();
location.reload();
```

### 4. 修改密码失败

**检查项：**
1. 后端路由是否正确配置
2. Token 是否有效
3. 当前密码是否正确

**后端检查：**
```bash
# 查看路由
php artisan route:list | grep password

# 清除缓存
php artisan config:clear
php artisan route:clear
```

### 5. 国际化文本显示为 key

**问题：** 显示 `menu.fileManagement` 而不是 `文件管理`

**解决方案：**
1. 检查语言文件是否正确导入
2. 检查 key 是否存在于语言文件中
3. 清除缓存重新加载

```bash
# 前端
rm -rf node_modules/.cache
npm start
```

### 6. Ant Design 组件样式异常

**解决方案：**
```bash
# 重新安装依赖
rm -rf node_modules
npm install
```

### 7. 构建错误

**解决方案：**
```bash
# 清除构建缓存
rm -rf build
rm -rf node_modules/.cache

# 重新构建
npm run build
```

## 开发环境问题

### 热重载不工作

**解决方案：**
```bash
# 停止开发服务器
Ctrl + C

# 清除缓存
rm -rf node_modules/.cache

# 重新启动
npm start
```

### 端口被占用

**解决方案：**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 后端问题

### 1. CORS 错误

**解决方案：**
```bash
# 清除配置缓存
php artisan config:clear

# 检查 config/cors.php
# 确保 supports_credentials 为 true
```

### 2. Token 验证失败

**解决方案：**
```bash
# 清除缓存
php artisan config:clear
php artisan cache:clear

# 检查 .env 中的 APP_KEY
php artisan key:generate
```

### 3. 数据库连接失败

**解决方案：**
```bash
# 检查 .env 配置
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proposal_system
DB_USERNAME=root
DB_PASSWORD=your_password

# 测试连接
php artisan tinker
DB::connection()->getPdo();
```

## 调试技巧

### 前端调试

**1. 使用 React DevTools**
- 安装 React Developer Tools 浏览器扩展
- 查看组件状态和 props

**2. 查看网络请求**
```javascript
// 在 src/services/api.js 中添加日志
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Error:', error.response);
    return Promise.reject(error);
  }
);
```

**3. 检查状态**
```javascript
// 在组件中添加
useEffect(() => {
  console.log('State:', { isLoggedIn, currentUser, locale });
}, [isLoggedIn, currentUser, locale]);
```

### 后端调试

**1. 查看日志**
```bash
# 实时查看日志
tail -f storage/logs/laravel.log
```

**2. 添加调试信息**
```php
// 在控制器中
\Log::info('Debug info', ['data' => $data]);
```

**3. 使用 Tinker**
```bash
php artisan tinker

# 测试代码
$user = User::find(1);
$user->name;
```

## 性能优化

### 前端优化

**1. 代码分割**
```javascript
// 使用 React.lazy
const ProposalList = lazy(() => import('./components/ProposalList'));
```

**2. 缓存优化**
```javascript
// 使用 useMemo 和 useCallback
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 后端优化

**1. 查询优化**
```php
// 使用 eager loading
$files = File::with(['directory', 'uploader'])->get();
```

**2. 缓存配置**
```bash
# 缓存配置
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 检查清单

### 部署前检查

- [ ] 所有依赖已安装
- [ ] 环境变量已配置
- [ ] 数据库已迁移
- [ ] 文件权限正确
- [ ] CORS 配置正确
- [ ] API 路由正常
- [ ] 前端构建成功
- [ ] 所有功能测试通过

### 功能测试清单

- [ ] 用户注册
- [ ] 用户登录
- [ ] 用户退出
- [ ] 修改密码
- [ ] 语言切换
- [ ] 创建目录
- [ ] 上传文件
- [ ] 下载文件
- [ ] 删除文件
- [ ] 创建提案

## 获取帮助

### 查看日志

**前端：**
- 浏览器控制台（F12）
- Network 标签查看请求

**后端：**
- `storage/logs/laravel.log`
- Web 服务器日志

### 常用命令

```bash
# 前端
npm start          # 启动开发服务器
npm run build      # 构建生产版本
npm test           # 运行测试

# 后端
php artisan serve  # 启动开发服务器
php artisan migrate # 运行迁移
php artisan tinker  # 进入交互式 shell
```

## 联系支持

如果问题仍未解决：

1. 查看项目文档
2. 检查 GitHub Issues
3. 查看错误日志
4. 提供详细的错误信息

---

**最后更新：** 2025-10-14
