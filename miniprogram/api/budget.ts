
import { request } from '../utils/request';

/**
 * 获取用户信息
 * @returns 返回一个 Promise，resolve 的结果是用户信息对象
 */
export function budgetInfo(data:any) {
  return request({
    url: '/miniProgram/budget/info',
    method: 'POST',
    data,
  });
}
export function createBudget(data:any) {
  return request({
    url: '/miniProgram/budget/create',
    method: 'POST',
    data,
  });
}

export function deletBudget(data:any) {
  return request({
    url: '/miniProgram/budget/category/delete',
    method: 'POST',
    data,
  });
}
export function removebudget(data:any) {
  return request({
    url: '/miniProgram/budget/remove',
    method: 'POST',
    data,
  });
}

