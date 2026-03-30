#!/bin/bash

echo "========================================"
echo "MediaTools API 测试脚本"
echo "========================================"
echo ""

echo "[1/3] 测试 POST 方法（应该返回 JSON）..."
curl -X POST https://mediatools-api.vercel.app/api/douyin/remove-watermark \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://www.douyin.com/video/7234567890123456789\"}"
echo ""

echo "[2/3] 测试 GET 方法（应该返回 405）..."
curl -X GET https://mediatools-api.vercel.app/api/douyin/remove-watermark
echo ""

echo "[3/3] 测试无效链接..."
curl -X POST https://mediatools-api.vercel.app/api/douyin/remove-watermark \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"invalid-url\"}"
echo ""

echo "========================================"
echo "测试完成！"
echo "========================================"
echo ""
