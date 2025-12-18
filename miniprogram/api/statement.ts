
import { request } from '../utils/request';

/**
 * 收支 筛选数据
 * @returns 
 */
export function getFilter_date(data:any) {
  return request({
    url: '/miniProgram/statement/filter_date',
    method: 'POST',
    data,
  });
}
