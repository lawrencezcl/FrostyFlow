const webpack = require('webpack');

module.exports = function override(config) {
  // 添加 fallback 用于 Node.js 核心模块
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "os": false,
    "crypto": false,
    "stream": false,
    "http": false,
    "https": false,
    "zlib": false,
    "url": false,
  };

  // 忽略源映射警告
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};