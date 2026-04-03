# MediaTools - 免费在线文档格式转换工具

MediaTools 是一个免费的在线文档格式转换工具，支持多种文档格式互相转换，并提供抖音视频去水印功能。

## ✨ 功能特性

### 文档格式转换
- ✅ HTML ↔ Markdown ↔ TXT ↔ Word (DOCX)
- ✅ JSON ↔ CSV
- ✅ Markdown ↔ RST

### 抖音视频去水印
- ✅ 支持抖音视频链接解析
- ✅ 提取视频下载链接
- ✅ 获取视频元数据（标题、作者、点赞数等）

## 🚀 快速开始

### 部署到 GitHub Pages

1. **创建仓库并推送代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/monday-open/mediatools.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 访问仓库 Settings → Pages
   - 选择分支：`main` / 目录：`/ (root)`
   - 点击 Save

3. **访问网站**
   - https://monday-open.github.io/mediatools/

## 📦 技术栈

- **前端**: HTML + JavaScript (ES6 Modules)
- **后端**: Node.js + Cloudflare Worker
- **转换库**:
  - mammoth (DOCX 转换)
  - docx (Word 生成)
  - json2csv (JSON 转 CSV)
  - csv-writer (CSV 写入)
  - markdown-it (Markdown 处理)
  - rst2html (RST 处理)

## 📁 文件结构

```
mediatools/
├── index.html              # 前端页面
├── package.json            # 项目配置和依赖
├── wrangler.jsonc          # Cloudflare 配置
├── lib/
│   └── document-converter.js  # 文档转换逻辑
├── api/
│   └── watermark.js        # 抖音去水印 API
├── public/
│   └── docs/               # 文档目录
└── README.md               # 项目说明
```

## 🔧 安装依赖

```bash
npm install
```

## 🧪 本地开发

```bash
npm run preview
```

## 📖 使用方法

### 文档格式转换

1. 选择输入格式（HTML/Markdown/TXT/Word/JSON/CSV/RST）
2. 选择输出格式
3. 粘贴要转换的内容
4. 点击"开始转换"
5. 下载转换后的文件

### 抖音视频去水印

1. 输入抖音视频链接
2. 点击"去水印"
3. 查看解析结果并下载视频

## 📄 API 文档

### 抖音去水印 API

**请求**
```
GET /api/watermark?url={douyin_url}
```

**响应**
```json
{
  "success": true,
  "data": {
    "title": "视频标题",
    "cover": "封面图片URL",
    "video_url": "视频下载链接",
    "music_url": "音乐下载链接",
    "author": "作者名称",
    "like_count": 1000,
    "comment_count": 100,
    "share_count": 50
  }
}
```

## ⚠️ 免责声明

本工具仅供学习和个人使用，请勿用于非法用途。使用本工具产生的任何后果由用户自行承担。

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- GitHub: https://github.com/monday-open/mediatools
- 问题反馈: https://github.com/monday-open/mediatools/issues
