// 站点全局配置 —— 集中放置易变信息，后续维护只改这里
export const site = {
  name: "四非保研鼠群",
  shortName: "保研鼠群",
  tagline: "计算机保研信息与经验交流社群",
  description:
    "汇集计算机保研夏令营情报、保研时间线与上岸经验，和四非的同学一起打破信息差。",
  qqGroup: "752140536",
  qqJoinUrl: "https://qm.qq.com/q/", // TODO: 替换为一键加群链接
};

// 导航链接 —— Nav 与页脚共用
export const navLinks = [
  { href: "/", label: "首页" },
  { href: "/timeline", label: "保研时间线" },
  { href: "/tools", label: "推荐工具" },
  { href: "/experiences", label: "经验贴" },
  { href: "/faq", label: "FAQ" },
];
