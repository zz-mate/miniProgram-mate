import {
	COLOR
} from '../utils/color.js';

Component({
	data: {
		height: '80px',
		selected: 0,
		isShow: true,
		color: "#999999",
		selectedColor: "#0000000",
		list: [{
				pagePath: "/pages/home/index",
				// iconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/%E9%BB%98%E8%AE%A4%E5%8D%A0%E4%BD%8D%E5%9B%BE.png?expire_at=1764260147&er_sign=65fb2b3aacb3f58524e031a6f1bc6a5c",
				// selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/占位图.png?expire_at=1764260519&er_sign=40f5410d993a60cc1533a1f89d5047ab",
				text: "流水",
				badge: ''
			},
			{
				pagePath: "/pages/plan/index",
				// iconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/%E9%BB%98%E8%AE%A4%E5%8D%A0%E4%BD%8D%E5%9B%BE.png?expire_at=1764260147&er_sign=65fb2b3aacb3f58524e031a6f1bc6a5c",
				// selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/占位图.png?expire_at=1764260519&er_sign=40f5410d993a60cc1533a1f89d5047ab",
				text: "计划",
				badge: ''
			},
			{
				pagePath: "/subPackages/pages/transaction/add/index",
				iconPath: "/static/imgs/publish.png",
				selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/miniProgram/%E5%8F%91%E5%B8%83.png",
				// text: "账户",
				badge: ''
			},
			{
				pagePath: "/pages/statement/index",
				// iconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/%E9%BB%98%E8%AE%A4%E5%8D%A0%E4%BD%8D%E5%9B%BE.png?expire_at=1764260147&er_sign=65fb2b3aacb3f58524e031a6f1bc6a5c",
				// selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/占位图.png?expire_at=1764260519&er_sign=40f5410d993a60cc1533a1f89d5047ab",

				text: "报表",
				badge: ''
			},
			{
				pagePath: "/pages/mine/index",
				// iconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/%E9%BB%98%E8%AE%A4%E5%8D%A0%E4%BD%8D%E5%9B%BE.png?expire_at=1764260147&er_sign=65fb2b3aacb3f58524e031a6f1bc6a5c",
				// selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/占位图.png?expire_at=1764260519&er_sign=40f5410d993a60cc1533a1f89d5047ab",
				text: "我的",
				badge: ''
			}
		]
	},
	attached() {
		if (this.renderer == 'webview') {
			if (this.data.height == '50px') return

			this.setData({
				height: '50px'
			})

		}
		if (this.renderer == 'skyline') {
			if (this.data.height == '80px') return
			this.setData({
				height: '80px'
			})

		}


	},

	methods: {
		switchTab(e) {
			const data = e.currentTarget.dataset
			const url = data.path

			//防止重复点击
			if (data.index == this.data.selected) {
				return false
			}
			if(data.index==2){
				// wx.navigateTo({
				// 	url: "/subPackages/pages/transaction/add/index?bookIndex=" + 1 + '&date=' + '2025-12-12 23:56',
				// 	routeType: "wx://upwards"
				// })
				const token = wx.getStorageSync('token') || null
				if (!token) {
					wx.navigateTo({
						url: "/pages/login/index"
					})
				} else {
					const userInfo = wx.getStorageSync('userInfo') || null
					wx.vibrateShort({ type: 'heavy' })
					wx.navigateTo({
						url: "/subPackages/pages/transaction/add/index?bookId=" + userInfo.default_book_id,
						routeType: "wx://upwards"
					})
				}
				return
			}
			this.setData({
				selected: data.index,
			})
			wx.vibrateShort({
				type: 'light'
			})

			wx.switchTab({
				url: url
			})
		}
	}
})