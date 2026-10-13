// 站点全局配置 —— 集中放置易变信息，后续维护只改这里
export const site = {
  url: "https://mousebaoyan.github.io",
  name: "四非保研鼠群",
  shortName: "保研鼠群",
  tagline: "计算机保研信息与经验交流",
  description:
    "四非院校同学的计算机保研信息站：招生信息、实用资源、经验贴与直播回放",
  qqGroup: "832060453",
  qqGroupName: "四非计算机保研群（新）",
  // 群号旁的标注，不需要时设为 null
  qqGroupTag: "新群",
  // 首页展示的群人数，人数变化时改这里
  memberCount: "1000+",
  qqJoinUrl:
    "https://qun.qq.com/universal-share/share?ac=1&authKey=hLBR7ahTMLL7dYZ1c1wWuoyC7Ic%2FI9mCTgIm7gb2wOyyz3ytDUYifEd8mVMgKj2s&busi_data=eyJncm91cENvZGUiOiI4MzIwNjA0NTMiLCJ0b2tlbiI6Im1hTktnbjRYSjJqRzJ2blFzSWF0SnR0emFWS0hKZmZYWjRIUmN3YVVJQXB1aG5lbGdMOGtJWVdZbTM0VFJON0IiLCJ1aW4iOiIxMjQwODQwMDc2In0%3D&data=d3fE0eXph07S3dC9rQhZt1ShYIsMKtOUB0GKrHyS7nlAXgqll75UyJMcU6SRHonRDfdoK13LXznPXBd1l46ZQA&svctype=4&tempid=h5_group_info",
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
  id: "2026-10-13-new-group",
  date: "2026-10-13",
  status: "新群已开放",
  title: `鼠群新群已开放：${site.qqGroup}`,
  paragraphs: [
    `原来的鼠群 QQ 群被封禁后，我们建了新群「${site.qqGroupName}」，群号 ${site.qqGroup}，现在已经可以申请加入。`,
    "申请时请写明年级和本科院校，管理员审核后就能进群。群号复制和 QQ 加群链接在「加入鼠群」页面。",
    "新群里请只讨论保研相关的话题。群号以后如有变化，都会第一时间发布在本站，请不要相信其他渠道私下发来的群号或链接。",
    "网站上的保研经验、保研资源和直播回放照常可以使用，欢迎大家回到鼠群！",
  ],
  signature: "鼠群管理组",
};
