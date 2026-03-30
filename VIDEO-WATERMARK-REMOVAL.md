# 视频去水印功能开发计划

## 📋 功能概述

### 核心目标
实现多平台视频去水印功能，支持降级策略，确保高可用性。

### 技术方案
通过逆向工程分析各平台 API，模拟客户端请求获取无水印视频流，直接下载原始视频。

---

## ⚠️ 法律声明和免责

### 重要提示

**本功能仅供个人学习和研究使用，不得用于以下用途：**

1. ❌ **商业用途** - 不得用于商业项目或盈利目的
2. ❌ **传播他人作品** - 不得上传、分享、传播他人原创视频
3. ❌ **侵犯版权** - 不得用于侵犯版权或知识产权的行为
4. ❌ **其他非法用途** - 不得用于任何违法或侵权活动

### 用户责任

**使用本功能即代表您同意：**

1. ✅ 理解并接受上述法律风险
2. ✅ 承担使用本功能产生的所有责任
3. ✅ 确保使用行为符合当地法律法规
4. ✅ 承担因使用本功能导致的任何后果

### 免责声明

- 开发者不对本功能的使用后果负责
- 开发者不提供任何形式的担保
- 如因使用本功能导致侵权纠纷，用户需自行承担全部责任
- 开发者有权随时停止维护本功能

---

## 🎯 支持的平台

### 优先级排序

| 优先级 | 平台 | 技术方案 | 状态 |
|--------|------|----------|------|
| P0 | 抖音 | API 逆向 + 模拟请求 | ⏳ 开发中 |
| P1 | 小红书 | API 逆向 + 模拟请求 | 📋 待开发 |
| P2 | B站 | API 逆向 + 模拟请求 | 📋 待开发 |
| P3 | 快手 | API 逆向 + 模拟请求 | 📋 待开发 |
| P4 | 微信视频号 | API 逆向 + 模拟请求 | 📋 待开发 |

---

## 🔄 降级策略

### 策略说明

当首选去水印方法失败时，自动尝试备用方法，确保用户始终能获得结果。

### 抖音降级方案

#### 方案1：API 逆向（首选）
```javascript
// 获取无水印视频流
const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
const data = await fetch(url, { headers: {...} });
const videoUrl = data.aweme_detail.video.play_addr.url_list.find(u => u.includes('watermark=0'));
```

