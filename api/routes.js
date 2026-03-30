const express = require('express');
const douyin = require('../services/douyin');

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
    const videoId = extractDouyinVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: '无效的抖音视频链接'
      });
    }

    console.log('视频ID:', videoId);

    // 如果没有提取到视频ID，尝试直接访问
    if (!videoId) {
      console.log('未提取到视频ID，尝试直接访问URL');
      const result = await douyin.removeWatermarkByUrl(url);
      if (result.success) {
        return res.json({
          success: true,
          url: result.url,
          method: result.method
        });
      } else {
        return res.status(500).json({
          success: false,
          error: '无法处理该视频链接',
          details: '请尝试直接复制视频链接'
        });
      }
    }

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

/**
 * 从抖音链接中提取视频ID
 */
function extractDouyinVideoId(url) {
  console.log('原始URL:', url);

  // 方案1：直接提取视频ID
  const directPatterns = [
    /douyin\.com\/video\/(\w+)/,
    /v\.douyin\.com\/(\w+)/,
    /aweme\/(\w+)/
  ];

  for (const pattern of directPatterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('✓ 提取到视频ID（直接匹配）:', match[1]);
      return match[1];
    }
  }

  // 方案2：处理复制链接格式
  // 示例：https://v.douyin.com/_2qPT2a9mtY/
  const copyLinkPatterns = [
    /douyin\.com\/\w+/,
    /v\.douyin\.com\/[\w-]+\/?/
  ];

  for (const pattern of copyLinkPatterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('✓ 匹配到复制链接格式');
      // 复制链接格式需要先访问获取真实URL
      // 这里先尝试直接访问
      return null; // 返回null，让服务层处理
    }
  }

  console.log('✗ 无法提取视频ID');
  return null;
}

module.exports = router;
