// 首页保研日历：每年大致相同的六个阶段，内容整理自星空、Cyan 两场直播的课件。
// start 为阶段开始的月-日，阶段持续到下一阶段开始前；最后一个阶段持续到年底。
// 套磁不是单独的阶段，而是贯穿多个阶段的持续活动，见下方 activities。
export type Tone = "prep" | "camp" | "pre" | "tm";

export interface PhaseLink { label: string; href: string; external?: boolean }
export interface Phase {
  id: string;
  name: string;
  start: string;
  range: string;
  tone: Tone;
  // 该阶段属于哪一届：0 为当年参加推免的一届，1 为下一届
  cohort: 0 | 1;
  goal: string;
  todo: string[];
  links: PhaseLink[];
  // 资源标签含有这些词时，认为资源在该阶段用得上
  keywords: string[];
}

export const phases: Phase[] = [
  {
    id: "start", name: "起步", start: "01-01", range: "1–2 月", tone: "prep", cohort: 0,
    keywords: ["起步", "规划", "推免政策", "排名"],
    goal: "了解保研，补齐短板",
    todo: [
      "弄清本校推免政策和自己的排名位置",
      "确定感兴趣的方向，读几篇这个方向的论文",
      "六级、科研、竞赛，先补最容易补上的那块",
    ],
    links: [
      { label: "星空的直播：保研时间线", href: "/talks/2024-05/#xingkong-5" },
      { label: "读读大家的经验帖", href: "/experiences" },
    ],
  },
  {
    id: "material", name: "备材料", start: "03-01", range: "3–4 月", tone: "prep", cohort: 0,
    keywords: ["简历", "文书", "推荐信", "材料"],
    goal: "搜集信息，准备材料",
    todo: [
      "整理目标院校和导师名单，按梯度排好",
      "写好简历、个人陈述，提前约推荐信",
      "开始联系导师，从最想去的组发起，别等“准备好了”再联系",
    ],
    links: [
      { label: "AutoEmailSender 套磁邮件工具", href: "/resources/auto-email-sender" },
      { label: "Cyan 的课件：套磁与考核", href: "/talks/2026-05/#cyan-5" },
    ],
  },
  {
    id: "camp", name: "夏令营", start: "05-01", range: "5–7 月", tone: "camp", cohort: 0,
    keywords: ["夏令营", "机试", "面试"],
    goal: "报名夏令营，准备考核",
    todo: [
      "5–6 月集中报名，逐项核对材料和截止时间",
      "机试刷 AcWing 基础课或 LeetCode Hot 100，练好英文自我介绍",
      "期末复习和六级别落下，6–7 月参营争取优营",
      "参营的同时继续联系导师，4–6 月是套磁最集中的时候",
    ],
    links: [
      { label: "CS 保研 DDL", href: "/resources/cs-baoyan-ddl" },
      { label: "夏令营报名自动填表助手", href: "/resources/summer-camp-autofill" },
      { label: "星空的直播：面试准备", href: "/talks/2024-05/#xingkong-11" },
    ],
  },
  {
    id: "pre", name: "预推免", start: "08-01", range: "8 月–9 月中旬", tone: "pre", cohort: 0,
    keywords: ["预推免", "九推", "面试"],
    goal: "复盘夏令营，再投一轮",
    todo: [
      "复盘夏令营的面试，补上暴露出来的问题",
      "8 月中旬起预推免集中开放，没拿到满意的 offer 就继续投",
      "预推免开始前再联系一批导师，这是套磁的第二个高峰",
      "留意本校推免资格的最终评定",
    ],
    links: [
      { label: "CS 保研 DDL", href: "/resources/cs-baoyan-ddl" },
      { label: "Cyan 的课件：夏令营与预推免", href: "/talks/2026-05/#cyan-6" },
    ],
  },
  {
    id: "tm", name: "推免系统", start: "09-18", range: "9 月下旬–10 月中旬", tone: "tm", cohort: 0,
    keywords: ["推免系统", "志愿", "补录"],
    goal: "填报志愿，确认录取",
    todo: [
      "三个平行志愿，提交后 48 小时内不能修改",
      "接受待录取通知后不能再报其他志愿，确认前想清楚",
      "还没上岸也别停，九推和补录仍有机会",
    ],
    links: [
      { label: "学信网推免服务系统", href: "https://yz.chsi.com.cn/tm/", external: true },
      { label: "星空的直播：面临的选择", href: "/talks/2024-05/#xingkong-18" },
    ],
  },
  {
    id: "next", name: "新一届", start: "10-21", range: "10 月下旬–12 月", tone: "prep", cohort: 1,
    keywords: [],
    goal: "下一届开始准备",
    todo: [
      "读几篇经验帖，了解完整的流程",
      "看一场直播回放，知道每个阶段要做什么",
      "进群向刚上岸的学长学姐提问",
    ],
    links: [
      { label: "大家的经验帖", href: "/experiences" },
      { label: "直播回放", href: "/talks" },
      { label: "加入鼠群", href: "/join" },
    ],
  },
];

