# MediaTools - 免费在线图片视频处理工具

## ✨ 功能列表

### 🖼️ 图片工具
- 🔄 **格式转换**：PNG、JPG、WEBP 互相转换
- 📦 **图片压缩**：压缩图片大小，保持画质
- 📐 **尺寸调整**：调整图片宽高比和尺寸

### 🎬 视频工具
- 🎥 **视频去水印**：支持抖音视频去水印（开发中）

## 🚀 快速开始

### 一键部署（推荐）

#### Windows 用户
```bash
cd C:\Users\Administrator\.openclaw\workspace\mediatools
deploy.bat
```

#### Linux/Mac 用户
```bash
cd /Users/Administrator/.openclaw/workspace/mediatools
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

详见 [AUTO-DEPLOY.md](AUTO-DEPLOY.md)

## 📊 部署状态

- ✅ 前端：GitHub Pages
  - 地址：https://monday-open.github.io/mediatools/
- ⏳ 后端：Vercel（自动部署中）
  - 地址：https://mediatools-api.vercel.app

## 🛠️ 技术栈

### 前端
- HTML5
- CSS3
- JavaScript (ES6+)

### 后端
- Node.js
- Express
- Axios

## 📁 项目结构

```
mediatools/
├── index.html              # 前端主页
├── deploy.bat              # Windows 部署脚本
├── deploy.sh               # Linux/Mac 部署脚本
├── test.bat                # Windows 测试脚本
├── test.sh                 # Linux/Mac 测试脚本
├── AUTO-DEPLOY.md          # 自动化部署指南
├── DEPLOYMENT.md           # 部署指南
├── VIDEO-WATERMARK-REMOVAL.md  # 去水印开发计划
├── backend/                # 后端 API
│   ├── index.js           # 入口文件
│   ├── api/
│   │   └── douyin.js      # 抖音去水印 API
│   ├── services/
│   │   └── douyin.js      # 抖音去水印服务
│   ├── routes.js          # 路由配置
│   ├── package.json       # 依赖配置
│   └── vercel.json        # Vercel 配置
└── frontend/               # 前端部署配置
    ├── package.json       # gh-pages 依赖
    └── .gitignore         # Git 忽略文件
```

## 📖 文档

- [自动化部署指南](AUTO-DEPLOY.md) - 一键部署教程
- [部署指南](DEPLOYMENT.md) - 详细部署说明
- [视频去水印开发计划](VIDEO-WATERMARK-REMOVAL.md) - 去水印功能设计

## 🧪 测试

### 一键测试

#### Windows 用户
```bash
cd C:\Users\Administrator\.openclaw\workspace\mediatools
test.bat
```

#### Linux/Mac 用户
```bash
cd /Users/Administrator/.openclaw/workspace/mediatools
chmod +x test.sh
./test.sh
```

## 🔧 开发

### 本地运行后端

```bash
cd backend
npm install
npm start
```

### 本地运行前端

```bash
# 部署到 GitHub Pages
cd frontend
npm install
npm run deploy
```

## 📊 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 图片格式转换 | ✅ 已完成 | PNG/JPG/WEBP 互转 |
| 图片压缩 | ✅ 已完成 | 压缩图片大小 |
| 图片尺寸调整 | ✅ 已完成 | 调整图片尺寸 |
| 视频去水印 | ⏳ 开发中 | 抖音去水印功能 |

## 🎯 计划功能

- [ ] 获取 Adsterra 广告代码
- [ ] 集成广告到网站
- [ ] 注册 HilltopAds 账户
- [ ] 支持更多平台（小红书、B站等）

## 📞 问题反馈

如有问题，请提交 Issue 或联系开发者。

## 📄 许可证

MIT License

---

*最后更新：2026-03-30*
