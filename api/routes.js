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
  const patterns = [
    /douyin\.com\/video\/(\w+)/,
    /v\.douyin\.com\/(\w+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

module.exports = router;
