/**  
 * 设置tabBar的当前选中项。  
 * @param {number} index - 当前需要选中的tab的下标默认0。  
 */
export const setTabBarIndex = (index = 0) => {
  const curPages = getCurrentPages();
  const currentPage = curPages[0];

  if (currentPage && typeof currentPage.getTabBar === 'function') {
    const tabBar = currentPage.getTabBar();
    if (tabBar) {
      // 构造setData对象  
      const setDataObj = {
        selected: index,
      };
      // 调用setData更新tabBar  
      tabBar.setData(setDataObj);

    }
  } else {
    // 如果当前页面没有tabBar或getTabBar不是函数，则打印警告或进行其他错误处理  
    console.warn('当前页面没有tabBar或getTabBar不是函数，无法设置tabBar的选中项和徽标。');
  }
}


/**
 * 设置tabBar的当前右上角的徽标文本。  
 * @param {number} index - 当前需要选中的tab的下标。  
 * @param {string} [badge=''] - 需要显示在tab右上角徽标位置的文本，默认为空字符串。  
 */
export const setTabBarBadge = (index: Number) => {
  const curPages = getCurrentPages();
  const currentPage = curPages[0];

  if (currentPage && typeof currentPage.getTabBar === 'function') {
    const tabBar = currentPage.getTabBar();
    if (tabBar) {
      // 构造setData对象  
      const setDataObj = {
        selected: index,
      };
      // 调用setData更新tabBar  
      tabBar.setData(setDataObj);

    }
  } else {
    // 如果当前页面没有tabBar或getTabBar不是函数，则打印警告或进行其他错误处理  
    console.warn('当前页面没有tabBar或getTabBar不是函数，无法设置tabBar的选中项和徽标。');
  }
}


/**
   * 设置tabBar的显隐。
   * @param {Boolean} isShow - 是否显示TabBar 
   */
export const showHideTabBar = (isShow = false) => {
  const curPages = getCurrentPages();
  const currentPage = curPages[0];

  if (currentPage && typeof currentPage.getTabBar === 'function') {
    const tabBar = currentPage.getTabBar();
    if (tabBar) {
      // 构造setData对象  
      const setDataObj = {
        isShow
      };
      // 调用setData更新tabBar  
      tabBar.setData(setDataObj);
    }
  } else {
    // 如果当前页面没有tabBar或getTabBar不是函数，则打印警告或进行其他错误处理  
    console.warn('当前页面没有tabBar或getTabBar不是函数，无法设置tabBar的选中项和徽标。');
  }
}