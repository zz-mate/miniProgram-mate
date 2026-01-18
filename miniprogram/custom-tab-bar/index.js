import { playBtnAudio } from '../utils/audioUtil'; // 引入音频工具
Component({
  data: {
    height: '80px',
    selected: 0,
    isShow: true,
    color: "#999999",
    selectedColor: "#000000",
    // 新增：控制中间按钮动画的开关
    isMiddleBtnAnimate: false,
    list: [{
      pagePath: "/pages/index/index",
      text: "流水",
      badge: ''
    },
    {
      pagePath: "/pages/plan/index",
      text: "计划",
      badge: ''
    },
    {
      pagePath: "/subPackages/pages/transaction/add/index",
      iconPath: "http://oss-api.zz-mate.cn/uploads/2026/01/1768562444954-f762cdf1-0cc7-4607-977d-9ad0630d25b1.png",
      selectedIconPath: "https://env-00jxubueh4pn.normal.cloudstatic.cn/miniProgram/%E5%8F%91%E5%B8%83.png",
      badge: ''
    },
    {
      pagePath: "/pages/statement/index",
      text: "报表",
      badge: ''
    },
    {
      pagePath: "/pages/mine/index",
      text: "我的",
      badge: ''
    }
    ],
    // 保存跳转前的选中状态
    preSelected: 0
  },
  attached() {
    // 根据渲染模式设置高度
    if (this.renderer == 'webview' && this.data.height !== '50px') {
      this.setData({ height: '50px' });
    } else if (this.renderer == 'skyline' && this.data.height !== '80px') {
      this.setData({ height: '80px' });
    }

    // 初始化第三个按钮样式
    this.updateSecondBtnBySelected();

    // 监听页面显示事件（返回页面时触发）
    this.pageShowListener = wx.onAppRoute(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      // 判断当前页面是否是tabBar相关页面
      const isTabPage = this.data.list.some(item =>
        currentPage.route === item.pagePath.replace(/^\//, '')
      );

      // 如果是tab页面且有预存的选中状态，恢复
      if (isTabPage && this.data.preSelected !== 0) {
        this.setData({
          selected: this.data.preSelected
        }, () => {
          this.updateSecondBtnBySelected();
          // 恢复状态时也触发中间按钮动画
          this.triggerMiddleBtnAnimate();
        });
        // 清空预存状态
        this.setData({ preSelected: 0 });
      }
    });
  },
  detached() {
    // 移除监听，防止内存泄漏
    if (this.pageShowListener) {
      this.pageShowListener.off();
    }
  },
  methods: {
    // 触发中间按钮动画
    triggerMiddleBtnAnimate() {
      // 先开启动画
      this.setData({ isMiddleBtnAnimate: true });
      // 动画结束后关闭，保证下次切换能重新触发
      setTimeout(() => {
        this.setData({ isMiddleBtnAnimate: false });
      }, 800); // 时长和动画时长保持一致（0.8s）
    },

    // 根据selected状态更新索引2的按钮样式
    updateSecondBtnBySelected() {
      let list = JSON.parse(JSON.stringify(this.data.list));
      const oldPath = list[2].pagePath;

      if (this.data.selected === 1) {
        // 选中状态为1（计划页），修改索引2的按钮为计划添加页样式
        list[2] = {
          ...list[2],
          pagePath: "/subPackages/pages/plan/add/index",
          iconPath: "http://oss-api.zz-mate.cn/uploads/2026/01/1768562317260-f4421b8a-6113-4f4a-b50f-a51f74ca2efb.png",
          selectedIconPath: "http://oss-api.zz-mate.cn/uploads/2026/01/1768562317260-f4421b8a-6113-4f4a-b50f-a51f74ca2efb.png"
        };
      } else {
        // 非计划页，恢复索引2的按钮为交易添加页样式
        list[2] = {
          ...list[2],
          pagePath: "/subPackages/pages/transaction/add/index",
          iconPath: "http://oss-api.zz-mate.cn/uploads/2026/01/1768562444954-f762cdf1-0cc7-4607-977d-9ad0630d25b1.png",
          selectedIconPath: "http://oss-api.zz-mate.cn/uploads/2026/01/1768562444954-f762cdf1-0cc7-4607-977d-9ad0630d25b1.png"
        };
      }

      // 只有当路径变化时才触发动画（避免重复触发）
      if (oldPath !== list[2].pagePath) {
        this.setData({ list }, () => {
          this.triggerMiddleBtnAnimate();
        });
      } else {
        this.setData({ list });
      }
    },

    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;

      // 防止重复点击同一tab（索引2按钮除外）
      if (index !== 2 && index === this.data.selected) return;

      wx.vibrateShort({ type: 'light' });
      playBtnAudio('/static/audio/btnaudio.mp3', 1000);

      // 处理索引2按钮的特殊跳转逻辑
      if (index === 2) {
        // 保存跳转前的选中状态
        this.setData({ preSelected: this.data.selected });

        const token = wx.getStorageSync('token') || null;
        if (!token) {
          wx.navigateTo({ url: "/pages/login/index" });
        } else {
          const bookInfo = wx.getStorageSync('bookInfo');
          // 使用当前list中索引2的真实路径跳转
          const realUrl = this.data.list[2].pagePath + "?bookId=" + bookInfo.id;
          wx.navigateTo({
            url: realUrl,
            routeType: "wx://upwards"
          });
        }
        return;
      }

      // 其他tab按钮正常更新选中状态
      this.setData({ selected: index }, () => {
        this.updateSecondBtnBySelected();
      });

      // 正常跳转tab页
      wx.switchTab({ url: url });
    }
  }
});