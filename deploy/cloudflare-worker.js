// Cloudflare Worker - 抖音去水印 API
// 免费额度：每天 10 万次请求
// 部署方法：https://dash.cloudflare.com -> Workers & Pages -> Create Worker

export default {
  async fetch(request, env, ctx) {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const douyinUrl = url.searchParams.get('url');

    if (!douyinUrl) {
      return jsonResponse({ error: '请提供抖音链接', code: 400 }, 400);
    }

    try {
      // 步骤1：提取视频ID
      const videoId = await extractVideoId(douyinUrl);
      if (!videoId) {
        return jsonResponse({ error: '无法解析视频ID，请检查链接是否正确', code: 400 }, 400);
      }

      // 步骤2：获取视频信息
      const videoInfo = await getVideoInfo(videoId);
      if (!videoInfo) {
        return jsonResponse({ error: '获取视频信息失败，可能视频已删除或私密', code: 404 }, 404);
      }

      // 步骤3：返回结果
      return jsonResponse({
        success: true,
        data: {
          title: videoInfo.desc,
          cover: videoInfo.cover,
          video_url: videoInfo.videoUrl,
          music_url: videoInfo.musicUrl,
          author: videoInfo.author,
          like_count: videoInfo.likeCount,
          comment_count: videoInfo.commentCount,
          share_count: videoInfo.shareCount,
        }
      });

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: '解析失败: ' + error.message, code: 500 }, 500);
    }
  },
};

// 提取视频ID
async function extractVideoId(shareUrl) {
  try {
    // 如果是完整URL，先获取重定向后的URL
    const response = await fetch(shareUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
      },
    });

    const finalUrl = response.url;
    
    // 从URL中提取视频ID
    // 格式1: https://www.douyin.com/video/123456789
    let match = finalUrl.match(/video\/(\d+)/);
    if (match) return match[1];
    
    // 格式2: modal_id=123456789
    match = finalUrl.match(/modal_id=(\d+)/);
    if (match) return match[1];
    
    // 格式3: www.iesdouyin.com/share/video/123456789
    match = finalUrl.match(/share\/video\/(\d+)/);
    if (match) return match[1];

    return null;
  } catch (error) {
    console.error('Extract video ID error:', error);
    return null;
  }
}

// 获取视频信息
async function getVideoInfo(videoId) {
  try {
    // 使用抖音 Web API
    const apiUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
        'Referer': 'https://www.douyin.com/',
      },
    });

    const data = await response.json();

    if (data.status_code !== 0 || !data.item_list || data.item_list.length === 0) {
      return null;
    }

    const item = data.item_list[0];
    
    // 获取无水印视频URL
    let videoUrl = item.video?.play_addr?.url_list?.[0] || '';
    
    // 替换为无水印版本
    if (videoUrl.includes('watermark')) {
      videoUrl = videoUrl.replace(/playwm/, 'play');
    }

    return {
      desc: item.desc || '',
      cover: item.video?.cover?.url_list?.[0] || '',
      videoUrl: videoUrl,
      musicUrl: item.music?.play_url?.url_list?.[0] || '',
      author: item.author?.nickname || '',
      likeCount: item.statistics?.digg_count || 0,
      commentCount: item.statistics?.comment_count || 0,
      shareCount: item.statistics?.share_count || 0,
    };
  } catch (error) {
    console.error('Get video info error:', error);
    return null;
  }
}

// JSON响应辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
