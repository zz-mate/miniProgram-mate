
import { request } from '../utils/request';

/**
 * 获取用户信息
 * @returns 返回一个 Promise，resolve 的结果是用户信息对象
 */
export function getCategoryList(data:any) {
  return request({
    url: '/miniProgram/category/list',
    method: 'POST',
    data,
  });
}
