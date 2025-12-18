/**
 * 系统配置文件
 * 包含胶囊高度、状态栏高度等系统信息配置
 */

interface SystemInfo {
  statusBarHeight: number;
  menuButtonInfo: {
    height: number;
    width: number;
    top: number;
    left: number;
    right: number;
  };
  platform: string;
  windowHeight: number;
  screenHeight: number;
}

interface CapsuleConfig {
  capsuleHeight: number;      // 胶囊高度
  capsuleWidth: number;       // 胶囊宽度
  capsuleTop: number;         // 胶囊顶部距离
  capsuleBottom: number;      // 胶囊底部距离
  statusBarHeight: number;    // 状态栏高度
  navBarHeight: number;       // 导航栏高度
  isIOS: boolean;             // 是否为iOS设备
  isAndroid: boolean;         // 是否为Android设备
}

class SystemConfig {
  private static instance: SystemConfig;
  private systemInfo: SystemInfo | null = null;
  private capsuleConfig: CapsuleConfig | null = null;

  private constructor() {
    this.initSystemInfo();
  }

  public static getInstance(): SystemConfig {
    if (!SystemConfig.instance) {
      SystemConfig.instance = new SystemConfig();
    }
    return SystemConfig.instance;
  }

  /**
   * 初始化系统信息
   */
  private initSystemInfo(): void {
    try {
      this.systemInfo = wx.getSystemInfoSync();
      this.calculateCapsuleConfig();
    } catch (error) {
      // console.error('获取系统信息失败:', error);
      this.systemInfo = {
        statusBarHeight: 0,
        menuButtonInfo: {
          height: 32,
          width: 87,
          top: 0,
          left: 0,
          right: 0
        },
        platform: '',
        windowHeight: 0,
        screenHeight: 0
      };
    }
  }

  /**
   * 计算胶囊配置信息
   */
  private calculateCapsuleConfig(): void {
    if (!this.systemInfo) return;

    const { statusBarHeight, menuButtonInfo, platform } = this.systemInfo;
    
    // 计算导航栏高度（适配不同设备）
    let navBarHeight = 44; // 默认值
    
    if (platform === 'ios') {
      // iOS设备的特殊处理
      if (menuButtonInfo) {
        navBarHeight = menuButtonInfo.top + menuButtonInfo.height + 8;
      }
    } else if (platform === 'android') {
      // Android设备的特殊处理
      if (menuButtonInfo) {
        navBarHeight = menuButtonInfo.top + menuButtonInfo.height + 8;
      }
    }

    this.capsuleConfig = {
      capsuleHeight: menuButtonInfo?.height || 32,
      capsuleWidth: menuButtonInfo?.width || 87,
      capsuleTop: menuButtonInfo?.top || 0,
      capsuleBottom: menuButtonInfo?.top + (menuButtonInfo?.height || 32),
      statusBarHeight,
      navBarHeight,
      isIOS: platform === 'ios',
      isAndroid: platform === 'android'
    };
  }

  /**
   * 获取胶囊配置信息
   */
  public getCapsuleConfig(): CapsuleConfig {
    if (!this.capsuleConfig) {
      this.initSystemInfo();
    }
    
    return this.capsuleConfig || {
      capsuleHeight: 32,
      capsuleWidth: 87,
      capsuleTop: 0,
      capsuleBottom: 32,
      statusBarHeight: 0,
      navBarHeight: 44,
      isIOS: false,
      isAndroid: false
    };
  }

  /**
   * 获取胶囊高度
   */
  public getCapsuleHeight(): number {
    return this.getCapsuleConfig().capsuleHeight;
  }

  /**
   * 获取导航栏高度
   */
  public getNavBarHeight(): number {
    return this.getCapsuleConfig().navBarHeight;
  }

  /**
   * 获取状态栏高度
   */
  public getStatusBarHeight(): number {
    return this.getCapsuleConfig().statusBarHeight;
  }

  /**
   * 获取设备类型
   */
  public getDeviceType(): { isIOS: boolean; isAndroid: boolean } {
    const config = this.getCapsuleConfig();
    return {
      isIOS: config.isIOS,
      isAndroid: config.isAndroid
    };
  }

  /**
   * 重新获取系统信息（用于页面重新计算）
   */
  public refreshSystemInfo(): void {
    this.systemInfo = null;
    this.capsuleConfig = null;
    this.initSystemInfo();
  }

  /**
   * 获取安全区域信息
   */
  public getSafeAreaInset(): { top: number; bottom: number } {
    if (!this.systemInfo) {
      return { top: 0, bottom: 0 };
    }

    try {
      const { safeArea } = wx.getSystemInfoSync();
      return {
        top: safeArea.top,
        bottom: this.systemInfo.screenHeight - safeArea.bottom
      };
    } catch (error) {
      // console.error('获取安全区域信息失败:', error);
      return { top: 0, bottom: 0 };
    }
  }
}

export default SystemConfig.getInstance();