import { getStorageSync, setStorageSync, getThisDate } from '../../../../utils/util';
const app = getApp();
let richText: any = null;  //富文本编辑器实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    readOnly: false, //编辑器是否只读
    placeholder: '开始编辑吧...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    if (!options.value) return false
    let memorandum = getStorageSync('memorandum') || []
    // 使用 find 方法查找对象
    let foundObject = memorandum.find(obj => obj.value == options.value);
    // console.log(foundObject);
    this.setData({
      value: options.value,
      title: options.title,
      html: foundObject
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 编辑器初始化完成时触发，可以获取组件实例
  onEditorReady() {
    console.log('[onEditorReady callback]')
    richText = this.selectComponent('#richText'); //获取组件实例
    if (this.data.html) {
      this.setContents(this.data.html.html)
      app.globalData.richTextTitle=this.data.html.title
      app.globalData.richTextContents = this.data.html.html
    }

  },

  //设置富文本内容
  setContents(html) {
    console.log(html);

    richText.editorCtx.setContents({
      html: html,
      success: res => {
        console.log('[setContents success]', res)
      }
    })
  },

  //撤销
  undo() {
    console.log('[undo callback]')
  },

  //恢复
  restore() {
    console.log('[restore callback]')
  },

  //清空编辑器内容
  clear() {
    this.editorCtx.clear({
      success: res => {
        console.log("[clear success]", res)
      }
    })
  },

  //清空编辑器事件
  clearBeforeEvent() {
    console.log('[clearBeforeEvent callback]')
    wx.showModal({
      cancelText: '取消',
      confirmText: '确认',
      content: '确认清空编辑器内容吗？',
      success: (result) => {
        if (result.confirm) {
          richText.clear();
        }
      },
      fail: (res) => { },
    })
  },

  //清空编辑器成功回调
  clearSuccess() {
    console.log('[clearSuccess callback]')
  },

  //清除当前选区的样式
  removeFormat() {
    this.editorCtx.removeFormat();
  },

  //插入图片
  insertImageEvent() {
    wx.chooseImage({
      count: 1,
      success: res => {
        let path = res.tempFilePaths[0];
        //调用子组件方法，图片应先上传再插入，不然预览时无法查看图片。
        richText.insertImageMethod(path).then(res => {
          console.log('[insert image success callback]=>', res)
        }).catch(res => {
          console.log('[insert image fail callback]=>', res)
        });
      }
    })
  },

  //保存，获取编辑器内容
  getEditorContent(res) {
    let {
      value
    } = res.detail;
    console.log(value);

    if (value.text == "\n") {
      wx.showToast({
        title: '或许忘记了什么?',
        icon: 'none',
      })
      return false
    }
    wx.showToast({
      title: '保存成功',
      icon: 'none',
    })

    // 当前页面传参有value就修改当前值
    if (this.data.value) {
      let memorandum = getStorageSync('memorandum');


      // 使用 findIndex 方法找到要替换的对象的索引
      const indexToReplace = memorandum.findIndex(obj => obj.value == this.data.value);
      // 检查是否找到了要替换的对象
      if (indexToReplace != -1) {
        // 使用 splice 方法替换数组中的对象
        let text = {
          title: app.globalData.richTextTitle,
          html: value.html,
          content: value.text,
          tags: ['工作', '会议'],
          value: new Date().getTime(),
          time: getThisDate() // 这里可能需要设置为当前时间或其他有效值
        };
        memorandum.splice(indexToReplace, 1, text);
        setStorageSync('memorandum',memorandum)
      } else {
        console.log(`No object found with id ${this.data.value}`);
      }
return false
    }


    // 尝试从存储中读取 memorandum
    let memorandum = getStorageSync('memorandum');
    // 如果 memorandum 不存在，则初始化为一个空数组
    if (!memorandum) {
      memorandum = [];
    }
    // 创建新的 text 对象
    let text = {
      title: app.globalData.richTextTitle,
      html: value.html,
      content: value.text,
      tags: ['工作', '会议'],
      value: new Date().getTime(),
      time: getThisDate() // 这里可能需要设置为当前时间或其他有效值
    };
    // 将新的 text 对象添加到 memorandum 数组中
    memorandum.push(text);
    // 将更新后的 memorandum 写回存储
    setStorageSync('memorandum', memorandum);
    console.log('[getEditorContent callback]=>', value.text)
    wx.navigateBack({delta:1})
  },

  //show文本工具栏
  showTextTool() {
    this.setData({
      textTool: !this.data.textTool
    })
  },

  //编辑器聚焦时触发
  bindfocus(res) {
    let {
      value
    } = res.detail;
    // console.log('[bindfocus callback]=>', value)
  },

  //编辑器失去焦点时触发
  bindblur(res) {
    let {
      value
    } = res.detail;
    // console.log('[bindblur callback]=>', value)
  },

  //编辑器输入中时触发
  bindinput(res) {
    let {
      value
    } = res.detail;
    // console.log('[bindinput callback]=>', value)
    app.globalData.richTextContents = value.detail.html;
    console.log(app);
  },
  // 标题
  bindtitleinput(res) {
    console.log(res);

    let {
      value
    } = res.detail;
    console.log('[bindinput callback]=>', value)
    app.globalData.richTextTitle = value.detail.value;
    console.log(app);
  },

  //预览富文本
  preview() {
    if (!app.globalData.richTextTitle) {
      wx.showToast({
        title: '还没有填写内容',
        icon: 'none',
      })
      return false
    }
    wx.navigateTo({
      url: `../memorandumPreview/index`,
    })
  }
})