// 站点全局配置 —— 集中放置易变信息，后续维护只改这里
export const site = {
  url: "https://mousebaoyan.github.io",
  name: "四非保研鼠群",
  shortName: "保研鼠群",
  tagline: "计算机保研信息与经验交流",
  description:
    "汇集计算机保研招生信息、申请资源与经验分享，为四非院校学生提供信息交流与申请参考。",
  qqGroup: "752140536",
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
  { href: "/resources", label: "推荐资源" },
  { href: "/experiences", label: "经验贴" },
  { href: "/faq", label: "常见问题" },
];
