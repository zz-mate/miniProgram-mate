/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    systemInfo:any,
    richTextContents:string,
    richTextTitle:string,
    abc:string
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  ccc():Number
}