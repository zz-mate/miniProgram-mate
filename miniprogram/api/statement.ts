
import { request } from '../utils/request';

/**
 * 收支 筛选数据
 * @returns 
 */
export function getBillByMonthChart(data:any) {
  return request({
    url: '/miniProgram/calendar/billByMonthChart',
    method: 'POST',
    data,
  });
}
