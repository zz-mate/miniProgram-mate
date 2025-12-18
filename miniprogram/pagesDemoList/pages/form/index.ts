import WxValidate from "../../../utils/WxValidate";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      companyName: '',
      creditCode: '',
      applyName: '',
      idcardCode: ''
    },
    errorMsg: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '表单验证'
    });

    //验证规则函数
    this.initValidate();
  },
  // bindinput
  handleInput(e) {
    const { name } = e.currentTarget.dataset;
    let obj = {
      ...this.data.form,
      [name]: e.detail.value
    }
    this.setData({
      form: { ...obj }
    })

  },
  // params: {},
  handleBlur(e) {
    const { name } = e.currentTarget.dataset;
    /* 由于 checkForm 是返回所有的错误信息，所以需要筛选，当错误信息中有一条是与
     * name 一样的则是验证不成功
    */
    let errorMsg = this.data.errorMsg || {};
    if (!this.WxValidate.checkForm({ [name]: this.data.form[name] })) {
      const error = this.WxValidate.errorList;
      let index = error.findIndex(v => {
        return v.param == name;
      })
      if (index > -1) {
        errorMsg[name] = error[index];
        this.setData({
          errorMsg
        })
      } else {
        delete errorMsg[name];
        this.setData({
          errorMsg
        })
      }
      return false
    } else {
      console.log('可以')
    }
  },

  // 提示 
  showToast(error) {
    wx.showToast({
      title: error.msg,
      icon: 'none',
      duration: 1500,
      mask: false,
    });
  },

  //验证函数
  initValidate() {
    const rules = {
      companyName: {
        required: true,
        moocheck1: true
      },
      creditCode: {
        required: true,
        moocreditcode: true
      },
      applyName: {
        required: true,
        moocheck1: true
      },
      idcardCode: {
        required: true,
        idcard: true
      },
    }
    const messages = {
      companyName: {
        required: '请填写公司名称',
        moocheck1: '请输入正确的公司名称'
      },
      creditCode: {
        required: '请输入统一社会信用代码',
        moocreditcode: '请输入正确的统一社会信用代码'
      },
      applyName: {
        required: '请输入申请人姓名',
        moocheck1: '请输入正确的申请人姓名'
      },
      idcardCode: {
        required: '请输入申请人身份证号码',
        idcard: '请输入正确的申请人身份证号码'
      },
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  // 调用验证函数
  formSubmit: function (e) {
    this.setData({
      errorMsg: {}
    })
    const params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList;
      this.showToast(error[0]);
      let errorMsg = {};
      error.forEach(v => {
        errorMsg[v.param] = v
      })
      this.setData({
        errorMsg
      })
      return false
    } else {

    }
    this.showToast({
      msg: '提交成功'
    })
  },
})
