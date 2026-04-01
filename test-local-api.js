// 本地测试脚本 - 测试抖音去水印 API
const axios = require('axios');

const testApi = async () => {
  console.log('🧪 开始测试抖音去水印 API...\n');

  const testCases = [
    {
      url: 'https://www.douyin.com/video/7123456789',
      name: '测试用例1：普通视频ID'
    },
    {
      url: 'https://v.douyin.com/7123456789/',
      name: '测试用例2：短链接格式'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试：${testCase.name}`);
    console.log(`URL：${testCase.url}`);
    console.log('='.repeat(60));

    try {
      const response = await axios.post('http://localhost:3000/api/douyin/remove-watermark', {
        url: testCase.url
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('\n✅ 请求成功！');
      console.log(`状态码：${response.status}`);
      console.log(`响应数据：`);
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log(`\n🎉 去水印成功！`);
        console.log(`使用方法：${response.data.method}`);
        console.log(`视频地址：${response.data.url}`);
      } else {
        console.log('\n❌ 去水印失败');
        console.log(`尝试的方法：${response.data.methods.join(', ')}`);
      }
    } catch (error) {
      console.error('\n❌ 请求失败！');
      if (error.response) {
        console.error(`状态码：${error.response.status}`);
        console.error(`错误信息：${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error('无法连接到服务器，请确保后端服务正在运行：');
        console.error('cd backend && npm start');
      } else {
        console.error(`错误信息：${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));
};

// 运行测试
testApi();
