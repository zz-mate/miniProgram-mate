// static/utils/index.ts

// 先手动声明缺失的类型（放在函数上方）
declare namespace WechatMiniprogram {
  // 版本检测回调结果类型
  interface OnCheckForUpdateCallbackResult {
    hasUpdate: boolean; // 是否有新版本
  }
  // 模态框成功回调结果类型
  interface ShowModalSuccessCallbackResult {
    confirm: boolean; // 用户是否点击确定
    cancel?: boolean; // 用户是否点击取消
  }
  // 更新管理器核心类型
  interface UpdateManager {
    onCheckForUpdate(callback: (res: OnCheckForUpdateCallbackResult) => void): void;
    onUpdateReady(callback: () => void): void;
    onUpdateFailed(callback: () => void): void;
    applyUpdate(): void;
  }
  interface Wx {
    getUpdateManager(): UpdateManager;
    showModal(options: {
      title: string;
      content: string;
      showCancel?: boolean;
      confirmText?: string;
      success?: (res: ShowModalSuccessCallbackResult) => void;
      fail?: (err: any) => void;
    }): void;
  }
}

/**
 * 微信小程序原生版本更新检测
 * @description 仅在微信小程序环境生效，适配原生微信小程序 API
 */
export function checkUpdateVersion(): void {
  if (typeof wx === 'undefined' || !wx.getUpdateManager) {
    console.warn('当前环境不支持微信小程序更新管理器');
    return;
  }

  try {
    // 类型断言为手动声明的 UpdateManager
    const updateManager = wx.getUpdateManager() as WechatMiniprogram.UpdateManager;

    updateManager.onCheckForUpdate((res: WechatMiniprogram.OnCheckForUpdateCallbackResult) => {
      console.log('版本检测结果：', res);
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启小程序？',
            success: (modalRes: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
              if (modalRes.confirm) {
                updateManager.applyUpdate();
              }
            },
            fail: (err) => {
              console.error('显示更新弹窗失败：', err);
            }
          });
        });

        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '更新失败',
            content: '新版本下载失败，请您删除当前小程序，重新搜索打开重试~',
            showCancel: false,
            confirmText: '知道了'
          });
        });
      }
    });
  } catch (error) {
    console.error('版本更新检测异常：', error);
  }
}