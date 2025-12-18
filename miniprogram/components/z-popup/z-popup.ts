// components/z-popup/z-popup.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    showTitle:{
      type:String,
      value:"",
    },
    show: {
      // 控制弹框显隐
      type: Boolean,
      value: false,
      observer: "watchShow"
    },
    closeOnClickOverlay: {
      // 是否遮罩层不可点击
      type: Boolean,
      value: false
    },
    mode: {
      // 弹出层方向
      type: String,
      value: 'center'//left(默认屏幕50%宽度，插槽自行撑开)、top、right、bottom(默认屏幕25%高度，插槽自行撑开，预留底部tababr高度 skyline 80px webview 50px)、center

    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    hidden: false,
    title:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    watchShow(newV: Boolean) {
      if (newV) {

        this.setData({
          hidden: false
        })

      } else {
        this.setData({
          hidden: true
        })
  
        setTimeout(() => {
          this.setData({
            hidden: false
          })
        }, 300);

      }


    },
    handlePopup() {
      if (!this.data.closeOnClickOverlay) {
        this.triggerEvent('popup', { delta: this.data.show,type: this.data.showTitle||''}, {})
      }

    },
    closeOnClickOverlay() {

      if (this.data.closeOnClickOverlay) {
        this.triggerEvent('closeOnClickOverlay', { delta: this.data.show ,type: this.data.showTitle||''}, {})
      }
    

    },
    stopPropagation(e) {
      e.stopPropagation();
    }
  }
})