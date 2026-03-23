# 部署到 GitHub Pages

## 步骤

### 1. 新建仓库并只推送 frontend

在 GitHub 新建空仓库（如 `short-drama-frontend`），然后：

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 开启 GitHub Pages

1. 进入仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存后，每次推送到 `main` 分支时自动构建并部署

### 3. 配置云端 API（必填，否则会出现 405 错误）

GitHub Pages 只能托管静态页面，不能提供 /api 接口。**必须**配置云端地址，让前端直连火山引擎：

1. 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加：

| Secret 名称 | 值 |
|------------|-----|
| `VITE_AGENT_API_URL` | `https://sd70dl345ql2h8d8rbq30.apigateway-cn-beijing.volceapi.com`（你的网关地址）|
| `VITE_AGENT_API_KEY` | 你的 API Key（agentkit.yaml 中的 runtime_apikey）|

3. 保存后，**重新运行一次 Actions** 里的 "Deploy to GitHub Pages"，或随便改个文件 push 触发重新构建。

### 4. 访问地址

```
https://你的用户名.github.io/仓库名/
```
