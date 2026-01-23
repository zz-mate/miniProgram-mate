
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
export function getBookUserList(data?:any) {
  return request({
    url: '/miniProgram/book/userList',
    method: 'POST',
    data,
  });
}
export function shareCreate(data?:any) {
  return request({
    url: '/miniProgram/share/create',
    method: 'POST',
    data,
  });
}
export function joinBook(data?:any) {
  return request({
    url: '/miniProgram/book/join',
    method: 'POST',
    data,
  });
}
export function validateQrCode(data?:any) {
  return request({
    url: '/miniProgram/share/qrcode/validate',
    method: 'POST',
    data,
  });
}

export function generateCode(data?:any) {
  return request({
    url: '/miniProgram/share/qrcode/generate',
    method: 'POST',
    data,
  });
}



export function bookBill(data?:any) {
  return request({
    url: '/miniProgram/book/bookBill',
    method: 'POST',
    data,
  });
}
export function remove(data?:any) {
  return request({
    url: '/miniProgram/book/remove',
    method: 'POST',
    data,
  });
}

export function removeshareUs(data?:any) {
  return request({
    url: '/miniProgram/share/removeshareUs',
    method: 'POST',
    data,
  });
}
export function removeMutiBook(data?:any) {
  return request({
    url: '/miniProgram/share/removeMutiBook',
    method: 'POST',
    data,
  });
}
