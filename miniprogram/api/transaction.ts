
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
 * 月查询账单
 * 2025-12
 */
export function filterMonthTransaction(data:any) {
  return request({
    url: '/miniProgram/calendar/billByMonth',
    method: 'POST',
    data,
  });
}
/**
 * 日期查询账单
 * 2025-12-19
 */
export function filterDateTransaction(data:any) {
  return request({
    url: '/miniProgram/calendar/billByDate',
    method: 'POST',
    data,
  });
}
