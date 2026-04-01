const express = require('express');
const axios = require('axios');
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 从抖音链接中提取视频ID
 */
async function extractDouyinVideoId(url) {
  try {
    url = url.trim();
    console.log('原始输入:', url);

    // 长链接直接提取
    const longLinkMatch = url.match(/douyin\.com\/video\/(\d+)/);
    if (longLinkMatch) {
      console.log('✓ 从长链接提取视频ID:', longLinkMatch[1]);
      return longLinkMatch[1];
    }

    // 短链接处理
    const shortLinkMatch = url.match(/v\.douyin\.com\/([\w-]+)\/?/);
    if (shortLinkMatch) {
      const shortUrl = `https://v.douyin.com/${shortLinkMatch[1]}/`;
      console.log('解析短链接:', shortUrl);
      
      try {
        const response = await axios.get(shortUrl, {
          maxRedirects: 0,
          timeout: 10000,
          validateStatus: (status) => status >= 200 && status < 400
        });
        
        const finalUrl = response.request.res.responseUrl || response.headers.location;
        if (finalUrl) {
          console.log('重定向到:', finalUrl);
          const match = finalUrl.match(/video\/(\d+)/);
          if (match) {
            console.log('✓ 从短链接提取视频ID:', match[1]);
            return match[1];
          }
        }
      } catch (err) {
        if (err.response && err.response.headers && err.response.headers.location) {
          const finalUrl = err.response.headers.location;
          console.log('重定向到:', finalUrl);
          const match = finalUrl.match(/video\/(\d+)/);
          if (match) {
            console.log('✓ 从短链接提取视频ID:', match[1]);
            return match[1];
          }
        }
        console.error('解析短链接失败:', err.message);
      }
    }

    // 从复制内容中提取
    const copyContentMatch = url.match(/https?:\/\/v\.douyin\.com\/[\w-]+\/?/);
    if (copyContentMatch) {
      console.log('从复制内容提取链接:', copyContentMatch[0]);
      return await extractDouyinVideoId(copyContentMatch[0]);
    }

    console.log('✗ 无法提取视频ID');
    return null;
  } catch (error) {
    console.error('提取视频ID失败:', error.message);
    return null;
  }
}

/**
 * 去水印服务
 */
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

async function removeWatermark(videoId) {
  console.log('========== 开始去水印处理 ==========');
  console.log('视频ID:', videoId);
  
  const methods = [];
  
  // 方案1：iesdouyin API
  try {
    console.log('[方案1] 尝试 iesdouyin API...');
    const url = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Referer': 'https://www.douyin.com/',
      },
      timeout: 15000
    });
    
    const data = response.data;
    if (data && data.status_code === 0 && data.item_list && data.item_list.length > 0) {
      const item = data.item_list[0];
      const videoInfo = item.video;
      
      if (videoInfo && videoInfo.play_addr && videoInfo.play_addr.url_list) {
        let videoUrl = videoInfo.play_addr.url_list[0];
        videoUrl = videoUrl.replace('playwm', 'play');
        videoUrl = videoUrl.replace(/&watermark=1/g, '&watermark=0');
        videoUrl = videoUrl.replace(/watermark=1/g, 'watermark=0');
        
        console.log('[方案1] ✓ 成功获取视频地址');
        return { success: true, url: videoUrl, method: 'iesdouyin-api' };
      }
    }
  } catch (error) {
    console.error('[方案1] ✗ 失败:', error.message);
  }
  methods.push('iesdouyin-api');

  // 方案2：抖音网页版API
  try {
    console.log('[方案2] 尝试抖音网页版API...');
    const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Accept': 'application/json',
      },
      timeout: 15000
    });
    
    const data = response.data;
    if (data && data.aweme_detail) {
      const videoInfo = data.aweme_detail.video;
      if (videoInfo && videoInfo.play_addr && videoInfo.play_addr.url_list) {
        let videoUrl = videoInfo.play_addr.url_list[0];
        videoUrl = videoUrl.replace(/watermark=1/g, 'watermark=0');
        
        console.log('[方案2] ✓ 成功获取视频地址');
        return { success: true, url: videoUrl, method: 'web-api' };
      }
    }
  } catch (error) {
    console.error('[方案2] ✗ 失败:', error.message);
  }
  methods.push('web-api');

  console.log('========== 所有方法都失败 ==========');
  return { success: false, methods };
}

/**
 * POST /api/douyin/remove-watermark
 */
app.post('/api/douyin/remove-watermark', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: '请提供视频链接'
      });
    }

    console.log('收到去水印请求:', url);

    const videoId = await extractDouyinVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: '无效的抖音视频链接，请检查链接格式'
      });
    }

    console.log('视频ID:', videoId);

    const result = await removeWatermark(videoId);

    if (result.success) {
      res.json({
        success: true,
        url: result.url,
        method: result.method
      });
    } else {
      res.status(500).json({
        success: false,
        error: '去水印失败，所有方法均无效',
        methods: result.methods
      });
    }
  } catch (error) {
    console.error('去水印错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误，请稍后再试'
    });
  }
});

// 本地开发时启动服务器
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 导出给 Vercel
module.exports = app;
