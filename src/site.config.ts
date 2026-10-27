// 站点全局配置 —— 集中放置易变信息，后续维护只改这里
export const site = {
  url: "https://mousebaoyan.cn",
  name: "四非保研鼠群",
  shortName: "保研鼠群",
  tagline: "计算机保研信息与经验交流",
  description:
    "四非院校同学的计算机保研信息站：招生信息、实用资源、经验贴与直播回放",
  // 首页展示的群人数，人数变化时改这里
  memberCount: "1000+",
};

// 鼠群 QQ 群 —— 优先加一群，一群满了再加二群
export const qqGroups = [
  {
    label: "一群",
    number: "742203503",
    name: "四非计算机保研群(一)",
    joinUrl: "https://qm.qq.com/q/20geYjRZlq",
  },
  {
    label: "二群",
    number: "832060453",
    name: "四非计算机保研群(二)",
    joinUrl:
      "https://qun.qq.com/universal-share/share?ac=1&authKey=hLBR7ahTMLL7dYZ1c1wWuoyC7Ic%2FI9mCTgIm7gb2wOyyz3ytDUYifEd8mVMgKj2s&busi_data=eyJncm91cENvZGUiOiI4MzIwNjA0NTMiLCJ0b2tlbiI6Im1hTktnbjRYSjJqRzJ2blFzSWF0SnR0emFWS0hKZmZYWjRIUmN3YVVJQXB1aG5lbGdMOGtJWVdZbTM0VFJON0IiLCJ1aW4iOiIxMjQwODQwMDc2In0%3D&data=d3fE0eXph07S3dC9rQhZt1ShYIsMKtOUB0GKrHyS7nlAXgqll75UyJMcU6SRHonRDfdoK13LXznPXBd1l46ZQA&svctype=4&tempid=h5_group_info",
  },
];

// 鼠洞论坛 —— 网站只做展示，提问和讨论都到论坛；导航、首页、页脚、详情页和公告共用
export const forum = {
  name: "鼠洞",
  url: "https://bbs.mousebaoyan.cn",
  qaUrl: "https://bbs.mousebaoyan.cn/b/qa",
  feedbackUrl: "https://bbs.mousebaoyan.cn/b/feedback",
  // 网站不再收录新投稿，经验和资源都发到论坛对应版块
  experienceUrl: "https://bbs.mousebaoyan.cn/b/experience",
  toolsUrl: "https://bbs.mousebaoyan.cn/b/tools",
};

// 导航链接 —— Nav 与页脚共用
export const navLinks = [
  { href: "/", label: "首页" },
  { href: "/resources/", label: "保研资源" },
  { href: "/experiences/", label: "保研经验" },
  { href: "/talks/", label: "直播回放" },
  { href: "/faq/", label: "常见问题" },
];

// 站点公告 —— 首次访问时弹出，读过后只在导航栏铃铛里查看
// 更新内容时一并修改 id，所有人会重新看到弹窗；撤下公告时改为 null
export const notice = {
  id: "2026-10-15-forum",
  date: "2026-10-15",
  status: "鼠洞已上线",
  title: `鼠群论坛「${forum.name}」上线了`,
  paragraphs: [
    `${forum.name}是鼠群自己的论坛，地址 bbs.mousebaoyan.cn。群里聊过的问题和经验容易被消息冲走，发在论坛上可以长期保存，也方便搜索。`,
    "论坛设有保研问答、经验分享、院校交流等版块，所有人都可以浏览；发帖和回复需要登录，仅限鼠群成员，使用 QQ 号登录。",
    "对网站和论坛的意见建议，欢迎发到论坛的「反馈建议」版块。",
  ],
  action: { label: `前往${forum.name}`, href: forum.url },
  signature: "鼠群管理组",
};
