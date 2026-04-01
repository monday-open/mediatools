const axios = require('axios');

class DouyinWatermarkRemover {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    this.headers = {
      'User-Agent': this.userAgent,
      'Referer': 'https://www.douyin.com/',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
  }

  /**
   * 方案1：使用 iesdouyin.com API（最可靠）
   */
  async removeByApi(videoId) {
    try {
      console.log('[方案1] 尝试 iesdouyin API...');
      const url = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 15000
      });
      const data = response.data;

      console.log('[方案1] API响应状态:', data.status_code);

      // 检查响应状态
      if (!data || data.status_code !== 0 || !data.item_list || data.item_list.length === 0) {
        throw new Error('无效的视频数据');
      }

      // 提取无水印视频地址
      const item = data.item_list[0];
      const videoInfo = item.video;
      
      if (videoInfo && videoInfo.play_addr && videoInfo.play_addr.url_list) {
        // 获取无水印视频地址
        let videoUrl = videoInfo.play_addr.url_list[0];
        
        // 替换为无水印版本
        videoUrl = videoUrl.replace('playwm', 'play');
        videoUrl = videoUrl.replace(/&watermark=1/g, '&watermark=0');
        videoUrl = videoUrl.replace(/watermark=1/g, 'watermark=0');
        
        console.log('[方案1] ✓ 成功获取视频地址');
        return { success: true, url: videoUrl, method: 'iesdouyin-api' };
      }

      throw new Error('未找到视频地址');
    } catch (error) {
      console.error('[方案1] ✗ 失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 方案2：使用抖音网页版API
   */
  async removeByWebApi(videoId) {
    try {
      console.log('[方案2] 尝试抖音网页版API...');
      const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
      
      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000
      });
      
      const data = response.data;
      
      if (!data || !data.aweme_detail) {
        throw new Error('无效的视频数据');
      }
      
      const videoInfo = data.aweme_detail.video;
      if (videoInfo && videoInfo.play_addr && videoInfo.play_addr.url_list) {
        let videoUrl = videoInfo.play_addr.url_list[0];
        videoUrl = videoUrl.replace(/watermark=1/g, 'watermark=0');
        
        console.log('[方案2] ✓ 成功获取视频地址');
        return { success: true, url: videoUrl, method: 'web-api' };
      }
      
      throw new Error('未找到视频地址');
    } catch (error) {
      console.error('[方案2] ✗ 失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 方案3：构造直接播放地址
   */
  async removeByDirectUrl(videoId) {
    try {
      console.log('[方案3] 尝试构造直接播放地址...');
      
      // 尝试多种可能的视频地址格式
      const urls = [
        `https://aweme.snssdk.com/aweme/v1/play/?video_id=${videoId}&ratio=720p&line=0`,
        `https://api.amemv.com/aweme/v1/play/?video_id=${videoId}&ratio=720p&line=0`,
      ];
      
      for (const videoUrl of urls) {
        try {
          const response = await axios.head(videoUrl, {
            headers: this.headers,
            timeout: 5000,
            validateStatus: () => true
          });
          
          if (response.status === 200 || response.status === 302) {
            console.log('[方案3] ✓ 成功获取视频地址');
            return { success: true, url: videoUrl, method: 'direct-url' };
          }
        } catch (err) {
          // 继续尝试下一个URL
        }
      }
      
      throw new Error('所有直接URL都不可用');
    } catch (error) {
      console.error('[方案3] ✗ 失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 主方法：尝试所有方案
   */
  async removeWatermark(videoId) {
    console.log('========== 开始去水印处理 ==========');
    console.log('视频ID:', videoId);
    
    const methods = [];
    
    // 方案1：iesdouyin API（首选）
    const result1 = await this.removeByApi(videoId);
    methods.push('iesdouyin-api');
    if (result1.success) {
      console.log('========== 去水印成功 ==========');
      return result1;
    }

    // 方案2：抖音网页版API
    const result2 = await this.removeByWebApi(videoId);
    methods.push('web-api');
    if (result2.success) {
      console.log('========== 去水印成功 ==========');
      return result2;
    }

    // 方案3：直接URL
    const result3 = await this.removeByDirectUrl(videoId);
    methods.push('direct-url');
    if (result3.success) {
      console.log('========== 去水印成功 ==========');
      return result3;
    }

    console.log('========== 所有方法都失败 ==========');
    return { success: false, methods };
  }
}

module.exports = new DouyinWatermarkRemover();
