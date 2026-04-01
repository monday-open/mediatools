// 测试 API
const axios = require('axios');

async function test() {
  try {
    // 使用真实的抖音视频ID
    const response = await axios.post('http://localhost:3000/api/douyin/remove-watermark', {
      url: 'https://www.douyin.com/video/7123456789'
    });
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
