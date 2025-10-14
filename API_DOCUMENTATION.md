# API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **认证方式**: Bearer Token (Laravel Sanctum)
- **Content-Type**: `application/json`

## 认证相关

### 注册用户

**POST** `/register`

**请求体：**
```json
{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**响应：**
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "created_at": "2025-10-14T12:00:00.000000Z",
    "updated_at": "2025-10-14T12:00:00.000000Z"
  }
}
```

### 用户登录

**POST** `/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "access_token": "1|xxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "roles": [
      {
        "id": 2,
        "name": "user"
      }
    ]
  }
}
```

### 用户登出

**POST** `/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "message": "退出成功"
}
```

### 获取当前用户信息

**GET** `/me`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": 1,
  "name": "用户名",
  "email": "user@example.com",
  "roles": [
    {
      "id": 2,
      "name": "user"
    }
  ]
}
```

## 目录管理

### 获取目录树

**GET** `/directories/tree`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
[
  {
    "id": 1,
    "name": "根目录",
    "parent_id": null,
    "path": "根目录",
    "created_by": 1,
    "children": [
      {
        "id": 2,
        "name": "子目录",
        "parent_id": 1,
        "path": "根目录/子目录",
        "children": []
      }
    ],
    "files": []
  }
]
```

### 获取目录列表

**GET** `/directories?parent_id={parent_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**查询参数：**
- `parent_id` (可选): 父目录 ID，不传或传 null 获取根目录

**响应：**
```json
[
  {
    "id": 1,
    "name": "目录名称",
    "parent_id": null,
    "path": "目录名称",
    "created_by": 1,
    "created_at": "2025-10-14T12:00:00.000000Z",
    "creator": {
      "id": 1,
      "name": "用户名"
    }
  }
]
```

### 创建目录

**POST** `/directories`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "name": "新目录",
  "parent_id": 1
}
```

**响应：**
```json
{
  "id": 3,
  "name": "新目录",
  "parent_id": 1,
  "path": "根目录/新目录",
  "created_by": 1,
  "created_at": "2025-10-14T12:00:00.000000Z",
  "creator": {
    "id": 1,
    "name": "用户名"
  }
}
```

### 获取目录详情

**GET** `/directories/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": 1,
  "name": "目录名称",
  "parent_id": null,
  "path": "目录名称",
  "created_by": 1,
  "children": [],
  "files": [],
  "creator": {
    "id": 1,
    "name": "用户名"
  }
}
```

### 更新目录

**PUT** `/directories/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "name": "更新后的目录名"
}
```

**响应：**
```json
{
  "id": 1,
  "name": "更新后的目录名",
  "parent_id": null,
  "path": "更新后的目录名",
  "updated_at": "2025-10-14T12:00:00.000000Z"
}
```

### 删除目录

**DELETE** `/directories/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "message": "目录删除成功"
}
```

## 文件管理

### 获取文件列表

**GET** `/files?directory_id={directory_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**查询参数：**
- `directory_id` (必需): 目录 ID

**响应：**
```json
[
  {
    "id": 1,
    "name": "20251014_document.pdf",
    "original_name": "document.pdf",
    "directory_id": 1,
    "uploaded_by": 1,
    "file_path": "uploads/20251014_document.pdf",
    "mime_type": "application/pdf",
    "size": 1024000,
    "created_at": "2025-10-14T12:00:00.000000Z",
    "directory": {
      "id": 1,
      "name": "目录名称"
    },
    "uploader": {
      "id": 1,
      "name": "用户名"
    }
  }
]
```

### 上传文件

**POST** `/files`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体（FormData）：**
- `file`: 文件对象
- `directory_id`: 目录 ID

**响应：**
```json
{
  "id": 1,
  "name": "20251014_document.pdf",
  "original_name": "document.pdf",
  "directory_id": 1,
  "uploaded_by": 1,
  "file_path": "uploads/20251014_document.pdf",
  "mime_type": "application/pdf",
  "size": 1024000,
  "created_at": "2025-10-14T12:00:00.000000Z",
  "directory": {
    "id": 1,
    "name": "目录名称"
  },
  "uploader": {
    "id": 1,
    "name": "用户名"
  }
}
```

### 获取文件详情

**GET** `/files/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": 1,
  "name": "20251014_document.pdf",
  "original_name": "document.pdf",
  "directory_id": 1,
  "file_path": "uploads/20251014_document.pdf",
  "mime_type": "application/pdf",
  "size": 1024000,
  "directory": {
    "id": 1,
    "name": "目录名称"
  },
  "uploader": {
    "id": 1,
    "name": "用户名"
  }
}
```

### 更新文件信息（重命名）

**PUT** `/files/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "name": "新文件名.pdf"
}
```

**响应：**
```json
{
  "id": 1,
  "name": "20251014_document.pdf",
  "original_name": "新文件名.pdf",
  "updated_at": "2025-10-14T12:00:00.000000Z"
}
```

### 删除文件

**DELETE** `/files/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "message": "文件删除成功"
}
```

### 下载文件

**GET** `/files/{id}/download`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
文件二进制流（浏览器会自动下载）

## 提案管理

### 获取提案列表

**GET** `/proposals`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
[
  {
    "id": 1,
    "title": "提案标题",
    "description": "提案描述",
    "created_by": 1,
    "status": "active",
    "created_at": "2025-10-14T12:00:00.000000Z",
    "creator": {
      "id": 1,
      "name": "用户名"
    },
    "permissions": [
      {
        "id": 1,
        "proposal_id": 1,
        "user_id": 2,
        "directory_id": 1,
        "expires_at": "2025-12-31T23:59:59.000000Z",
        "can_upload": true,
        "user": {
          "id": 2,
          "name": "授权用户"
        },
        "directory": {
          "id": 1,
          "name": "目录名称"
        }
      }
    ]
  }
]
```