#### 方案2：前端解析（备用）
```javascript
// 解析页面中的视频地址
const page = await fetch(`https://www.douyin.com/video/${videoId}`);
const match = page.match(/playAddr":"(https?:\/\/[^"]+)"/);
const videoUrl = match[1].replace(/watermark=1/g, 'watermark=0');
```

#### 方案3：第三方API（兜底）
```javascript
// 使用第三方去水印API
const url = `https://api.example.com/douyin?videoId=${videoId}`;
const data = await fetch(url);
const videoUrl = data.video_url;
```

### 降级逻辑流程

```
用户上传视频
    ↓
尝试方案1（API 逆向）
    ↓ 成功 → 下载视频 → 完成
    ↓ 失败
尝试方案2（前端解析）
    ↓ 成功 → 下载视频 → 完成
    ↓ 失败
尝试方案3（第三方API）
    ↓ 成功 → 下载视频 → 完成
    ↓ 失败
返回错误提示 → 提供手动下载建议
```

---

## 🛠️ 技术实现

### 后端服务架构

```
┌─────────────┐
│   前端网站   │
└──────┬──────┘
       │ HTTP请求
       ↓
┌─────────────┐
│  后端API服务 │
└──────┬──────┘
       │
       ├─→ 抖音去水印
       ├─→ 小红书去水印
       ├─→ B站去水印
       └─→ 快手去水印
       │
       ↓
┌─────────────┐
│  视频流处理  │
└─────────────┘
```

### 抖音API实现（Node.js）

```javascript
// douyin.js
const axios = require('axios');

class DouyinWatermarkRemover {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...';
    this.headers = {
      'User-Agent': this.userAgent,
      'Referer': 'https://www.douyin.com/',
      'Cookie': 'ttwid=xxx; sessionid=xxx',
    };
  }

  // 方案1：API逆向
  async removeByApi(videoId) {
    try {
      const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
      const response = await axios.get(url, { headers: this.headers });
      const data = response.data;

      // 提取无水印视频地址
      const videoUrl = data.aweme_detail.video.play_addr.url_list
        .find(url => url.includes('watermark=0'));

      if (videoUrl) {
        return { success: true, url: videoUrl, method: 'api' };
      }
    } catch (error) {
      console.error('API方法失败:', error.message);
    }

    return { success: false };
  }

  // 方案2：前端解析
  async removeByParse(videoId) {
    try {
      const url = `https://www.douyin.com/video/${videoId}`;
      const response = await axios.get(url, { headers: this.headers });
      const html = response.data;

      // 正则提取视频地址
      const match = html.match(/playAddr":"(https?:\/\/[^"]+)"/);
      if (match) {
        const videoUrl = match[1].replace(/watermark=1/g, 'watermark=0');
        return { success: true, url: videoUrl, method: 'parse' };
      }
    } catch (error) {
      console.error('解析方法失败:', error.message);
    }

    return { success: false };
  }

  // 方案3：第三方API
  async removeByThirdParty(videoId) {
    try {
      const url = `https://api.example.com/douyin?videoId=${videoId}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.video_url) {
        return { success: true, url: data.video_url, method: 'third-party' };
      }
    } catch (error) {
      console.error('第三方API失败:', error.message);
    }

    return { success: false };
  }

  // 主方法：尝试所有方案
  async removeWatermark(videoId) {
    // 方案1：API逆向
    const result1 = await this.removeByApi(videoId);
    if (result1.success) return result1;

    // 方案2：前端解析
    const result2 = await this.removeByParse(videoId);
    if (result2.success) return result2;

    // 方案3：第三方API
    const result3 = await this.removeByThirdParty(videoId);
    if (result3.success) return result3;

    return { success: false, methods: ['api', 'parse', 'third-party'] };
  }
}

module.exports = new DouyinWatermarkRemover();
```

---

## 📱 前端集成

### HTML 结构

```html
<div class="video-tool">
  <h2>视频去水印</h2>

  <!-- 法律声明 -->
  <div class="legal-notice">
    <h3>⚠️ 法律声明</h3>
    <p>本功能仅供个人学习和研究使用，不得用于商业用途或侵犯版权。</p>
    <p>使用即代表您同意本免责声明。</p>
  </div>

  <!-- 视频输入 -->
  <div class="input-section">
    <label>输入抖音视频链接：</label>
    <input type="text" id="videoUrl" placeholder="https://www.douyin.com/video/xxx">
    <button onclick="removeWatermark()">去水印</button>
  </div>

  <!-- 下载区域 -->
  <div class="download-section" id="downloadArea" style="display:none;">
    <p>去水印成功！</p>
    <a id="downloadLink" href="#" download>下载无水印视频</a>
    <p id="methodUsed">使用方法：API逆向</p>
  </div>

  <!-- 错误提示 -->
  <div class="error-section" id="errorArea" style="display:none;">
    <p>❌ 去水印失败，请尝试手动下载或稍后再试。</p>
  </div>
</div>
```

### JavaScript 逻辑

```javascript
async function removeWatermark() {
  const videoUrl = document.getElementById('videoUrl').value;
  const downloadArea = document.getElementById('downloadArea');
  const errorArea = document.getElementById('errorArea');

  // 显示加载状态
  downloadArea.style.display = 'none';
  errorArea.style.display = 'none';

  try {
    // 调用后端API
    const response = await fetch('/api/douyin/remove-watermark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl })
    });

    const data = await response.json();

    if (data.success) {
      // 显示下载链接
      document.getElementById('downloadLink').href = data.url;
      document.getElementById('methodUsed').textContent =
        `使用方法：${data.method}`;
      downloadArea.style.display = 'block';
    } else {
      // 显示错误
      errorArea.style.display = 'block';
    }
  } catch (error) {
    console.error('去水印失败:', error);
    errorArea.style.display = 'block';
  }
}
```

---

## 📊 测试计划

### 测试用例

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 功能测试 | 抖音视频去水印 | 成功下载无水印视频 |
| 降级测试 | API失败时切换方案 | 自动尝试备用方案 |
| 性能测试 | 大视频下载速度 | < 5MB/s |
| 错误处理 | 无效视频链接 | 友好错误提示 |
| 法律声明 | 用户确认提示 | 显示免责声明 |

### 样本测试

- 抖音短视频（< 1分钟）：10个
- 抖音长视频（1-5分钟）：10个
- 不同分辨率视频：高/中/低各5个

---

## 🚀 开发计划

### 阶段1：后端服务（3-5天）
- [ ] 抖音API逆向分析
- [ ] Node.js服务开发
- [ ] 降级策略实现
- [ ] 错误处理
- [ ] 性能优化

### 阶段2：前端集成（1-2天）
- [ ] 法律声明UI
- [ ] 视频输入界面
- [ ] 下载功能
- [ ] 进度显示
- [ ] 错误提示

### 阶段3：测试优化（1-2天）
- [ ] 功能测试
- [ ] 性能测试
- [ ] 错误处理测试
- [ ] 用户体验优化

### 阶段4：多平台扩展（2-3天）
- [ ] 小红书去水印
- [ ] B站去水印
- [ ] 快手去水印
- [ ] 微信视频号去水印

---

## 📝 注意事项

### 技术风险
- 各平台API可能随时变化
- 需要定期维护和更新
- 可能触发反爬虫机制

### 法律风险
- 仅限个人学习使用
- 不得用于商业用途
- 承担使用后果

### 防封机制
- 请求频率控制
- 随机延迟
- IP代理池
- User-Agent轮换

---

## 📚 参考资料

- Fiddler/Charles 抓包教程
- Node.js HTTP 请求文档
- 抖音API逆向分析文章
- 视频流处理最佳实践

---

*最后更新：2026-03-30*
*版本：v1.0*
