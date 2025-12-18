
import { request } from '../utils/request';

/**
 * 获取用户信息
 * @returns 返回一个 Promise，resolve 的结果是用户信息对象
 */
export function login(data: { phone: string }) {
  return request({
    url: '/miniProgram/auth/loginByPhone',
    method: 'POST',
    data,
  });
}
export function getUserInfo() {
  return request({
    url: '/miniProgram/auth/userInfo',
    method: 'GET',

  });
}

export function getUserById(data:{userId:string}) {
  return request({
    url: '/miniProgram/user/info',
    method: 'POST',
    data,
  });
}


// 你还可以在这里封装其他用户相关的 API，例如：
// export function login(data: { username: string; password: string }) {
//   return request({
//     url: '/user/login',
//     method: 'POST',
//     data,
//   });
// }
//
// export function updateUserInfo(data: any) {
//   return request({
//     url: '/user/update',
//     method: 'PUT',
//     data,
//   });
// }