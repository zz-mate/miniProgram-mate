// utils/config.ts

export const BASE_URL = 'http://192.168.1.57:9875/api/v1';
// export const BASE_URL = 'http://39.107.158.249:9877/api/v1';
// export const BASE_URL = 'https://api-dev.zz-mate.cn/api/v1';
// export const BASE_URL = 'http://39.107.158.249:9875/api/v1';
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