/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    systemInfo: any;
    richTextContents: string;
    richTextTitle: string;
    userInfo?: WechatMiniprogram.UserInfo; // 补充 userInfo 类型
  };
	loginSuccessCallback?: (() => void) | null;
  isLoginInProgress: boolean; // 新增：标记是否正在登录
  isLoginCompleted: boolean;  // 标记是否登录完成
  onLaunch(): void;
  login(): Promise<void>;
  onLoginSuccess(callback: () => void): void;
}