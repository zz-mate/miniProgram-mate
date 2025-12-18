// utils/request.ts

import { BASE_URL, DEFAULT_HEADER, getToken } from './config';

interface RequestOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
  timeout?: number;
}

export function request<T = any>(options: RequestOptions<T>): Promise<T> {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = false,
    timeout = 10000,
  } = options;

  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        ...DEFAULT_HEADER,
        ...header,
        Authorization: `Bearer ${getToken()}`, // 添加 token
      },
      timeout,
      success(res) {
        // console.log(res,"xxx")
        if (res.statusCode === 200) {
          resolve(res.data);
        }
        // else if(res.statusCode==401){
        //   wx.clearStorageSync()
          
        // } 
        else {
          wx.showToast({ title: `错误 ${res.statusCode}`, icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      },
      complete() {
        if (showLoading) {
          wx.hideLoading();
        }
      },
    });
  });
}
