
import { request } from '../utils/request';

/**
 * 获取用户信息
 * @returns 返回一个 Promise，resolve 的结果是用户信息对象
 */
export function getBookList(data:any) {
  return request({
    url: '/miniProgram/book/list',
    method: 'POST',
    data,
  });
}
export function getBookInfo(data:any) {
  return request({
    url: '/miniProgram/book/info',
    method: 'POST',
    data,
  });
}
export function createBook(data:any) {
  return request({
    url: '/miniProgram/book/create',
    method: 'POST',
    data,
  });
}
export function updateBook(data:any) {
  return request({
    url: '/miniProgram/book/update',
    method: 'POST',
    data,
  });
}

export function getBookCagetgoryList(data?:any) {
  return request({
    url: '/miniProgram/book/category/list',
    method: 'POST',
    data,
  });
}