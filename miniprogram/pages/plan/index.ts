Page({

  /**
   * 页面的初始数据
   */
  data: {
    effective_carts: [], // 有效列表
    startX: '',
    startY: '',
  },
  onLoad: function (options) {
  },
  onShow: function () {
    //获取购物车列表
    this.getCartsList()
  },
  getCartsList(){
    let cart1=[
      {
        "id":1,
        "goods_id":1,
        "selected":false,
        "goods_cover":'https://i.postimg.cc/Bn1XpkSn/susu.jpg',
        "goods_name":'固定背景图片的通常方法就是t设成fix,进一步的话自',
        "sale_price":236,
        "num":1,
      },
      {
        "id":2,
        "goods_id":2,
        "selected":false,
        "goods_cover":'https://i.postimg.cc/Bn1XpkSn/susu.jpg',
        "goods_name":'固定背景图片的通常方法就是把bac设成fix,进一步的话自',
        "sale_price":236,
        "num":6,
      },
    ];

    let carts=cart1;
    if (carts.length == 0) {
      for (var e = 0; e < carts.length; e++) {
        carts[e].status = true//status 为true 不会显示删除的滑动块
      }
      this.setData({
        effective_carts: carts,
      })
    } else {
      for (var e = 0; e < carts.length; e++) {
        carts[e].status = true//status 为true 不会显示删除的滑动块
      }
      this.setData({
        effective_carts: carts,
        isShow: true,//当有商品的时候展示商品 无的时候直接不显示
      })
    }
  },

  //触摸开始
  touchS(e) {
    for (let key in this.data.effective_carts) {
      this.data.effective_carts[key]['status'] = true;
    }
    this.setData({
      effective_carts: this.data.effective_carts,
    })
    // 获得起始坐标
    this.data.startX = e.touches[0].clientX;
    this.data.startY = e.touches[0].clientY;
  },
  //滑动
  touchM(e) {
    // 获得当前坐标
    var currentX = e.touches[0].clientX;
    var currentY = e.touches[0].clientY;
    const x = this.data.startX - currentX; //横向移动距离
    const y = Math.abs(this.data.startY - currentY); //纵向移动距离，若向左移动有点倾斜也可以接受
    var id = e.currentTarget.dataset.index;
    for (let key in this.data.effective_carts) {
      if (key == id) {
        if (x > 35 && y < 110) {
          //向左滑是显示删除
          this.data.effective_carts[key]['status'] = false;
        } else if (x < -35 && y < 110) {
          //向右滑
          this.data.effective_carts[key]['status'] = true;
        }
      }
    }
    this.setData({
      effective_carts: this.data.effective_carts,
    })
  },
  //删除商品 多选和全选
  deleteList(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
console.log(id)
  },

 
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //跳转到商品详情
  jumpDetail(e){
    let goodid = e.currentTarget.dataset.goodid
    wx.navigateTo({
      
    })
  },
  
  goConfirm(){
    var carts_id = []
    if (this.data.calculation > 0) {
      this.data.effective_carts.forEach(item => {
        if (item.selected == true) {
          carts_id.push(item.id)
        }
      })
      wx.navigateTo({
        
      })
    } else {
      showToast('您还木有选择商品哦', 'none')
    }
  }
})