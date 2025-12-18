//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        navData:[
            {
                text: '科技'
            },
            {
                text: '音乐节目'
            },
            {
                text: '美食'
            },
            {
                text: '文化节目'
            },
            {
                text: '财经'
            },
            {
                text: '手工'
            },
            {
                text: '关注'
            },
            {
                text: '推荐'
            },
            {
                text: '电影'
            },
            {
              text: '科技'
          }
        ],
        currentTab: 0,
        navScrollLeft: 0,
        lineLeft:0,
        active:0,
    },

    onscrollupdate(e){
      'worklet'
      console.log(e);
      const obLineLeft = this.obLineLeft.bind(this)
wx.worklet.runOnJS(obLineLeft)(e.detail.scrollLeft)
      
    },
    obLineLeft(e){
this.setData({
  lineLeft:e - this.data.lineLeft
})
    },
    handleChange(e){
      console.log(e);
      this.setData({
        active:e.detail.delta.sub
      })
    },
    //事件处理函数
    onLoad: function () {
      const query = wx.createSelectorQuery();
      query.select('.active').boundingClientRect().exec((res) => {
        console.log(res);
        this.setData({
          lineLeft:res[0].left,
          lineWidth:res[0].width
         })
      }); 

      　const selector = wx.createSelectorQuery().selectAll('.nav-item');  
      selector.boundingClientRect(res=>{  
      //  获取tabs距离顶部的高度
        console.log(res);
        
        
      }).exec()

      var that = this;
 
      wx.getSystemInfo({
          success: (res) => {
              this.setData({
                  pixelRatio: res.pixelRatio,
                  windowHeight: res.windowHeight,
                  windowWidth: res.windowWidth
              })
          },
      })       
    },
/*tips
计算出tabs的总长度 --   获取当前视口宽度

滚动一个tab 就是 当前tab的宽度距离
*/

    switchNav(event){
      
        var cur = event.currentTarget.dataset.current; 
        if (this.data.currentTab == cur) {
          return false;
      } else {
          this.setData({
              currentTab: cur
          },()=>{
            // 获取当前元素距离左侧的距离
            const query = wx.createSelectorQuery();
            query.select('.active').boundingClientRect().exec((res) => {
              console.log(res);
              this.setData({
                lineLeft:res[0].left,
                lineWidth:res[0].width,
             
               })
            }); 
          })
      }
   


        console.log(cur);
        
    

        //每个tab选项宽度占1/5
        var singleNavWidth = 78;

        let left=(cur - 2 <=0?0:cur - 2  ) * singleNavWidth 

            if(left>=390){
              this.setData({
                navScrollLeft: 390
            })       
            }else{
              //tab选项居中         
              this.setData({
                navScrollLeft: left
            })        
            }

        
         
   
    },
    switchTab(event){
        // var cur = event.detail.current;
        // var singleNavWidth = this.data.windowWidth / 5;
        // this.setData({
        //     currentTab: cur,
        //     navScrollLeft: (cur - 2) * singleNavWidth
        // });
    }
})