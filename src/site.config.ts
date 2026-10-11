// 站点全局配置 —— 集中放置易变信息，后续维护只改这里
export const site = {
  url: "https://mousebaoyan.github.io",
  name: "四非保研鼠群",
  shortName: "保研鼠群",
  tagline: "计算机保研信息与经验交流",
  description:
    "四非院校同学的计算机保研信息站：招生信息、实用资源、经验贴与直播回放",
  qqGroup: "742203503",
  // 首页展示的群人数，人数变化时改这里
  memberCount: "1000+",
  qqJoinUrl: "https://qm.qq.com/q/20geYjRZlq",
};

// Giscus uses public repository identifiers, never a GitHub token.
export const comments = {
  repo: "mousebaoyan/mousebaoyan.github.io",
  repoId: "R_kgDOTD-m_A",
  category: "Announcements",
  categoryId: "DIC_kwDOTD-m_M4DGadi",
};

// 导航链接 —— Nav 与页脚共用
export const navLinks = [
  { href: "/", label: "首页" },
  { href: "/resources", label: "保研资源" },
  { href: "/experiences", label: "保研经验" },
  { href: "/talks", label: "直播回放" },
  { href: "/faq", label: "常见问题" },
];
