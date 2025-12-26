// app.ts
App<IAppOption>({
  globalData: {
    systemInfo: null,
    richTextContents:'',
    richTextTitle:'',
    abc: '2'
  },
  onLaunch() {


    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    wx.getSystemInfo({
      success: (res) => {
        // console.log(res,res.platform);
        if(res.platform=='windows'){
         
          setTimeout(()=>{
            wx.showModal({
              title: '提示',
              content: '暂不支持电脑版',
              success (res) {
                if (res.confirm) {
                  wx.exitMiniProgram()
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          
          },3000)
        }
        this.globalData.systemInfo = res
        this.globalData.systemInfo.autoheight=res.safeArea.top+44
      }
    })
    // 登录
    // wx.login({
    //   success: res => {
    //     console.log(res.code)
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   },
    // })
    
  },
  ccc() {
    return 3
  }
})