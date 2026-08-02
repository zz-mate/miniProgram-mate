
import { request } from '../utils/request';

/**
 * 获取当前用户账本列表
 */
export function getBookList() {
  return request({
    url: '/app/book/list',
    method: 'GET',
  });
}

/**
 * 获取账本详情
 * @param id 账本ID
 */
export function getBookInfo(id: string) {
  return request({
    url: `/app/book/${id}`,
    method: 'GET',
  });
}

/**
 * 创建账本
 * @param data 账本信息
 */
export function createBook(data: any) {
  return request({
    url: '/app/book',
    method: 'POST',
    data,
  });
}

/**
 * 更新账本
 * @param id 账本ID
 * @param data 账本信息
 */
export function updateBook(id: string, data: any) {
  return request({
    url: `/app/book/${id}`,
    method: 'PUT',
    data,
  });
}

/**
 * 删除账本
 * @param id 账本ID
 */
export function deleteBook(id: string) {
  return request({
    url: `/app/book/${id}`,
    method: 'DELETE',
  });
}

/**
 * 设为默认账本
 * @param id 账本ID
 */
export function setDefaultBook(id: string) {
  return request({
    url: `/app/book/${id}/default`,
    method: 'PUT',
  });
}
