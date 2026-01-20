// utils/config.ts
const accountInfo = wx.getAccountInfoSync();
const miniProgramEnv = accountInfo.miniProgram.envVersion;

// 各环境配置
const envConfig = {
  release: { // 正式版（生产环境）
    BASE_URL: 'https://api.zz-mate.cn/api/v1',
  },
  trial: { // 体验版（测试环境）
    BASE_URL: 'https://api-dev.zz-mate.cn/api/v1',
  },
  develop: { // 开发版（本地开发环境）
    BASE_URL: 'http://192.168.1.65:9876/api/v1',
		// BASE_URL: 'https://api.zz-mate.cn/api/v1',
  },
};

// 导出当前环境的基础URL（默认兜底到生产环境）
export const BASE_URL = envConfig[miniProgramEnv]?.BASE_URL || envConfig.release.BASE_URL;
console.log(BASE_URL)
export const DEFAULT_HEADER = {
  'Content-Type': 'application/json',
	'Accept': 'application/json' // 可选，增强兼容性
};

export function getToken(): string {
  // 假设从本地获取缓存 token
  return wx.getStorageSync('token') || '';
}
// 设置 token
export function setToken(token: string): void {
  // 将 token 存入本地缓存
  wx.setStorageSync('token', token);
}

// 清除 token
export function clearToken(): void {
  // 从本地缓存中移除 token
  wx.removeStorageSync('token');
}