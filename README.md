# Short Drama Script Agent - 前端

Vue 3 + Vite 构建的现代化前端界面，包含登录认证。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173，API 代理到 5001）
npm run dev
```

同时需要启动后端：`python app.py`（端口 5001）

## 构建

```bash
npm run build
```

构建产物输出到 `../static/dist/`，Flask 将自动优先提供 Vue 版界面。

## 默认登录账号

首次运行后端时会在项目根目录生成 `users.json`。

- **账号**：admin  
- **密码**：admin123  

**安全提醒**：上线前请修改默认密码（可直接编辑 `users.json` 或扩展 auth 模块支持注册）。
