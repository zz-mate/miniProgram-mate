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
				pagePath: "/pages/index/index",
				// iconPath: "/static/icon/icon-Placeholder-image.png",
				// selectedIconPath: "/static/icon/icon-Placeholder-image.png",
				text: "流水",
				badge: ''
			},
			{
				pagePath: "/pages/plan/index",
				// iconPath: "/static/icon/icon-Placeholder-image.png",
				// selectedIconPath: "/static/icon/icon-Placeholder-image.png",
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
				// iconPath: "/static/icon/icon-Placeholder-image.png",
				// selectedIconPath: "/static/icon/icon-Placeholder-image.png",

				text: "报表",
				badge: ''
			},
			{
				pagePath: "/pages/mine/index",
				// iconPath: "/static/icon/icon-Placeholder-image.png",
				// selectedIconPath: "/static/icon/icon-Placeholder-image.png",
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
			wx.vibrateShort({ type: 'heavy' })
			//防止重复点击
			if (data.index == this.data.selected) {
				return false
			}
			if(data.index==2){
				const token = wx.getStorageSync('token') || null
				if (!token) {
					wx.navigateTo({
						url: "/pages/login/index"
					})
				} else {
					const bookInfo = wx.getStorageSync('bookInfo')
		
					wx.navigateTo({
						url: "/subPackages/pages/transaction/add/index?bookId=" + bookInfo.id,
						routeType: "wx://upwards"
					})
				}
				return
			}
			this.setData({
				selected: data.index,
			})
			wx.switchTab({
				url: url
			})
		}
	}
})