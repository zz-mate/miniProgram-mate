
import { request } from '../utils/request';


export function getAccountList(data:any) {
  return request({
    url: '/miniProgram/account/list',
    method: 'POST',
    data,
  });
}
export function getAccountCategoryList(data:any) {
  return request({
    url: '/miniProgram/account/category/list',
    method: 'POST',
    data,
  });
}

export function getAccountIndexCategoryList(data:any) {
  return request({
    url: '/miniProgram/account/category/accountAllList',
    method: 'POST',
    data,
  });
}
