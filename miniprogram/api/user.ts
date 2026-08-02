
import { request } from '../utils/request';

/**
 * 获取用户信息
 * @returns 返回一个 Promise，resolve 的结果是用户信息对象
 */
export function wxLogin(data: { code: string }) {
  return request({
    url: '/app/auth/wx-login',
    method: 'POST',
    data,
  });
}


export function  userInfoApi() {
  return request({
    url: '/app/auth/user-info',
    method: 'GET',
  });
}