// 当年的官方关键日期，以教育部和学信网通知为准，每年更新一次
export const milestones: Record<number, { date: string; label: string }[]> = {
  2026: [
    { date: "2026-09-18", label: "推免系统开放注册" },
    { date: "2026-09-21", label: "开始填报志愿" },
    { date: "2026-09-24", label: "开始确认待录取通知" },
    { date: "2026-10-18", label: "志愿填报截止" },
    { date: "2026-10-20", label: "复试、待录取通知确认截止" },
  ],
};

// 贯穿多个阶段的持续活动。peaks 是最集中的时段，在日历上画得更粗
export interface Activity {
  id: string;
  name: string;
  start: string;
  end: string;
  range: string;
  note: string;
  peaks: { start: string; end: string }[];
  keywords: string[];
}

export const activities: Activity[] = [
  {
    id: "contact", name: "套磁", start: "03-01", end: "10-20", range: "3–10 月",
    note: "联系导师贯穿整个保研季：4–6 月最集中，8 月中旬预推免开始前是第二个高峰",
    peaks: [{ start: "04-01", end: "07-01" }, { start: "08-10", end: "09-20" }],
    keywords: ["套磁", "导师"],
  },
];

// 各阶段在一年中的起止位置（0–1），资源卡片上的小日历条与首页日历使用同样的划分
export function phaseSpans(year = 2025) {
  const t0 = Date.UTC(year, 0, 1);
  const span = Date.UTC(year + 1, 0, 1) - t0;
  const at = (monthDay: string) => {
    const [month, day] = monthDay.split("-").map(Number);
    return (Date.UTC(year, month - 1, day) - t0) / span;
  };
  return phases.map((phase, index) => {
    const start = at(phase.start);
    const end = index + 1 < phases.length ? at(phases[index + 1].start) : 1;
    return { ...phase, s: start, w: end - start };
  });
}

export type PhaseSpan = ReturnType<typeof phaseSpans>[number];

// 资源用得上的阶段：按标签匹配各阶段的关键词
export function phasesForTags(tags: string[], spans: PhaseSpan[] = phaseSpans()) {
  return spans.filter((phase) => phase.keywords.some((word) => tags.some((tag) => tag.includes(word))));
}

// 持续活动在一年中的位置（0–1）
export function activitySpans(year = 2025) {
  const t0 = Date.UTC(year, 0, 1);
  const span = Date.UTC(year + 1, 0, 1) - t0;
  const at = (monthDay: string) => {
    const [month, day] = monthDay.split("-").map(Number);
    return (Date.UTC(year, month - 1, day) - t0) / span;
  };
  const place = (start: string, end: string) => ({ s: at(start), w: at(end) - at(start) });
  return activities.map((activity) => ({
    ...activity,
    ...place(activity.start, activity.end),
    peakSpans: activity.peaks.map((peak) => place(peak.start, peak.end)),
  }));
}

export type ActivitySpan = ReturnType<typeof activitySpans>[number];

export function activitiesForTags(tags: string[], spans: ActivitySpan[] = activitySpans()) {
  return spans.filter((activity) => activity.keywords.some((word) => tags.some((tag) => tag.includes(word))));
}
