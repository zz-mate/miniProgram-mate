/**
 * 解决播放延迟的音频工具（TypeScript 版）
 * 核心：预加载音频 + 缓存音频上下文 + 提前初始化
 */
interface AudioDefaultConfig {
  autoplay: boolean;
  loop: boolean;
  obeyMuteSwitch: boolean;
  defaultPlayTime: number;
  defaultSrc: string;
}

interface AudioPlayOptions {
  src?: string;
  playTime?: number;
  loop?: boolean;
}

// 音频缓存池：预加载的音频上下文缓存
interface AudioCacheItem {
  ctx: InnerAudioContext;
  loaded: boolean; // 是否加载完成
}

class AudioUtil {
  private static instance: AudioUtil;
  private defaultConfig: AudioDefaultConfig;
  private audioCache: Record<string, AudioCacheItem> = {}; // 音频缓存池
  private currentSrc: string = ''; // 当前播放的音频路径
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (AudioUtil.instance) return AudioUtil.instance;

    // 默认配置
    this.defaultConfig = {
      autoplay: false,
      loop: false,
      obeyMuteSwitch: false,
      defaultPlayTime: 1000,
      defaultSrc: '/static/audio/click.mp3'
    };

    // 初始化时就预加载默认音频（解决首次播放延迟）
    this.preloadAudio(this.defaultConfig.defaultSrc);
    AudioUtil.instance = this;
  }

  /**
   * 预加载音频（核心优化：提前加载，避免播放时才加载）
   * @param src 音频路径
   */
  preloadAudio(src: string): void {
    if (!src || this.audioCache[src]) return; // 已缓存则跳过

    const ctx = wx.createInnerAudioContext();
    ctx.autoplay = false;
    ctx.loop = false;
    ctx.src = src;

    // 设置iOS静音播放（只设置一次）
    wx.setInnerAudioOption({
      obeyMuteSwitch: this.defaultConfig.obeyMuteSwitch,
      fail: (err) => console.error('音频配置失败：', err)
    });

    // 监听音频加载完成事件
    ctx.onCanplay(() => {
      this.audioCache[src] = { ctx, loaded: true };
      console.log(`音频 ${src} 预加载完成`);
    });

    // 加载失败处理
    ctx.onError((err) => {
      console.error(`音频 ${src} 加载失败：`, err);
      this.audioCache[src] = { ctx, loaded: false };
    });

    // 先缓存（标记为未加载），避免重复创建
    this.audioCache[src] = { ctx, loaded: false };
  }

  /**
   * 获取音频上下文（优先用缓存）
   * @param src 音频路径
   */
  private getAudioCtx(src: string): InnerAudioContext | null {
    // 未缓存则先预加载，同步返回上下文（后续加载完成后可播放）
    if (!this.audioCache[src]) {
      this.preloadAudio(src);
    }

    const cacheItem = this.audioCache[src];
    return cacheItem ? cacheItem.ctx : null;
  }

  /**
   * 停止当前播放的音频
   */
  private stopCurrentAudio(): void {
    if (this.currentSrc && this.audioCache[this.currentSrc]) {
      const ctx = this.audioCache[this.currentSrc].ctx;
      ctx.stop();
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 快捷播放（支持变量传入，无延迟）
   * @param audioSrc 音频路径变量（可选）
   */
  play(audioSrc?: string): void {
    const src = audioSrc || this.defaultConfig.defaultSrc;
    this.playCustom({ src });
  }

  /**
   * 自定义播放（核心优化：复用缓存，无延迟）
   * @param options 播放配置变量
   */
  playCustom(options: AudioPlayOptions = {}): void {
    const {
      src = this.defaultConfig.defaultSrc,
      playTime = this.defaultConfig.defaultPlayTime,
      loop = this.defaultConfig.loop
    } = options;

    // 停止之前的播放
    this.stopCurrentAudio();

    // 获取缓存的音频上下文
    const ctx = this.getAudioCtx(src);
    if (!ctx) return;

    // 更新当前播放状态
    this.currentSrc = src;
    ctx.loop = loop;

    // 核心：如果音频已加载完成，直接播放；未加载则等加载完成后播放
    const playHandler = () => {
      ctx.play();
      // 自动停止逻辑
      if (playTime > 0) {
        this.timer = setTimeout(() => {
          this.stopCurrentAudio();
        }, playTime);
      }
    };

    const cacheItem = this.audioCache[src];
    if (cacheItem.loaded) {
      playHandler(); // 已加载，立即播放（无延迟）
    } else {
      // 未加载完成，监听加载完成后播放
      ctx.onCanplayOnce(playHandler);
    }
  }

  /**
   * 手动停止播放
   */
  stop(): void {
    this.stopCurrentAudio();
  }

  /**
   * 预加载多个音频（页面初始化时调用，提前加载所有需要的音频）
   * @param srcList 音频路径列表
   */
  preloadAudioList(srcList: string[]): void {
    srcList.forEach(src => this.preloadAudio(src));
  }

  /**
   * 销毁缓存（页面卸载时调用）
   */
  destroy(): void {
    this.stopCurrentAudio();
    // 销毁所有缓存的音频上下文
    Object.keys(this.audioCache).forEach(src => {
      this.audioCache[src].ctx.destroy();
    });
    this.audioCache = {};
    this.currentSrc = '';
    AudioUtil.instance = null as unknown as AudioUtil;
  }
}

// 微信小程序类型声明
declare global {
  namespace WechatMiniprogram {
    interface Wx {
      createInnerAudioContext: () => InnerAudioContext;
      setInnerAudioOption: (option: {
        obeyMuteSwitch: boolean;
        success?: (res: Record<string, any>) => void;
        fail?: (err: Record<string, any>) => void;
      }) => void;
    }
  }

  interface InnerAudioContext {
    autoplay: boolean;
    loop: boolean;
    src: string;
    play: () => void;
    stop: () => void;
    destroy: () => void;
    onCanplay: (callback: () => void) => void;
    onCanplayOnce: (callback: () => void) => void; // 单次监听加载完成
    onError: (callback: (err: Record<string, any>) => void) => void;
  }
}

export default new AudioUtil();