### 创建提案

**POST** `/proposals`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "title": "新提案",
  "description": "提案描述",
  "status": "draft",
  "permissions": [
    {
      "user_id": 2,
      "directory_id": 1,
      "expires_at": "2025-12-31T23:59:59"
    }
  ]
}
```

**响应：**
```json
{
  "id": 1,
  "title": "新提案",
  "description": "提案描述",
  "created_by": 1,
  "status": "draft",
  "created_at": "2025-10-14T12:00:00.000000Z",
  "creator": {
    "id": 1,
    "name": "用户名"
  },
  "permissions": []
}
```

### 获取提案详情

**GET** `/proposals/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": 1,
  "title": "提案标题",
  "description": "提案描述",
  "created_by": 1,
  "status": "active",
  "created_at": "2025-10-14T12:00:00.000000Z",
  "creator": {
    "id": 1,
    "name": "用户名"
  },
  "permissions": [
    {
      "id": 1,
      "user_id": 2,
      "directory_id": 1,
      "expires_at": "2025-12-31T23:59:59.000000Z",
      "user": {
        "id": 2,
        "name": "授权用户"
      },
      "directory": {
        "id": 1,
        "name": "目录名称"
      }
    }
  ]
}
```

### 更新提案

**PUT** `/proposals/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "status": "active"
}
```

**响应：**
```json
{
  "id": 1,
  "title": "更新后的标题",
  "description": "更新后的描述",
  "status": "active",
  "updated_at": "2025-10-14T12:00:00.000000Z"
}
```

### 删除提案

**DELETE** `/proposals/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "message": "提案删除成功"
}
```

### 添加提案权限

**POST** `/proposals/{id}/permissions`

**Headers:**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "user_id": 2,
  "directory_id": 1,
  "expires_at": "2025-12-31T23:59:59"
}
```

**响应：**
```json
{
  "id": 1,
  "proposal_id": 1,
  "user_id": 2,
  "directory_id": 1,
  "expires_at": "2025-12-31T23:59:59.000000Z",
  "can_upload": true,
  "created_at": "2025-10-14T12:00:00.000000Z",
  "user": {
    "id": 2,
    "name": "授权用户"
  },
  "directory": {
    "id": 1,
    "name": "目录名称"
  }
}
```

## 错误响应

### 验证错误（422）

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "邮箱格式不正确"
    ],
    "password": [
      "密码至少需要8个字符"
    ]
  }
}
```

### 未授权（401）

```json
{
  "message": "Unauthenticated."
}
```

### 未找到（404）

```json
{
  "message": "Resource not found."
}
```

### 服务器错误（500）

```json
{
  "message": "Server Error",
  "error": "错误详情"
}
```

## 状态码说明

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `401 Unauthorized`: 未授权，需要登录
- `403 Forbidden`: 禁止访问，权限不足
- `404 Not Found`: 资源未找到
- `422 Unprocessable Entity`: 验证失败
- `500 Internal Server Error`: 服务器错误

## 使用示例

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 登录
const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return response.data;
};

// 获取目录树（需要 token）
const getDirectoryTree = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/directories/tree', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// 上传文件
const uploadFile = async (file, directoryId) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('directory_id', directoryId);
  
  const response = await api.post('/files', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
```

### cURL

```bash
# 登录
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取目录树
curl -X GET http://localhost:8000/api/directories/tree \
  -H "Authorization: Bearer YOUR_TOKEN"

# 上传文件
curl -X POST http://localhost:8000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "directory_id=1"
```

## 注意事项

1. 所有需要认证的接口都必须在 Header 中携带 Token
2. Token 格式：`Bearer {token}`
3. 文件上传使用 `multipart/form-data`
4. 其他请求使用 `application/json`
5. 日期时间格式：ISO 8601（`YYYY-MM-DDTHH:mm:ss.000000Z`）
6. 文件大小限制：10MB（可在后端配置修改）
