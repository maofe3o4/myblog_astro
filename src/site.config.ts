/**
 * 站点级配置 —— 集中管理博客元信息，方便后续迭代时统一修改。
 */
export const SITE = {
  /** 站名（取自动漫角色 小鸟游六花 / Takanashi Rikka） */
  name: '雪上加霜',
  /** 英文副名 */
  nameEn: 'Rikka',
  /** 一句话简介 */
  tagline: '相逢已是上上签，何必执着事事圆',
  /** 站长 */
  author: '雪上加霜',
  /** 描述（用于 SEO / meta） */
  description: '还没想好',
  /** 语言 */
  lang: 'zh-CN',
  /** 社交链接（按需增删） */
  links: {
    github: 'https://github.com/maofe3o4',
    email: '2949376275@qq.com',
  },
} as const;

/** 顶部导航 */
export const NAV = [
  { label: '首页', href: '/' },
  { label: '随笔', href: '/essays' },
  { label: '笔记', href: '/notes' },
  { label: '工具', href: '/tools' },
  { label: '关于', href: '/about' },
] as const;

/** 内容类型展示名 */
export const TYPE_LABEL: Record<'essay' | 'note', string> = {
  essay: '随笔',
  note: '笔记',
};

/**
 * 全局音乐播放器（自建 UI + Meting 兼容 API）。
 * 把 id 换成你自己的歌单 ID 即可：
 *   - 打开网页版网易云，进入你的歌单 → 地址栏 .../playlist?id=XXXX 中的 XXXX 即歌单 ID
 *   - type: 0=歌单  1=单曲  2=专辑（对应地址里的 /playlist/ /song/ /album/）
 *   - api: Meting 兼容接口，负责解析歌曲直链 / 封面（type 参数由组件自动映射为 playlist/song/album）
 */
export const MUSIC = {
  /** 是否启用右下角播放器 */
  enabled: true,
  /** 歌单 / 单曲 / 专辑 ID */
  id: '18492923389', // 用户歌单 ID
  /** 0=歌单 1=单曲 2=专辑 */
  type: 0,
  /** Meting 兼容 API（负责解析网易云歌曲直链 / 封面 / 歌词） */
  api: 'https://api.injahow.cn/meting',
  /** 备用 Meting 兼容接口（按顺序回退，任一可用即可；部分公共接口会偶发限流/宕机） */
  fallbacks: [
    'https://meting.qjqq.cn',
    'https://api-meting.qjqq.cn/meting',
    'https://meting.zjson.net',
  ],
} as const;

/** 首页 Hero 展示资料（头像 / 昵称 / 签名 / 外链） */
export const PROFILE = {
  /** 头像路径（放在 public/ 下） */
  avatar: '/六花.gif',
  /** 昵称 */
  nickname: '六花',
  /** 签名（展示在昵称下方） */
  signature: '相逢已是上上签，何必执着事事圆，记录代码、设计与日常',
  /** Hero 顶部小标（eyebrow）：可自由改写整行文案（含 ✦ 与英文副名 / 主题标签） */
  eyebrow: '✦ Rikka · CODING · THINKING · LEARNING',
  /** 外链（按需增删，icon 可选：github / mail / bilibili / twitter / rss） */
  links: [
    { label: 'GitHub', href: 'https://github.com/fe3oo4', icon: 'github' },
    { label: '哔哩哔哩', href: 'https://www.bilibili.com/646326155', icon: 'bilibili' },
  ],
} as const;

/** 工具页：集中放置常用网址（导航栏「工具」入口）。按需增删分组与链接即可。 */
export const TOOLS = [
  {
    title: '常用',
    links: [
      { label: 'GitHub', href: 'https://github.com/', desc: '代码与项目托管' },
      { label: '网易云音乐', href: 'https://music.163.com/', desc: '歌单与听歌' },
      { label: '邮箱', href: 'mailto:hello@sixflowers.example.com', desc: '联系我' },
    ],
  },
  {
    title: '开发',
    links: [
      { label: 'Astro 文档', href: 'https://docs.astro.build/', desc: '本博客所用框架' },
      { label: 'MDN', href: 'https://developer.mozilla.org/', desc: 'Web 技术参考' },
      { label: 'Can I Use', href: 'https://caniuse.com/', desc: '浏览器兼容性查询' },
    ],
  },
  {
    title: '学习与资讯',
    links: [
      { label: '哔哩哔哩', href: 'https://www.bilibili.com/', desc: '视频与教程' },
      { label: '少数派', href: 'https://sspai.com/', desc: '效率与数字生活' },
    ],
  },
] as const;

/** 用户可调设置默认值（实际值存 localStorage，可在导航栏「设置」面板修改） */
export const SETTINGS_DEFAULTS = {
  /** 下雨特效 */
  bgRain: true,
  /** 特效强度 1（弱）~ 5（强） */
  bgIntensity: 3,
  /** 鼠标悬停头像时显示的文字 */
  avatarTip: '邪王真眼，在此睁眼！',
  /** 文字风格：serif（衬线标题）| sans（全无衬线现代风） */
  fontStyle: 'serif',
  /** 主题主色色相：0~360（HSL 色相，默认 211 ≈ 邪王真眼·苍蓝） */
  accentHue: 211,
} as const;
