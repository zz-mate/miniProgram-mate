
import { getAccountList } from '../../api/account'
import { getStorageSync, setStorageSync } from '../../utils/util';
import { COLOR } from '../../utils/color.js';
import SystemConfig from '../../utils/capsule';
Page({

  /**
   * 页面的初始数据
   */
  data: {
		eyeIndex:1,
    asset_sum: '0.00',
    liability_sum: '0.00',
    net_assets: '0.00',
    accountList: [],
    navBgColor: COLOR.white,
    show: false,
			// fakNavBarHeight: 0,
			navBarHeight: 0,
			statusBarHeight: 0,
			deviceType: '',

  },
	handleEye(evt) {
		console.log(evt)
		const { eye } = evt.currentTarget.dataset
		// const { summary } = this.data
		this.setData({
			eyeIndex: eye == 1 ? 2 : 1,
			// 'summary.expendTotalMoney': eye == 1 ? '****' :'0.00'|| summary.expendTotalMoney,
			// 'summary.incomeTotalMoney': eye == 1 ? '****' : '0.00'|| summary.incomeTotalMoney,
			// 'summary.surplusTotalMoney': eye == 1 ? '****' :'0.00'||  summary.surplusTotalMoney
		})

	},
  /**
   * 获取账户列表
   */
  async handleAccountList() {
    let userInfo = wx.getStorageSync('userInfo')
    let data = {
      userId: userInfo.id
    }
    let res = await getAccountList(data)
		console.log(res)
    this.setData({
      total_asset: res.asset_stats.total_asset,
      net_asset: res.asset_stats.net_asset,
      total_debt: res.asset_stats.total_debt,
      accountList: res.list
    })
  },
  // 创建账户
  handleAccountAdd() {
    const token = getStorageSync('token')
		wx.vibrateShort({ type: 'heavy' })
    if (!token) {
      wx.navigateTo({
        url: "/pages/login/index"
      })
    } else {
      // this.setData({
      //   show: !this.data.show
      // })
			wx.navigateTo({
        url: "/subPackages/pages/account/list/index"
      })
    }
  },
  handlePhone() {
    this.setData({
      show: !this.data.show
    })
  },
  handlePopup() {
    console.log(1);

    this.setData({
      show: !this.data.show
    })
  },
  handleCloseOverlay(e: any) {
    console.log(e);

    this.setData({
      show: !this.data.show
    })

  },
			//  初始化系统配置
			initSystemConfig() {
				const capsuleConfig = SystemConfig.getCapsuleConfig();
				const safeAreaInset = SystemConfig.getSafeAreaInset();
				this.setData({
					capsuleHeight: capsuleConfig.capsuleHeight,
					navBarHeight: capsuleConfig.navBarHeight,
					statusBarHeight: capsuleConfig.statusBarHeight,
				
				});
			},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
		this.initSystemConfig();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const token = getStorageSync('token')
    if (!token) return
    this.handleAccountList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})