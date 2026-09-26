import { site } from "../site.config";

interface Question {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}
interface Group {
  id: string;
  title: string;
  questions: Question[];
  keywords?: string;
}
export const groups: Group[] = [
  {
    id: "about-group",
    title: "了解鼠群",
    questions: [
      {
        question: "鼠群主要交流什么？",
        answer: "四非保研鼠群围绕计算机保研开展信息交流与经验分享，内容包括夏令营与预推免、院校选择、申请材料、导师联系和面试准备。网站整理推荐资源与经验贴，QQ群用于日常交流。",
      },
      {
        question: "加入鼠群收费吗？是否提供付费辅导？",
        answer: "加入鼠群和日常交流免费，鼠群本身不提供付费辅导。个别群友可能以个人身份提供付费服务，这属于其个人服务，并非鼠群提供的服务。",
      },
      {
        question: "在哪里查看群友分享的资料和经验？",
        answer: "网站的“推荐资源”页面汇集申请相关工具、网站与参考资料，“经验贴”页面收录群友的申请经历。可以先按自己的准备阶段浏览，再结合具体问题在群内交流。",
        link: { label: "浏览推荐资源", href: "/resources" },
      },
    ],
  },
  {
    id: "joining-group",
    keywords: "入群 加群 QQ群 申请条件",
    title: "申请加入",
    questions: [
      {
        question: "哪些同学可以加入？有年级限制吗？",
        answer: "面向四非院校计算机相关专业的同学。不限制年级，已经保研的同学也可以加入交流。",
      },
      {
        question: "如何加入鼠群？",
        answer: `在 QQ 中搜索群号 ${site.qqGroup}，找到“${site.name}”后申请加入，并在申请信息中提供年级和本科院校。也可以通过下方的加入指南查看群号并复制。`,
        link: { label: "查看加入指南", href: "/join" },
      },
    ],
  },
  {
    id: "participation",
    title: "交流与分享",
    questions: [
      {
        question: "群内交流需要遵守哪些规则？",
        answer: "请保持友好交流，尊重其他群友。讨论中可以有不同意见，但应围绕问题本身，避免人身攻击。群内禁止广告与无关链接，欢迎分享申请经验和参考资料。",
      },
      {
        question: "在群里提问时，怎样描述问题更清楚？",
        answer: "建议说明目标院校或项目、所处申请阶段、已经查到的信息，以及具体不确定的地方。涉及招生通知时附上原文链接；分享截图或材料前，请遮盖姓名、学号、联系方式等个人信息。",
      },
      {
        question: "如何把自己的经验或实用资源分享到网站？",
        answer: "在“经验贴”页面点击“投稿经验贴”，或在“推荐资源”页面点击“推荐资源”，通过 GitHub 表单提交。管理员审核后会发布到网站；经验贴可以使用昵称署名。",
        link: { label: "浏览经验贴与投稿入口", href: "/experiences" },
      },
      {
        question: "群内信息和经验贴可以直接作为申请依据吗？",
        answer: "群友分享反映各自的申请经历，适合作为准备和比较时的参考。招生条件、材料要求、报名时间与录取安排，请以目标院校当年的官方通知为准。",
      },
    ],
  },
];
