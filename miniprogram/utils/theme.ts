// src/utils/theme.ts
/**
 * 掌账Mate 主题配置 TS 版
 * 包含完整类型定义，适配 SCSS 变量导出
 */
export type ThemeConfig = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;
  expense: string;
  expenseLight: string;
  income: string;
  incomeLight: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgMain: string;
  bgCard: string;
  bgLine: string;
  bgMask: string;
  white: string;
  black: string;
  gray1: string;
  gray2: string;
  gray3: string;
  gray4: string;
  gray5: string;
};

// 所有主题配置
export const colorThemes: Record<string, ThemeConfig> = {
  // 奶油蓝
  creamBlue: {
    primary: "#90CAF9",
    primaryLight: "#E3F2FD",
    primaryDark: "#64B5F6",
    primaryText: "#FFFFFF",
    expense: "#F9A825",
    expenseLight: "#FFF3E0",
    income: "#81C784",
    incomeLight: "#E8F5E9",
    success: "#66BB6A",
    warning: "#FFB74D",
    danger: "#EF5350",
    info: "#90CAF9",
    textPrimary: "#263238",
    textSecondary: "#546E7A",
    textTertiary: "#90A4AE",
    bgMain: "#FAFAFA",
    bgCard: "#FFFFFF",
    bgLine: "#ECEFF1",
    bgMask: "rgba(0,0,0,0.3)",
    white: "#FFFFFF",
    black: "#000000",
    gray1: "#F5F5F5",
    gray2: "#EEEEEE",
    gray3: "#E0E0E0",
    gray4: "#BDBDBD",
    gray5: "#9E9E9E",
  },
  // 柠檬黄（FFD608 主题）
  lemonYellow: {
    primary: "#FFD608",
    primaryLight: "#FFFDE7",
    primaryDark: "#F9C700",
    primaryText: "#263238",
    expense: "#FFD608",
    expenseLight: "#FFFDE7",
    income: "#81C784",
    incomeLight: "#E8F5E9",
    success: "#66BB6A",
    warning: "#FFA726",
    danger: "#EF5350",
    info: "#90CAF9",
    textPrimary: "#263238",
    textSecondary: "#546E7A",
    textTertiary: "#90A4AE",
    bgMain: "#FAFAFA",
    bgCard: "#FFFFFF",
    bgLine: "#ECEFF1",
    bgMask: "rgba(0,0,0,0.3)",
    white: "#FFFFFF",
    black: "#000000",
    gray1: "#F5F5F5",
    gray2: "#EEEEEE",
    gray3: "#E0E0E0",
    gray4: "#BDBDBD",
    gray5: "#9E9E9E",
  },
};

// 默认主题（FFD608 柠檬黄）
export const DEFAULT_THEME = "lemonYellow";

// 获取当前主题（支持本地缓存）
export function getCurrentTheme(): ThemeConfig {
  const cacheTheme = wx.getStorageSync("selectedTheme");
  return colorThemes[cacheTheme || DEFAULT_THEME];
}

// 切换主题并缓存
export function switchTheme(themeName: keyof typeof colorThemes): ThemeConfig {
  wx.setStorageSync("selectedTheme", themeName);
  return colorThemes[themeName];
}

// 生成 SCSS 变量字符串（用于自动生成 SCSS 文件）
export function generateScssVars(): string {
  const theme = getCurrentTheme();
  let scssVars = "// 自动生成的主题变量（请勿手动修改）\n";
  Object.entries(theme).forEach(([key, value]) => {
    scssVars += `$${key}: ${value};\n`;
  });
  return scssVars;
}