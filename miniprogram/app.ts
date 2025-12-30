// app.ts
import { jscode2session, getUserInfo, saveUser } from "./api/user";
import { checkUpdateVersion } from './utils/updateVersion';
import { setToken } from './utils/config';
import { setStorageSync, getStorageSync } from './utils/util';



App<IAppOption>({
  globalData: {
    systemInfo: null,
    richTextContents: '',
    richTextTitle: '',
    userInfo: undefined
  },
  loginSuccessCallback: null,
  isLoginInProgress: false,  // 初始：未在登录
  isLoginCompleted: false,   // 初始：未登录完成

  onLaunch() {
    checkUpdateVersion();
    wx.getSystemInfo({
      success: (res) => {
        if (res.platform === 'windows') {
          setTimeout(() => {
            wx.showModal({
              title: '提示',
              content: '暂不支持电脑版',
              success(res) {
                if (res.confirm) wx.exitMiniProgram();
              }
            });
          }, 3000);
        }
        this.globalData.systemInfo = res;
        this.globalData.systemInfo.autoheight = res.safeArea.top + 44;
      }
    });
  },


  // 登录方法：加锁避免重复登录
  async login(): Promise<void> {
    // 防止重复登录
    if (this.isLoginInProgress) return;
    if (this.isLoginCompleted) {
      console.log('已登录，无需重复登录');
      // 登录已完成但有回调，直接执行
      if (this.loginSuccessCallback) {
        this.loginSuccessCallback();
        this.loginSuccessCallback = null;
      }
      return;
    }

    this.isLoginInProgress = true;
    try {
      // 先查本地token，有则直接标记完成
      const token = getStorageSync('token');
      if (token) {
        this.isLoginCompleted = true;
        this.isLoginInProgress = false;
        // 执行回调
        if (this.loginSuccessCallback) {
          this.loginSuccessCallback();
          this.loginSuccessCallback = null;
        }
        return;
      }

      // 1. 微信登录
      const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });

      // 2. 换openid
      const wxRes = await jscode2session({ code: loginRes.code });
      if (!wxRes.data?.openid) throw new Error('获取openid失败');

      // 3. 保存用户信息拿token
      const res = await saveUser({ openid: wxRes.data.openid });
      if (res.data.code !== 0) throw new Error(`保存用户信息失败：${res.data.msg}`);

      // 4. 存储token和用户信息
      setToken(res.data.data.token);
      const userInfoRes = await getUserInfo();
      setStorageSync('userInfo', userInfoRes.data);
      this.globalData.userInfo = userInfoRes.data;

      // 标记登录完成
      this.isLoginCompleted = true;
      console.log('登录成功，当前回调：', this.loginSuccessCallback);

      // 执行回调（核心：此时回调已经由组件注册）
      if (typeof this.loginSuccessCallback === 'function') {
        try {
          this.loginSuccessCallback();
          console.log('回调执行成功！');
        } catch (err) {
          console.error('回调执行出错：', err);
        } finally {
          this.loginSuccessCallback = null;
        }
      }

      // wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '登录失败';
      console.error('登录异常：', errMsg);
      wx.showToast({ title: errMsg, icon: 'none' });
    } finally {
      this.isLoginInProgress = false; // 解除登录锁
    }
  },

  // 注册回调：无论登录状态，先存回调，再触发登录
  onLoginSuccess(callback: () => void): void {
    if (typeof callback !== 'function') {
      console.warn('回调必须是函数');
      return;
    }

    // 第一步：先存回调（不管登录状态）
    this.loginSuccessCallback = callback;
    console.log('已注册回调，准备触发登录');

    // 第二步：触发登录（此时回调已存，登录成功就能拿到）
    this.login();
  }
});