# 文件上传配置说明

## 当前配置

文件上传大小限制已设置为 **100MB**

## 配置位置

### 1. Laravel 控制器验证（已配置）
**文件：** `proposal-system-backend/app/Http/Controllers/Api/FileController.php`
```php
'file' => 'required|file|max:102400', // 100MB (单位：KB)
```

### 2. PHP 配置（需要配置）

#### 方法一：修改 php.ini（推荐）

找到你的 `php.ini` 文件，修改以下配置：

```ini
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
```

**查找 php.ini 位置：**
```bash
php --ini
```

**修改后重启服务：**
```bash
# Windows
# 重启 Apache 或 Nginx

# Linux/Mac
sudo service apache2 restart
# 或
sudo service nginx restart
sudo service php-fpm restart
```

#### 方法二：使用 .user.ini（已创建）

已在 `proposal-system-backend/.user.ini` 创建配置文件。

**注意：** `.user.ini` 需要 PHP 运行在 CGI/FastCGI 模式下才生效。

#### 方法三：使用 .htaccess（Apache）

在 `proposal-system-backend/public/.htaccess` 中添加：

```apache
php_value upload_max_filesize 100M
php_value post_max_size 100M
php_value max_execution_time 300
php_value max_input_time 300
php_value memory_limit 256M
```

### 3. Web 服务器配置

#### Nginx 配置

编辑 Nginx 配置文件（通常在 `/etc/nginx/nginx.conf` 或站点配置文件）：

```nginx
http {
    client_max_body_size 100M;
}
```

或在 server 块中：

```nginx
server {
    client_max_body_size 100M;
}
```

**重启 Nginx：**
```bash
sudo nginx -t  # 测试配置
sudo service nginx restart
```

#### Apache 配置

编辑 Apache 配置文件或 `.htaccess`：

```apache
LimitRequestBody 104857600  # 100MB in bytes
```

**重启 Apache：**
```bash
sudo service apache2 restart
```

## 验证配置

### 1. 检查 PHP 配置

创建一个 PHP 文件查看配置：

```php
<?php
phpinfo();
```

查找以下配置项：
- `upload_max_filesize`
- `post_max_size`
- `max_execution_time`
- `memory_limit`

### 2. 使用命令行检查

```bash
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

### 3. 测试上传

在前端尝试上传一个大文件（如 50MB），查看是否成功。

## 配置说明

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `upload_max_filesize` | 单个文件最大上传大小 | 100M |
| `post_max_size` | POST 数据最大大小（应 >= upload_max_filesize） | 100M |
| `max_execution_time` | 脚本最大执行时间（秒） | 300 |
| `max_input_time` | 输入数据最大时间（秒） | 300 |
| `memory_limit` | PHP 内存限制 | 256M |
| `client_max_body_size` | Nginx 请求体最大大小 | 100M |

## 修改上传限制

如果需要修改上传大小限制，需要同时修改以下位置：

### 增加到 200MB

**1. Laravel 控制器：**
```php
'file' => 'required|file|max:204800', // 200MB
```

**2. PHP 配置：**
```ini
upload_max_filesize = 200M
post_max_size = 200M
```

**3. Nginx 配置：**
```nginx
client_max_body_size 200M;
```

### 减少到 50MB

**1. Laravel 控制器：**
```php
'file' => 'required|file|max:51200', // 50MB
```

**2. PHP 配置：**
```ini
upload_max_filesize = 50M
post_max_size = 50M
```

**3. Nginx 配置：**
```nginx
client_max_body_size 50M;
```

## 前端配置

前端目前没有文件大小限制。如果需要添加前端验证：

**文件：** `proposal-system-frontend/src/components/FileList.js`

```javascript
const 
handleUpload = async (file) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (file.size > maxSize) {
    message.error('文件大小不能超过 100MB');
    return false;
  }
  
  try {
    await fileService.upload(file, directoryId);
    message.success('上传成功');
    loadFiles();
  } catch (error) {
    message.error('上传失败');
  }
  return false;
};
```

## 常见问题

### 1. 上传大文件时超时

**解决方案：** 增加 `max_execution_time` 和 `max_input_time`

```ini
max_execution_time = 600
max_input_time = 600
```

### 2. 上传失败，显示 413 错误

**原因：** Nginx 的 `client_max_body_size` 限制

**解决方案：** 修改 Nginx 配置并重启

### 3. 上传失败，显示 500 错误

**原因：** PHP 内存不足

**解决方案：** 增加 `memory_limit`

```ini
memory_limit = 512M
```

### 4. 配置修改后不生效

**解决方案：**
1. 清除 Laravel 配置缓存：`php artisan config:clear`
2. 重启 Web 服务器
3. 重启 PHP-FPM（如果使用）

## 安全建议

1. **限制文件类型**
   - 在控制器中添加 MIME 类型验证
   - 禁止上传可执行文件

2. **病毒扫描**
   - 对上传的文件进行病毒扫描
   - 使用 ClamAV 等工具

3. **存储位置**
   - 文件存储在 `storage/app/public/uploads`
   - 不要存储在 Web 根目录

4. **文件名处理**
   - 已使用时间戳重命名文件
   - 避免文件名冲突和安全问题

## 监控和日志

查看上传错误日志：

```bash
# Laravel 日志
tail -f storage/logs/laravel.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# PHP 错误日志
tail -f /var/log/php-fpm/error.log
```

## 性能优化

对于大文件上传，建议：

1. **使用分块上传**
   - 将大文件分成多个小块上传
   - 提高上传成功率

2. **使用队列处理**
   - 文件上传后放入队列处理
   - 避免阻塞用户请求

3. **使用对象存储**
   - 使用阿里云 OSS、腾讯云 COS 等
   - 减轻服务器压力

## 快速配置脚本

### Windows (PowerShell)

```powershell
# 查找 php.ini
php --ini

# 编辑 php.ini 后重启服务
# 需要手动重启 Apache/Nginx
```

### Linux/Mac (Bash)

```bash
#!/bin/bash

# 查找 php.ini
PHP_INI=$(php --ini | grep "Loaded Configuration File" | cut -d: -f2 | xargs)

echo "PHP 配置文件: $PHP_INI"

# 备份原配置
sudo cp $PHP_INI $PHP_INI.backup

# 修改配置（需要 root 权限）
sudo sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' $PHP_INI
sudo sed -i 's/post_max_size = .*/post_max_size = 100M/' $PHP_INI
sudo sed -i 's/max_execution_time = .*/max_execution_time = 300/' $PHP_INI
sudo sed -i 's/memory_limit = .*/memory_limit = 256M/' $PHP_INI

# 重启服务
sudo service php-fpm restart
sudo service nginx restart

echo "配置完成！"
```

## 总结

当前配置支持上传最大 **100MB** 的文件。如需修改：

1. ✅ 已修改 Laravel 控制器验证（100MB）
2. ⚠️ 需要修改 PHP 配置（php.ini）
3. ⚠️ 需要修改 Web 服务器配置（Nginx/Apache）

修改后记得重启相关服务！
