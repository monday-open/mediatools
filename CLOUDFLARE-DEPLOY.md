# Cloudflare Workers 部署指南

## 为什么选择 Cloudflare Workers？

- ✅ **完全免费**：每天 10 万次请求
- ✅ **全球 CDN**：速度快，延迟低
- ✅ **支持 CORS**：前端可以直接调用
- ✅ **无需服务器**：Serverless 架构
- ✅ **自定义域名**：可以绑定自己的域名

---

## 部署步骤

### 方法一：网页部署（推荐新手）

1. **注册 Cloudflare 账户**
   - 访问：https://dash.cloudflare.com/sign-up
   - 填写邮箱和密码，完成注册

2. **创建 Worker**
   - 登录后，点击左侧 **Workers & Pages**
   - 点击 **Create Worker**
   - 输入名称，如：`douyin-api`
   - 点击 **Deploy**

3. **编辑代码**
   - 点击 **Edit code**
   - 删除默认代码
   - 复制 `cloudflare-worker.js` 的全部内容
   - 粘贴到编辑器
   - 点击 **Save and Deploy**

4. **获取 API 地址**
   - 部署成功后，会显示 Worker URL
   - 格式：`https://douyin-api.你的账户.workers.dev`
   - 这就是你的 API 地址！

---

### 方法二：命令行部署（推荐开发者）

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **创建项目**
   ```bash
   mkdir douyin-api
   cd douyin-api
   wrangler init
   ```

4. **复制代码**
   - 将 `cloudflare-worker.js` 内容复制到 `src/index.js`

5. **部署**
   ```bash
   wrangler deploy
   ```

---

## 使用方法

### API 调用示例

```javascript
// 前端调用
const apiUrl = 'https://douyin-api.你的账户.workers.dev';
const douyinUrl = 'https://v.douyin.com/i2NxB6tM/';

fetch(`${apiUrl}?url=${encodeURIComponent(douyinUrl)}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('视频标题:', data.data.title);
      console.log('无水印视频:', data.data.video_url);
    }
  });
```

### 返回数据格式

```json
{
  "success": true,
  "data": {
    "title": "视频标题",
    "cover": "封面图URL",
    "video_url": "无水印视频URL",
    "music_url": "背景音乐URL",
    "author": "作者昵称",
    "like_count": 1234,
    "comment_count": 56,
    "share_count": 78
  }
}
```

---

## 绑定自定义域名（可选）

1. 在 Cloudflare 添加你的域名
2. 在 Worker 设置中点击 **Triggers**
3. 点击 **Add Custom Domain**
4. 输入域名，如：`api.yourdomain.com`

---

## 注意事项

1. **免费额度**：每天 10 万次请求，足够个人使用
2. **速率限制**：单 IP 每分钟最多 100 次请求
3. **视频时效**：视频 URL 有效期约 24 小时
4. **Cookie 问题**：如果 API 失效，可能需要添加 Cookie（见下方）

---

## 高级配置（添加 Cookie）

如果抖音 API 需要认证，可以在代码中添加 Cookie：

```javascript
const response = await fetch(apiUrl, {
  headers: {
    'User-Agent': '...',
    'Referer': 'https://www.douyin.com/',
    'Cookie': '你的抖音Cookie',  // 添加这行
  },
});
```

获取 Cookie 方法：
1. 打开 https://www.douyin.com
2. 登录账号
3. 按 F12 打开开发者工具
4. 切换到 Network 标签
5. 刷新页面
6. 找到任意请求，复制 Cookie 值

---

## 故障排查

### 问题1：返回 "无法解析视频ID"
- 检查链接是否正确
- 尝试使用完整的视频链接

### 问题2：返回 "获取视频信息失败"
- 视频可能已删除或设为私密
- 尝试其他公开视频

### 问题3：视频 URL 无法播放
- 视频 URL 有时效性（约 24 小时）
- 需要及时下载或重新解析

---

## 成本估算

- **Cloudflare Workers**：免费（10万次/天）
- **域名**：约 ¥50/年（可选）
- **总计**：¥0 ~ ¥50/年

相比付费 API（¥100-500/月），节省大量成本！
