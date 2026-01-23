// utils/request.ts
import { BASE_URL, DEFAULT_HEADER, getToken } from './config';

// 定义请求选项接口
interface RequestOptions<T = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
  timeout?: number;
  // 新增：是否显示错误提示（某些场景不需要自动提示）
  showErrorToast?: boolean;
  // 新增：是否忽略 Token（比如登录接口）
  ignoreToken?: boolean;
  // 新增：自定义Notify组件的id（默认值和你页面中定义的保持一致）
  notifyId?: string;
}

// 定义响应数据接口（规范后端返回格式）
interface ResponseData<T = any> {
  code?: number; // 业务状态码
  data?: T;
  message?: string; // 业务提示信息（优先使用后端返回的）
  success?: boolean; // 请求是否成功
}

/**
 * 获取自定义Notify组件实例
 * @param notifyId 组件id，默认值需和页面中定义的一致
 */
const getNotifyInstance = (notifyId = 'customNotify') => {
  // 获取当前页面栈的最后一个页面（当前活跃页面）
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (!currentPage) return null;
  
  // 获取组件实例
  return currentPage.selectComponent(`#${notifyId}`);
};

/**
 * 显示自定义Notify提示
 * @param options 提示配置
 */
const showNotify = (options: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
	position?:string;
  notifyId?: string;
}) => {
  const { message, type = 'error', duration = 2000, notifyId } = options;
  const notify = getNotifyInstance(notifyId);
  
  if (notify) {
    // 调用自定义Notify组件的showNotify方法
    notify.showNotify({
      message,
      type,
      duration
    });
  } else {
    // 降级：组件不存在时使用原生toast
    wx.showToast({
      title: message,
      icon: 'none',
      duration
    });
  }
};

export function request<T = any>(options: RequestOptions<T>): Promise<ResponseData<T>> {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = false,
    timeout = 10000,
    showErrorToast = true,
    ignoreToken = false,
    notifyId = 'customNotify' // 默认组件id
  } = options;

  return new Promise((resolve, reject) => {
    // 加载中提示
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    // 构建请求头
    const requestHeader = {
      ...DEFAULT_HEADER,
      ...header
    };
    // 非忽略 Token 时添加认证信息
    if (!ignoreToken) {
      const token = getToken();
      if (token) {
        requestHeader.Authorization = `Bearer ${token}`;
      }
    }

    // 发起请求
    const requestTask = wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: requestHeader,
      timeout,
      success(res) {
        const { statusCode, data: responseData } = res;
        
        // 1xx 信息响应：直接resolve
        if (statusCode >= 100 && statusCode < 200) {
          resolve(responseData);
        }

        // 2xx 成功响应：直接返回后端数据，不做任何自定义处理
        else if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData);
        }

        // 3xx/4xx/5xx 非成功响应：使用自定义Notify展示提示
        else {
          // 核心：优先取后端返回的message，无则用极简兜底提示
          const msg = responseData?.message || `请求失败`;
          
          // 仅在需要显示提示时展示（使用自定义Notify）
          if (showErrorToast) {
            // 根据状态码区分Notify类型
            let notifyType: 'success' | 'error' | 'warning' | 'info' = 'error';
            if (statusCode === 401 || statusCode === 403) {
              notifyType = 'warning';
            } else if (statusCode >= 500) {
              notifyType = 'error';
            } else if (statusCode >= 400) {
              notifyType = 'warning';
            }

            showNotify({
              message: msg,
              type: notifyType,
              duration: 2000,
              notifyId
            });
          }

          // 特殊处理：401 Token失效 - 仅做跳转，提示用后端返回的msg
          if (statusCode === 401) {
            wx.clearStorage();
            setTimeout(() => {
              wx.redirectTo({ url: '/pages/login/login' });
            }, 1500);
          }

          // reject时透传完整信息：状态码 + 后端msg + 后端返回数据
          reject({ 
            statusCode, 
            msg: msg, 
            data: responseData 
          });
        }
      },
      fail(err) {
        // 网络错误：使用自定义Notify展示提示
        const errMsg = err.errMsg || '请求失败'; // 注意：微信小程序错误对象是errMsg，不是message
        const msg = errMsg.includes('timeout') ? '请求失败' : '请求失败';
        
        if (showErrorToast) {
          showNotify({
            message: msg,
            type: 'error',
            duration: 2000,
						position:'bottom',
            notifyId
          });
        }
        
        // 透传网络错误信息
        reject({ 
          statusCode: 0, 
          msg: msg, 
          err: err 
        });
      },
      complete() {
        // 关闭加载中提示
        if (showLoading) {
          wx.hideLoading();
        }
      },
    });

    // 可选：返回请求任务，支持取消请求
    return requestTask;
  });
}

// 封装常用请求方法
export const http = {
  get<T = any>(url: string, options: Omit<RequestOptions<T>, 'url' | 'method'> = {}) {
    return request<T>({ url, method: 'GET', ...options });
  },
  post<T = any>(url: string, data: any, options: Omit<RequestOptions<T>, 'url' | 'method' | 'data'> = {}) {
    return request<T>({ url, method: 'POST', data, ...options });
  },
  put<T = any>(url: string, data: any, options: Omit<RequestOptions<T>, 'url' | 'method' | 'data'> = {}) {
    return request<T>({ url, method: 'PUT', data, ...options });
  },
  delete<T = any>(url: string, options: Omit<RequestOptions<T>, 'url' | 'method'> = {}) {
    return request<T>({ url, method: 'DELETE', ...options });
  }
};