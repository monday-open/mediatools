const axios = require('axios');

class DouyinWatermarkRemover {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
  }

  /**
   * 方案1：API逆向 - 获取视频详情
   */
  async removeByApi(videoId) {
    try {
      const url = `https://www.douyin.com/web/api/v2/aweme/detail/?aweme_id=${videoId}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.douyin.com/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });
      const data = response.data;

      console.log('API响应:', JSON.stringify(data, null, 2));

      if (!data || !data.aweme_detail) {
        throw new Error('无效的视频数据');
      }

      const videoInfo = data.aweme_detail.video;
      if (videoInfo && videoInfo.play_addr) {
        const videoUrl = videoInfo.play_addr.url_list
          .find(url => url.includes('watermark=0'));

        if (videoUrl) {
          console.log('找到无水印视频:', videoUrl);
          return { success: true, url: videoUrl, method: 'api' };
        }
      }

      console.log('API方法未找到无水印视频');
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
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.douyin.com/',
        },
        timeout: 10000
      });
      const html = response.data;

      console.log('HTML长度:', html.length);

      const jsonMatch = html.match(/"playAddr":"(https?:\/\/[^"]+)"/);
      if (jsonMatch) {
        const videoUrl = jsonMatch[1].replace(/watermark=1/g, 'watermark=0');
        console.log('解析到视频地址:', videoUrl);
        return { success: true, url: videoUrl, method: 'parse' };
      }

      console.log('解析方法未找到视频地址');
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
   * 通过URL直接处理（处理复制链接格式）
   */
  async removeWatermarkByUrl(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.douyin.com/',
        },
        timeout: 10000
      });

      const html = response.data;
      console.log('URL响应长度:', html.length);

      // 尝试从HTML中提取视频ID
      const videoIdMatch = html.match(/aweme\/(\w+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        console.log('从URL提取到视频ID:', videoId);
        return await this.removeWatermark(videoId);
      }

      // 尝试直接解析视频地址
      const jsonMatch = html.match(/"playAddr":"(https?:\/\/[^"]+)"/);
      if (jsonMatch) {
        const videoUrl = jsonMatch[1].replace(/watermark=1/g, 'watermark=0');
        console.log('直接解析到视频地址:', videoUrl);
        return { success: true, url: videoUrl, method: 'url-parse' };
      }

      throw new Error('无法从URL提取视频信息');
    } catch (error) {
      console.error('URL处理失败:', error.message);
      return { success: false };
    }
  }

  /**
   * 主方法：尝试所有方案
   */
  async removeWatermark(videoId) {
    console.log('开始处理视频ID:', videoId);

    const result1 = await this.removeByApi(videoId);
    if (result1.success) {
      console.log('✓ API方法成功');
      return result1;
    }

    const result2 = await this.removeByParse(videoId);
    if (result2.success) {
      console.log('✓ 解析方法成功');
      return result2;
    }

    const result3 = await this.removeByThirdParty(videoId);
    if (result3.success) {
      console.log('✓ 第三方API成功');
      return result3;
    }

    console.log('✗ 所有方法都失败');
    return { success: false, methods: ['api', 'parse', 'third-party'] };
  }
}

module.exports = new DouyinWatermarkRemover();
