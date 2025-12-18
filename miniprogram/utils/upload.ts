// utils/upload.ts

import { BASE_URL, getToken } from './config';

export interface UploadFileOptions {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, string>;
  showLoading?: boolean;
}

export function uploadFile(options: UploadFileOptions): Promise<any> {
  const {
    url,
    filePath,
    name = 'file',
    formData = {},
    showLoading = true,
  } = options;

  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: '上传中...', mask: true });
    }

    wx.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      formData,
      header: {
        Authorization: `Bearer ${getToken()}`,
      },
      success(res) {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(res.data)); // 注意返回是字符串
          } catch (e) {
            reject(e);
          }
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({ title: '上传异常', icon: 'none' });
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
