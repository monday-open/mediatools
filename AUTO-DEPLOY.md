# MediaTools 自动化部署指南

## 🚀 一键部署

### Windows 用户
```bash
cd C:\Users\Administrator\.openclaw\workspace\mediatools
deploy.bat
```

### Linux/Mac 用户
```bash
cd /Users/Administrator/.openclaw/workspace/mediatools
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 部署流程

### 阶段1：后端部署（Vercel）

1. **自动检测**：Vercel 会自动检测到 GitHub 仓库
2. **自动部署**：Vercel 自动构建并部署后端 API
3. **等待完成**：约 2-3 分钟

**后端 API 地址**：`https://mediatools-api.vercel.app`

---

### 阶段2：前端部署（GitHub Pages）

1. **自动检测**：GitHub 会自动检测到代码变更
2. **自动构建**：GitHub Actions 自动构建前端
3. **自动部署**：部署到 GitHub Pages
4. **等待完成**：约 1-2 分钟

**前端网站地址**：`https://monday-open.github.io/mediatools/`

---

## 🧪 一键测试

### Windows 用户
```bash
cd C:\Users\Administrator\.openclaw\workspace\mediatools
test.bat
```

### Linux/Mac 用户
```bash
cd /Users/Administrator/.openclaw/workspace/mediatools
chmod +x test.sh
./test.sh
```

---

## 📊 部署状态检查

### 检查 Vercel 部署
访问：https://vercel.com/dashboard
查看 `mediatools-api` 项目的部署状态

### 检查 GitHub Pages
访问：https://github.com/monday-open/mediatools/settings/pages
查看 Pages 是否已启用

---

## 🔧 手动部署（备用方案）

### 手动部署后端到 Vercel

1. 访问 https://vercel.com
2. 点击 "Add New" → "Project"
3. 导入 GitHub 仓库：https://github.com/monday-open/mediatools
4. Vercel 会自动检测配置（`backend/vercel.json`）
5. 点击 "Deploy"

### 手动部署前端到 GitHub Pages

1. 访问 https://github.com/monday-open/mediatools
2. Settings → Pages
3. Source 选择 `main` 分支
4. 保存

---

## 📁 项目结构

```
mediatools/
├── index.html              # 前端主页
├── deploy.bat              # Windows 部署脚本
├── deploy.sh               # Linux/Mac 部署脚本
├── test.bat                # Windows 测试脚本
├── test.sh                 # Linux/Mac 测试脚本
├── VIDEO-WATERMARK-REMOVAL.md  # 去水印开发计划
├── DEPLOYMENT.md           # 部署指南
├── backend/                # 后端 API
│   ├── index.js           # 入口文件
│   ├── api/
│   │   └── douyin.js      # 抖音去水印 API
│   ├── services/
│   │   └── douyin.js      # 抖音去水印服务
│   ├── routes.js          # 路由配置
│   ├── package.json       # 依赖配置
│   ├── vercel.json        # Vercel 配置
│   └── README.md          # 后端文档
└── frontend/               # 前端部署配置
    ├── package.json       # gh-pages 依赖
    └── .gitignore         # Git 忽略文件
```

---

## 🎯 功能测试

### 1. 测试前端页面
访问：https://monday-open.github.io/mediatools/

### 2. 测试去水印功能
1. 输入抖音视频链接
2. 点击"去水印"按钮
3. 查看结果

### 3. 测试降级策略
- **方法1（首选）**：API 逆向
  - 如果成功，显示下载链接
- **方法2（备用）**：前端解析
  - 如果方法1失败，尝试方法2
- **方法3（兜底）**：第三方 API
  - 如果方法2失败，尝试方法3
- **失败**：显示错误提示

---

## 📞 问题排查

### Vercel 部署失败
1. 检查 GitHub 仓库是否可访问
2. 检查 `backend/package.json` 依赖是否正确
3. 检查 `backend/vercel.json` 配置是否正确
4. 查看 Vercel Dashboard 的错误日志

### GitHub Pages 部署失败
1. 检查 `frontend/package.json` 配置是否正确
2. 检查 `index.html` 文件是否存在
3. 查看 GitHub Actions 日志

### 去水印功能失败
1. 检查后端 API 是否正常运行
2. 检查抖音 API 是否可用
3. 检查网络连接
4. 查看浏览器控制台错误

---

## 🔐 环境变量（可选）

如果需要配置环境变量，在 Vercel Dashboard 中添加：

- `NODE_ENV`: `production`
- `PORT`: `3000`

---

## 📈 监控和日志

### Vercel 日志
访问：https://vercel.com/dashboard
查看 `/api/douyin/remove-watermark` 的日志

### GitHub Pages 日志
访问：https://github.com/monday-open/mediatools/actions
查看构建日志

---

## 🎉 部署完成

部署完成后，你可以：

1. ✅ 访问前端网站测试功能
2. ✅ 查看后端 API 日志
3. ✅ 测试去水印功能
4. ✅ 查看部署统计

**部署成功标志**：
- ✅ Vercel 部署状态：Active
- ✅ GitHub Pages 状态：Active
- ✅ 前端页面可访问
- ✅ 后端 API 可访问

---

*最后更新：2026-03-30*
