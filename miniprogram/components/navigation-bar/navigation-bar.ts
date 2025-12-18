import { setTabBarBadge } from '../../utils/tabbar'

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    auto:{
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1
    },
    // 自定义居中插槽宽度
    customCenterWidth: {
      type: String,
      value: 'auto'
    },
    // 是否显示自定义居中插槽
    showCustomCenter: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
    customCenterStyle: ''
  },
  lifetimes: {
    attached() {
    //  判断是否有上层页面
    const pages = getCurrentPages();
      // console.log(pages,this);
      if(this.data.auto && pages && pages.length==1){
        this.setData({
          back:false,
          homeButton:true
        })
      }else if(this.data.auto && pages && pages.length>1){
        this.setData({
          back:true,
          homeButton:false
        })
      }
      
      
      const rect = wx.getMenuButtonBoundingClientRect()
      wx.getSystemInfo({
        success: (res) => {
          const isAndroid = res.platform === 'android'
          const isDevtools = res.platform === 'devtools'
          this.setData({
            ios: !isAndroid,
            innerPaddingRight: `padding-right: ${res.windowWidth - rect.left}px`,
            leftWidth: `min-width: ${res.windowWidth - rect.left }px`,
            safeAreaTop: isDevtools || isAndroid ? `height: calc(var(--height) + ${res.safeArea.top}px); padding-top: ${res.safeArea.top}px` : ``,
          })
        }
      })
      
      // 初始化自定义居中插槽样式
      this._initCustomCenterStyle();
    },
  },
  
  observers: {
    'customCenterWidth, showCustomCenter': function(customCenterWidth, showCustomCenter) {
      this._initCustomCenterStyle();
    }
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show: boolean) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${
          show ? '1' : '0'
        };transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      
      
      this.setData({
        displayStyle
      })
    },
    
    // 初始化自定义居中插槽样式
    _initCustomCenterStyle() {
      const { customCenterWidth, showCustomCenter } = this.data;
      let customCenterStyle = '';
      
      if (showCustomCenter) {
        customCenterStyle = `width: ${customCenterWidth}; display: flex;`;
      } else {
        customCenterStyle = 'display: none;';
      }
      
      this.setData({
        customCenterStyle
      });
    },
    
    back() {
      const data = this.data
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta
        })
      }
      this.triggerEvent('back', { delta: data.delta }, {})
    },
    home() {
      setTabBarBadge(0)
      wx.switchTab({
        url:'/pages/home/index'
      })
      this.triggerEvent('home', {}, {})
    }
  },
  
})