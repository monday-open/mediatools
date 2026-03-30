# MediaTools Backend API

MediaTools 后端 API 服务，用于视频去水印功能。

## 项目结构

```
backend/
├── api/
│   └── douyin.js          # 抖音去水印 API 路由
├── services/
│   └── douyin.js          # 抖音去水印服务
├── routes.js              # API 路由配置
├── index.js               # 服务器入口
├── package.json           # 项目配置
└── vercel.json            # Vercel 部署配置
```

## 安装依赖

```bash
cd backend
npm install
```

## 本地开发

```bash
cd backend
npm start
```

服务器将运行在 `http://localhost:3000`

## API 接口

### POST /api/douyin/remove-watermark

去水印接口

**请求参数：**
```json
{
  "url": "https://www.douyin.com/video/xxx"
}
```

**成功响应：**
```json
{
  "success": true,
  "url": "https://example.com/video.mp4",
  "method": "api"
}
```

**失败响应：**
```json
{
  "success": false,
  "error": "去水印失败，请稍后再试",
  "methods": ["api", "parse", "third-party"]
}
```

## 部署到 Vercel

```bash
cd backend
npm install -g vercel
vercel
```

## 环境变量

在 Vercel Dashboard 中配置以下环境变量：

- `DOUYIN_USER_AGENT` - 抖音 User-Agent（可选）
- `DOUYIN_COOKIE` - 抖音 Cookie（可选）

## 注意事项

1. 抖音 API 可能随时变化，需要定期维护
2. 建议添加请求频率限制
3. 建议使用代理池防止 IP 被封
4. 仅限个人学习和研究使用
