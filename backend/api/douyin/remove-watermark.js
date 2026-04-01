export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.method === 'GET' ? req.query.url : req.body?.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // 提取抖音链接
    const douyinUrl = extractDouyinUrl(url);
    if (!douyinUrl) {
      return res.status(400).json({ error: 'Invalid Douyin URL' });
    }

    // 获取视频 ID
    const videoId = await getVideoId(douyinUrl);
    if (!videoId) {
      return res.status(404).json({ error: 'Cannot extract video ID' });
    }

    // 获取视频信息
    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return res.status(404).json({ error: 'Cannot get video info' });
    }

    return res.status(200).json({
      success: true,
      url: videoInfo.url,
      title: videoInfo.title,
      author: videoInfo.author,
      method: 'iesdouyin-api'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * 从文本中提取抖音链接
 */
function extractDouyinUrl(text) {
  const patterns = [
    /https?:\/\/v\.douyin\.com\/[\w-]+\/?/,
    /https?:\/\/www\.douyin\.com\/video\/\d+/,
    /https?:\/\/www\.iesdouyin\.com\/share\/video\/\d+/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return null;
}

/**
 * 从 URL 获取视频 ID
 */
async function getVideoId(url) {
  // 长链接直接提取
  const longMatch = url.match(/video\/(\d+)/);
  if (longMatch) return longMatch[1];

  // 短链接需要解析重定向
  if (url.includes('v.douyin.com')) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36'
        }
      });

      const finalUrl = response.url;
      const match = finalUrl.match(/video\/(\d+)/);
      if (match) return match[1];

      // 尝试从 iesdouyin 提取
      const iesMatch = finalUrl.match(/share\/video\/(\d+)/);
      if (iesMatch) return iesMatch[1];

    } catch (error) {
      console.error('Error resolving short URL:', error);
    }
  }

  return null;
}

/**
 * 获取视频信息
 */
async function getVideoInfo(videoId) {
  const apiUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
      'Referer': 'https://www.douyin.com/'
    }
  });

  const data = await response.json();

  if (data.status_code !== 0 || !data.item_list || data.item_list.length === 0) {
    return null;
  }

  const item = data.item_list[0];
  let videoUrl = item.video?.play_addr?.url_list?.[0];

  if (!videoUrl) {
    return null;
  }

  // 去除水印参数
  videoUrl = videoUrl.replace('playwm', 'play');
  videoUrl = videoUrl.replace(/&watermark=1/g, '&watermark=0');
  videoUrl = videoUrl.replace(/watermark=1/g, 'watermark=0');

  return {
    url: videoUrl,
    title: item.desc || '',
    author: item.author?.nickname || ''
  };
}
