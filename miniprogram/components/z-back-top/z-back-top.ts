// components/z-back-top/z-back-top.ts
const { shared, spring } = wx.worklet
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false,
      observer:'watchShow'
    }

  },
  // 组件生命周期(新)
  lifetimes: {
    attached: function() {
      this.offset = shared(-40);
      this.applyAnimatedStyle(".backTop", () => {
        "worklet";
        return {
          right: `${this.offset.value}px`,
          
        };
      });
      // 在组件实例进入页面节点树时执行
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    animationData:{}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    watchShow(newVal:Boolean, oldVal:Boolean){
      if(newVal){
       this.offset.value=spring(20)
      }else{
        this.offset.value=spring(-40)
      }
    },
    handleTop(){
      this.triggerEvent('backTop')
    }
  }
})