/**
 * 用户设置（客户端）—— localStorage 持久化 + 跨组件事件同步。
 * 所有设置项集中在这里，新设置项只需在 DEFAULT 与 Settings 接口中加字段。
 */
export interface Settings {
  /** 下雨特效开关 */
  bgRain: boolean;
  /** 特效强度：1（弱）~ 5（强），影响雨量 */
  bgIntensity: number;
  /** 鼠标悬停头像时显示的文字 */
  avatarTip: string;
  /** 文字风格：serif（衬线标题）| sans（全无衬线现代风） */
  fontStyle: 'serif' | 'sans';
  /** 主题主色色相：0~360（HSL 色相，默认 211 ≈ 邪王真眼·苍蓝） */
  accentHue: number;
}

export const SETTINGS_KEY = 'sf-settings';
export const SETTINGS_EVENT = 'sf-settings-change';

export const DEFAULT_SETTINGS: Settings = {
  bgRain: true,
  bgIntensity: 3,
  avatarTip: '邪王真眼，在此睁眼！',
  fontStyle: 'serif',
  accentHue: 211,
};

/** 读取设置（合并默认值，容错脏数据） */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      bgRain: typeof parsed.bgRain === 'boolean' ? parsed.bgRain : DEFAULT_SETTINGS.bgRain,
      bgIntensity:
        typeof parsed.bgIntensity === 'number' && parsed.bgIntensity >= 1 && parsed.bgIntensity <= 5
          ? Math.round(parsed.bgIntensity)
          : DEFAULT_SETTINGS.bgIntensity,
      avatarTip: typeof parsed.avatarTip === 'string' ? parsed.avatarTip.slice(0, 60) : DEFAULT_SETTINGS.avatarTip,
      fontStyle: parsed.fontStyle === 'sans' ? 'sans' : 'serif',
      accentHue:
        typeof parsed.accentHue === 'number' && parsed.accentHue >= 0 && parsed.accentHue <= 360
          ? Math.round(parsed.accentHue)
          : DEFAULT_SETTINGS.accentHue,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 保存设置并广播变更事件 */
export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...loadSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* 隐私模式等场景下静默失败 */
  }
  window.dispatchEvent(new CustomEvent<Settings>(SETTINGS_EVENT, { detail: next }));
  return next;
}
