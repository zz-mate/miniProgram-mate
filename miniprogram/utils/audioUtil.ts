/**
 * 简易按钮音效播放函数
 * @param audioPath 音频路径
 * @param playDuration 播放时长（默认1秒）
 */
export function playBtnAudio(audioPath: string, playDuration = 1000) {
  // 创建音频上下文（每次调用新建，适合单次使用场景）
  const innerAudioContext = wx.createInnerAudioContext();
  innerAudioContext.autoplay = false;
  innerAudioContext.loop = false;

  // 兼容iOS静音
  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    success: () => {},
    fail: (e) => console.error('音频配置失败：', e)
  });

  // 播放逻辑
  innerAudioContext.src = audioPath;
  innerAudioContext.play();

  // 播放1秒后停止并销毁上下文
  innerAudioContext.onPlay(() => {
    setTimeout(() => {
      innerAudioContext.stop();
      innerAudioContext.destroy(); // 销毁上下文释放资源
    }, playDuration);
  });

  // 错误处理
  innerAudioContext.onError((err) => {
    console.error('音频播放错误：', err);
    innerAudioContext.destroy();
  });
}