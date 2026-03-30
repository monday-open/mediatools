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
   * 方案1：API逆向 - 获取视频详情
   */
  async removeByApi(videoId) {
    try {
      const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000
      });
      const data = response.data;

      // 检查响应状态
      if (!data || !data.aweme_detail) {
        throw new Error('无效的视频数据');
      }

      // 提取无水印视频地址
      const videoInfo = data.aweme_detail.video;
      if (videoInfo && videoInfo.play_addr) {
        const videoUrl = videoInfo.play_addr.url_list
          .find(url => url.includes('watermark=0'));

        if (videoUrl) {
          return { success: true, url: videoUrl, method: 'api' };
        }
      }

      throw new Error('未找到无水印视频地址');
    } catch (error) {
      console.error('API方法失败:', error.message);
      return { success: false };
    }
  }

  /**
   * 方案2：前端解析 - 解析HTML获取视频地址
   */
  async removeByParse(videoId) {
    try {
      const url = `https://www.douyin.com/video/${videoId}`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000
      });
      const html = response.data;

      // 正则提取视频地址（从JSON数据中）
      const jsonMatch = html.match(/"playAddr":"(https?:\/\/[^"]+)"/);
      if (jsonMatch) {
        const videoUrl = jsonMatch[1].replace(/watermark=1/g, 'watermark=0');
        return { success: true, url: videoUrl, method: 'parse' };
      }

      throw new Error('未找到视频地址');
    } catch (error) {
      console.error('解析方法失败:', error.message);
      return { success: false };
    }
  }

  /**
   * 方案3：第三方API - 使用第三方去水印服务
   */
  async removeByThirdParty(videoId) {
    try {
      // 这里可以替换为实际的第三方API
      // 示例：https://api.example.com/douyin?videoId=${videoId}
      const apiUrl = `https://api.example.com/douyin?videoId=${videoId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });

      const data = response.data;

      if (data && data.video_url) {
        return { success: true, url: data.video_url, method: 'third-party' };
      }

      throw new Error('第三方API返回无效数据');
    } catch (error) {
      console.error('第三方API失败:', error.message);
      return { success: false };
    }
  }

  /**
   * 主方法：尝试所有方案
   */
  async removeWatermark(videoId) {
    // 方案1：API逆向（首选）
    const result1 = await this.removeByApi(videoId);
    if (result1.success) return result1;

    // 方案2：前端解析（备用）
    const result2 = await this.removeByParse(videoId);
    if (result2.success) return result2;

    // 方案3：第三方API（兜底）
    const result3 = await this.removeByThirdParty(videoId);
    if (result3.success) return result3;

    return { success: false, methods: ['api', 'parse', 'third-party'] };
  }
}

module.exports = new DouyinWatermarkRemover();
