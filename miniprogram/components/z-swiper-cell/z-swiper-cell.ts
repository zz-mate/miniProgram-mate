// components/z-swiper-cell/z-swiper-cell.ts
const {
  shared,
  spring,
  timing,
  Easing,
  runOnUI } = wx.worklet;
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    index:{
      type:null,
      value:null
    }
  },
  lifetimes: {
    attached: function() {
      let x = shared(0);
      this.applyAnimatedStyle('.swiper_cell_container', () => {
          'worklet';
          return {
              transform: `translateX(${x.value}px)`,
          };
      });
      this.x = x;


    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    startX:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    touchStart(e){
      // console.log(e);
      this.setData({
        startX: e.changedTouches[0].clientX,
      })
      
    },
    touchEnd(e){
      // console.log(e);
      
      let startX = this.data.startX;
      let current = e.changedTouches[0].clientX;
      let offset  = Math.floor(current - startX);
      // console.log(offset);
      const offsetX = this.offsetX.bind(this)
      if (offset < -30){
        runOnUI(offsetX)(-60)
      }else if(offset>30){ 
        runOnUI(offsetX)(0)
      }
    },

    offsetX(e:any){
      "worklet"
      this.x.value =  timing(e, {
        duration: 200,
        easing: Easing.ease
      })
    }
    ,
    handleDelete(e){
      const offsetX = this.offsetX.bind(this)
      runOnUI(offsetX)(0)
      setTimeout(()=>{
        this.triggerEvent("delete",{index:this.data.index})
      },300)
     
    }
    // ongesture(evt){
    //   "worklet"
    //   console.log(evt.deltaX);
    //   if(evt.deltaX>0){
    //     this.x.value = spring(0);
      
    //   }else{
    //     this.x.value = spring(-60);
    //   }
     
    // }
  }
})