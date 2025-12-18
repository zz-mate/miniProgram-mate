
import { request } from '../utils/request';

/**
 * 获取账单列表
 */
export function getTransactionList(data:any) {
  return request({
    url: '/miniProgram/bill/list',
    method: 'POST',
    data,
  });
}
/**
 * 创建账单
 */
export function createTransaction(data:any) {
  return request({
    url: '/miniProgram/bill/create',
    method: 'POST',
    data,
  });
}
/**
 * 账单详情
 */
export function transactionInfo(data:any) {
  return request({
    url: '/miniProgram/bill/info',
    method: 'POST',
    data,
  });
}
/**
 * 删除账单
 */
export function removeTransaction(data:any) {
  return request({
    url: '/miniProgram/bill/remove',
    method: 'POST',
    data,
  });
}

/**
 * 日期查询账单
 */
export function filterDateTransaction(data:any) {
  return request({
    url: '/miniProgram/calendar/billByMonth',
    method: 'POST',
    data,
  });
}
