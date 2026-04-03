// 抖音去水印 API（使用创信API）
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
      // 使用创信API解析抖音视频
      const response = await fetch(`https://apis.jxcxin.cn/api/douyin?url=${encodeURIComponent(douyinUrl)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
        },
      });

      const data = await response.json();

      if (data.code !== 200) {
        return jsonResponse({ error: data.msg || '解析失败', code: 500 }, 500);
      }

      // 解析返回的数据
      const result = data.data;

      return jsonResponse({
        success: true,
        data: {
          title: result.title || '',
          cover: result.cover || '',
          video_url: result.url || '',
          music_url: result.music?.url || '',
          author: result.author || '',
          like_count: result.like || 0,
          comment_count: 0,
          share_count: 0,
        }
      });

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: '解析失败: ' + error.message, code: 500 }, 500);
    }
  },
};

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
