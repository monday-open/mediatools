const express = require('express');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer-core');

const PORT = process.env.PORT || 3000;

// 创建 Express 应用实例
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// API 路由
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

    // 从抖音链接中提取视频ID（异步）
    const videoId = await extractDouyinVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: '无效的抖音视频链接'
      });
    }

    console.log('视频ID:', videoId);

    // 调用去水印服务
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
        error: '去水印失败，请稍后再试',
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

async function extractDouyinVideoId(url) {
  try {
    // 如果是短链接，先解析获取真实URL
    if (url.includes('v.douyin.com')) {
      console.log('解析短链接:', url);
      
      try {
        // 使用GET请求并禁止自动重定向
        const response = await axios.get(url, {
          maxRedirects: 0,
          timeout: 10000,
          validateStatus: (status) => status === 302 || status === 301
        });
        
        const finalUrl = response.headers.location;
        console.log('重定向到:', finalUrl);
        
        // 从真实URL中提取视频ID
        const match = finalUrl.match(/video\/(\d+)/);
        if (match) {
          console.log('提取到视频ID:', match[1]);
          return match[1];
        }
      } catch (err) {
        // 获取重定向URL
        if (err.response && err.response.headers && err.response.headers.location) {
          const finalUrl = err.response.headers.location;
          console.log('重定向到:', finalUrl);
          
          // 从真实URL中提取视频ID
          const match = finalUrl.match(/video\/(\d+)/);
          if (match) {
            console.log('提取到视频ID:', match[1]);
            return match[1];
          }
        }
        console.error('解析短链接失败:', err.message);
      }
    }
    
    // 长链接直接提取
    const patterns = [
      /video\/(\d+)/,
      /aweme_id=(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        console.log('从长链接提取视频ID:', match[1]);
        return match[1];
      }
    }

    console.log('无法提取视频ID');
    return null;
  } catch (error) {
    console.error('提取视频ID失败:', error.message);
    return null;
  }
}

async function removeWatermark(videoId) {
  console.log('开始去水印处理，视频ID:', videoId);

  // 方案1：API逆向（首选）
  console.log('尝试方法1：API逆向');
  const result1 = await removeByApi(videoId);
  if (result1.success) return result1;

  // 方案2：前端解析（备用）
  console.log('尝试方法2：前端解析');
  const result2 = await removeByParse(videoId);
  if (result2.success) return result2;

  // 方案3：第三方API（兜底）
  console.log('尝试方法3：第三方API');
  const result3 = await removeByThirdParty(videoId);
  if (result3.success) return result3;

  return { success: false, methods: ['api', 'parse', 'third-party'] };
}

async function removeByApi(videoId) {
  try {
    console.log('调用iesdouyin API:', `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`);
    const url = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
        'Referer': 'https://www.iesdouyin.com/'
      }
    });
    const data = response.data;

    console.log('API响应:', JSON.stringify(data, null, 2).substring(0, 500));

    if (!data || !data.item_list || data.item_list.length === 0) {
      throw new Error('无效的视频数据');
    }

    const item = data.item_list[0];
    const videoInfo = item.video;
    
    if (videoInfo && videoInfo.play_addr && videoInfo.play_addr.url_list) {
      let videoUrl = videoInfo.play_addr.url_list[0];
      
      // 替换为无水印版本
      videoUrl = videoUrl.replace('playwm', 'play');
      videoUrl = videoUrl.replace(/&watermark=1/g, '&watermark=0');
      
      console.log('成功获取无水印视频:', videoUrl);
      return { success: true, url: videoUrl, method: 'iesdouyin-api' };
    }

    throw new Error('未找到视频地址');
  } catch (error) {
    console.error('API方法失败:', error.message);
    return { success: false };
  }
}

async function removeByParse(videoId) {
  try {
    console.log('解析HTML:', `https://www.douyin.com/video/${videoId}`);
    const url = `https://www.douyin.com/video/${videoId}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Cookie': 'ttwid=1%7C%7C%7C%7C%7C'
      }
    });
    const html = response.data;

    console.log('HTML长度:', html.length);
    console.log('HTML前500字符:', html.substring(0, 500));

    // 尝试多种模式匹配
    const patterns = [
      /"playAddr":"(https?:\/\/[^"]+)"/,
      /"play_addr"\s*:\s*"([^"]+)"/,
      /"src":"(https?:\/\/[^"]+)"/,
      /"video_url":"(https?:\/\/[^"]+)"/
    ];

    for (const pattern of patterns) {
      const jsonMatch = html.match(pattern);
      if (jsonMatch) {
        const videoUrl = jsonMatch[1].replace(/watermark=1/g, 'watermark=0');
        console.log('成功解析视频地址:', videoUrl);
        return { success: true, url: videoUrl, method: 'parse' };
      }
    }

    throw new Error('未找到视频地址');
  } catch (error) {
    console.error('解析方法失败:', error.message);
    return { success: false };
  }
}

async function removeByThirdParty(videoId) {
  try {
    console.log('尝试Puppeteer方案');
    
    // 使用本地Chrome
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const page = await browser.newPage();
    
    // 设置移动端User-Agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
    
    // 访问分享页面
    const shareUrl = `https://www.iesdouyin.com/share/video/${videoId}/`;
    console.log('访问分享页面:', shareUrl);
    
    await page.goto(shareUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 等待视频加载
    await page.waitForSelector('video', { timeout: 10000 }).catch(() => {});
    
    // 提取视频URL
    let videoUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : null;
    });
    
    await browser.close();
    
    if (videoUrl) {
      // 去除水印：替换playwm为play
      videoUrl = videoUrl.replace('playwm', 'play');
      console.log('成功提取无水印视频URL:', videoUrl);
      return { success: true, url: videoUrl, method: 'puppeteer' };
    }
    
    throw new Error('未找到视频元素');
  } catch (error) {
    console.error('Puppeteer方案失败:', error.message);
    return { success: false };
  }
}

// 导出应用实例
module.exports = app;

// 仅在直接运行时启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📖 API 文档：http://localhost:${PORT}/api/douyin/remove-watermark`);
  });
}
