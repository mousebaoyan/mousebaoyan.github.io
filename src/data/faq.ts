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
        answer: "主要交流计算机保研相关的信息和经验，包括夏令营与预推免、院校选择、材料准备、联系导师和面试准备。资料与经验贴整理在网站上，日常讨论在 QQ 群内进行。",
      },
      {
        question: "加入鼠群收费吗？是否提供付费辅导？",
        answer: "入群和日常交流免费，鼠群不提供付费辅导。个别群友可能以个人名义提供付费服务，与鼠群无关。",
      },
      {
        question: "在哪里查看群友分享的资料和经验？",
        answer: "“保研资源”页面整理了实用工具、网站和资料，“保研经验”页面收录群友的经验贴。可以根据自己的准备进度查阅，有具体问题也可以在群内交流。",
        link: { label: "浏览保研资源", href: "/resources" },
      },
    ],
  },
  {
    id: "joining-group",
    keywords: "入群 加群 QQ群 申请条件",
    title: "加入鼠群",
    questions: [
      {
        question: "哪些同学可以加入？有年级限制吗？",
        answer: "面向四非院校计算机相关专业的同学。不限制年级，已经保研的同学也可以加入交流。",
      },
      {
        question: "如何加入鼠群？",
        answer: `在 QQ 中搜索群号 ${site.qqGroup}，找到“${site.name}”后申请加入，填写年级和本科院校。下方的入群指南提供群号复制和 QQ 加群链接。`,
        link: { label: "查看入群指南", href: "/join" },
      },
    ],
  },
  {
    id: "participation",
    title: "交流与分享",
    questions: [
      {
        question: "群内交流需要遵守哪些规则？",
        answer: "请友好交流、尊重他人，有不同意见时就事论事，避免人身攻击。群内禁止广告与无关链接，欢迎分享保研经验和参考资料。",
      },
      {
        question: "在群里提问时，怎样描述问题更清楚？",
        answer: "建议说明目标院校或项目、当前准备进度、已查阅的信息和具体疑问。涉及招生通知时，请附上原文链接；分享截图或材料前，请遮盖姓名、学号、联系方式等个人信息。",
      },
      {
        question: "如何把自己的经验或实用资源分享到网站？",
        answer: "在“保研经验”页面点击“分享经验”，或在“保研资源”页面点击“推荐资源”，通过 GitHub 表单提交。管理员审核后会发布到网站；经验贴可以使用昵称署名。",
        link: { label: "查看经验贴与投稿方式", href: "/experiences" },
      },
      {
        question: "群内消息和经验贴里的信息都准确吗？",
        answer: "群内消息可能有遗漏，经验贴中的往年情况也可能发生变化，可作为保研准备的参考。招生条件、材料要求、报名时间和录取安排，请以院校当年的官方通知为准。",
      },
    ],
  },
];
