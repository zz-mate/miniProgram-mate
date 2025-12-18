
Component({
  externalClasses: ['container-class', 'item-class', 'dot-class'],
  properties: {
    value: {
      type: String,
      value: ''
    },
    /** 一次滚动耗时 单位ms */
    duration: {
      type: Number,
      value: 1600
    },
    /** 每个数字之间的延迟滚动 */
    delay: {
      type: Number,
      value: 200
    }
  },
  data: {
    showNumber:'',
   
    valArr: [],
    aniArr: [],  // 动画列表，和valArr对应
    numArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // 所有数字
    itemHeight: 0 , // 数字项的高度

  },
  observers: {
    value: function (newVal) {
      // 监听value变化，格式化为valArr
      let valArr = []
      if (newVal) {
        valArr = newVal.split('').map(o => {
          return { val: o, isNaN: isNaN(o)}
        })
      }
      this.setData({
        valArr: valArr
      },()=>{
        this.getNumberHeight()
        this.animateNumber(newVal)
      })

   
    }
  },
  methods: {

    // let  showNumber=0

    animateNumber(target, durationInSeconds=1.6) {
      let current = 0;
      const durationInMilliseconds = durationInSeconds * 1000; // 将秒转换为毫秒
      const frameRate = 16; // 每帧的间隔时间（毫秒）
      const totalFrames = Math.ceil(durationInMilliseconds / frameRate); // 计算总帧数
      const incrementPerFrame = (target - current) / totalFrames; // 计算每帧的增量
    
      const interval = setInterval(() => {
        current += incrementPerFrame;
        if (current >= target) {
          current = target; // 确保最终值为目标值
          clearInterval(interval); // 清除定时器
        }
        // 假设this.setData是更新UI的方法，比如在小程序中使用
        this.setData({
          showNumber: Math.ceil(current) // 使用Math.ceil来确保数字是整数，但注意这可能会导致动画结束时稍微跳跃
        });
      }, frameRate);
    },
  


    /** 计算数字高度 */
    getNumberHeight() {
      console.log(this.data.itemHeight > 0);
      if (this.data.itemHeight > 0) {
        this.startScrollAni()
        return false
      }

      let query = this.createSelectorQuery();
      query.select('.number-item').boundingClientRect().exec((res) => {
        if(res && !res[0]) return
        this.setData({
          itemHeight: res[0].height
        })
        this.startScrollAni()
      })
    },
    /** 开始滚动动画 */
    startScrollAni() {
      if (this.data.itemHeight <= 0) return

      const aniArr = []
      this.data.valArr.forEach((item, index) => {
        if(!item.isNaN) {
          // 得到滚动动画到该数字的距离
          aniArr.push(`transition-delay: ${this.data.delay * index}ms; top: ${-this.data.itemHeight * (this.data.numArr[parseInt(item.val)] + 10)}px;`)
          
        } else {
          aniArr.push(null)
        }
      })
      this.setData({
        aniArr: aniArr,
      })
  

  
    }
  }
})

