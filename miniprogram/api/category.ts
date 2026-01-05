
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

export function cateBindBill(data:any) {
  return request({
    url: '/miniProgram/category/cateBindBill',
    method: 'POST',
    data,
  });
}
export function deleteCate(data:any) {
  return request({
    url: '/miniProgram/category/deleteCate',
    method: 'POST',
    data,
  });
}
export function getDeleteListCategoryList(data:any) {
  return request({
    url: '/miniProgram/category/getDeletList',
    method: 'POST',
    data,
  });
}
export function removeListCategoryList(data:any) {
  return request({
    url: '/miniProgram/category/removelist',
    method: 'POST',
    data,
  });
}
export function categoryBillList(data:any) {
  return request({
    url: '/miniProgram/category/cateBillList',
    method: 'POST',
    data,
  });
}