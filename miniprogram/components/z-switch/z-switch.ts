/**
 * date: 2018/7/5
 * Auth: luochan 
 * 自定义switch
 * 默认颜色为绿色，组件宽70rpx,高48rpx
 * 自定义时需要传入height,width,bgColor,checked四个字段
 */
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
			//传入宽高和选中的样式
			bgColor: {
					type: String,
					value: "#1AAD19"
			},
			unBgColor: {
					type: String,
					value: '#fff'
			},
			width: {
					type: String,
					value: "70",
					observer: function () {

					}
			},
			height: {
					type: String,
					value: "48"
			},
			//切换时发生
			checked: {
					type: Boolean,
					value: false,
			}
	},

	/**
	 * 组件的初始数据
	 */
	data: {

	},
	ready: function () {


	},
	attached: function () {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
			changeCheck: function () {
					var that = this;
					this.triggerEvent('change', {
							checked: !this.data.checked,
							//成功时的回调
							success: function () {
									that.setData({
											checked: !that.data.checked
									})
							},
							//失败的回调
							error: function () {
									console.log("switch切换失败")
							}
					});
			}
	}
})
