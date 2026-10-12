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

// 站点公告 —— 首次访问时弹出，读过后只在导航栏铃铛里查看
// 更新内容时一并修改 id，所有人会重新看到弹窗；撤下公告时改为 null
export const notice = {
  id: "2026-10-13-group-ban",
  date: "2026-10-13",
  status: "申诉处理中",
  title: "鼠群 QQ 群暂时被封禁",
  paragraphs: [
    `鼠群 QQ 群（${site.qqGroup}）目前被临时封禁，暂时无法发言，也无法申请加入。我们已经提交申诉，正在等待处理结果，解封时间暂时还无法确定。`,
    "初步判断，这次封禁可能与群内出现违规言论有关。恢复后我们会进一步明确群规，也请大家在群里只讨论保研相关的话题。",
    "解封或新建群聊等后续安排，都会第一时间发布在本站，请以官网公告为准。在此期间，请不要相信以「鼠群新群」名义私下发来的群号或链接。",
    "网站上的保研经验、保研资源和直播回放照常可以使用。感谢大家的耐心等待！",
  ],
  signature: "鼠群管理组",
};
