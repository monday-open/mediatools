const express = require('express');
const axios = require('axios');
const douyin = require('./services/douyin');

const router = express.Router();

/**
 * POST /api/douyin/remove-watermark
 * 去水印接口
 */
router.post('/remove-watermark', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: '请提供视频链接'
      });
    }

    console.log('收到去水印请求:', url);

    // 从抖音链接中提取视频ID
    const videoId = await extractDouyinVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: '无效的抖音视频链接，请检查链接格式'
      });
    }

    console.log('视频ID:', videoId);

    // 调用去水印服务
    const result = await douyin.removeWatermark(videoId);

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

/**
 * 从抖音链接中提取视频ID
 * 支持短链接和长链接
 * 支持复制内容格式
 */
async function extractDouyinVideoId(url) {
  try {
    // 清理URL（去除首尾空格和特殊字符）
    url = url.trim();
    
    console.log('原始输入:', url);

    // 方案1：直接匹配长链接中的视频ID
    // 格式：https://www.douyin.com/video/123456789
    const longLinkMatch = url.match(/douyin\.com\/video\/(\d+)/);
    if (longLinkMatch) {
      console.log('✓ 从长链接提取视频ID:', longLinkMatch[1]);
      return longLinkMatch[1];
    }

    // 方案2：处理短链接
    // 格式：https://v.douyin.com/xxx/
    const shortLinkMatch = url.match(/v\.douyin\.com\/([\w-]+)\/?/);
    if (shortLinkMatch) {
      const shortUrl = `https://v.douyin.com/${shortLinkMatch[1]}/`;
      console.log('解析短链接:', shortUrl);
      
      try {
        // 发送请求获取重定向URL
        const response = await axios.get(shortUrl, {
          maxRedirects: 0,
          timeout: 10000,
          validateStatus: (status) => status >= 200 && status < 400
        });
        
        // 检查是否有重定向
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
        // 处理重定向错误
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

    // 方案3：从复制内容中提取链接
    // 格式：6.15 eoq:/ C@u.fb ... https://v.douyin.com/xxx/ 复制此链接...
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

module.exports = router;
