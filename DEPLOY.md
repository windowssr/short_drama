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

### 3. 配置云端 API（可选）

若要直连火山引擎 Agent，在仓库 **Settings** → **Secrets and variables** → **Actions** 添加：

| Secret 名称 | 说明 |
|------------|------|
| `VITE_AGENT_API_URL` | 网关地址 |
| `VITE_AGENT_API_KEY` | API Key |

### 4. 访问地址

```
https://你的用户名.github.io/仓库名/
```
