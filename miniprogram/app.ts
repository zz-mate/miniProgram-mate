// app.ts
import { setStorageSync, getStorageSync } from './utils/util';
import { wxLogin, userInfoApi } from './api/user';

interface IAppOption {
	globalData: {
		userInfo: any;
		systemInfo: any;
	};
	isReady: boolean;
}

App<IAppOption>({
	globalData: {
		userInfo: undefined,
		systemInfo: null,
	},
	isReady: false,

	onLaunch() {
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

		// 检查本地token
		const token = getStorageSync('token');
		if (token) {
			const userInfo = getStorageSync('userInfo');
			this.globalData.userInfo = userInfo;
			// 有token则获取用户信息
			this.getUserInfo();
		} else {
			// 无token则登录
			this.login();
		}
	},

	async login(): Promise<void> {
		try {
			// 1. 微信登录获取code
			const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
				wx.login({ success: resolve, fail: reject });
			});

			// 2. 调用接口换取token
			const res = await wxLogin({ code: loginRes.code });
			console.log(res)
			if (res.code === 200 && res.data) {
				// 3. 存储token
				setStorageSync('token', res.data.token);
				// 4. 获取用户信息
				await this.getUserInfo();
			} else {
				throw new Error(res.message || '登录失败');
			}
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : '登录失败';
			console.error('登录异常：', errMsg);
		}
	},

	async getUserInfo(): Promise<void> {
		try {
			const res = await userInfoApi();
			if (res.code === 200 && res.data) {
				setStorageSync('userInfo', res.data);
				this.globalData.userInfo = res.data;
				// 通知页面初始化完成
				this.isReady = true;
				const pages = getCurrentPages();
				pages.forEach(page => {
					if (page.onAppReady) {
						page.onAppReady();
					}
				});
			}
		} catch (error) {
			console.error('获取用户信息异常：', error);
		}
	}
});
