import { forum, qqGroups } from "../site.config";

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
        answer: `主要交流计算机保研相关的信息和经验，包括夏令营与预推免、院校选择、材料准备、联系导师和面试准备。资料与经验贴整理在网站上，日常讨论在 QQ 群和${forum.name}论坛进行。`,
      },
      {
        question: "加入鼠群收费吗？是否提供付费辅导？",
        answer: "入群和日常交流免费，鼠群不提供付费辅导。个别群友可能以个人名义提供付费服务，与鼠群无关。",
      },
      {
        question: "在哪里查看群友分享的资料和经验？",
        answer: `“保研资源”页面整理了实用工具、网站和资料，“保研经验”页面收录群友的经验贴。可以根据自己的准备进度查阅，有具体问题可以在群里或${forum.name}论坛提问。`,
        link: { label: "浏览保研资源", href: "/resources/" },
      },
      {
        question: "往期直播分享在哪里看？课件可以下载吗？",
        answer: "“直播回放”页面收录鼠群往期保研经验分享直播的录屏。有课件的场次可以在网页上逐页翻阅，也可以下载原 PDF。课件版权归分享人所有，仅供个人学习参考。",
        link: { label: "查看直播回放", href: "/talks/" },
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
        answer: `优先加${qqGroups[0].label}：在 QQ 中搜索群号 ${qqGroups[0].number}，找到“${qqGroups[0].name}”后申请加入，填写年级和本科院校。${qqGroups[0].label}满了再加${qqGroups[1].label} ${qqGroups[1].number}（“${qqGroups[1].name}”）。下方的入群指南提供群号复制和 QQ 加群链接。`,
        link: { label: "查看入群指南", href: "/join/" },
      },
      {
        question: "为什么我被踢出群聊了？",
        answer: "由于群容量有限，会不定期踢出太久没发言过的群友，重新申请即可。",
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
        answer: `网站已不再收录新的投稿。保研经验请发到${forum.name}论坛的“经验分享”版块，工具和资料请发到“工具推荐”版块；网站上已发布的经验贴和资源会继续保留。`,
        link: { label: "前往经验分享版块", href: forum.experienceUrl },
      },
      {
        question: `${forum.name}论坛是什么？如何登录？`,
        answer: `${forum.name}是鼠群的论坛，群里的问题和经验可以发在论坛上长期保存，方便查找。所有人都可以浏览；发帖和回复仅限鼠群成员，使用 QQ 号登录。`,
        link: { label: `前往${forum.name}`, href: forum.url },
      },
      {
        question: "对网站或论坛有意见建议，应该发到哪里？",
        answer: `欢迎发到${forum.name}论坛的“反馈建议”版块，发帖需要先登录。`,
        link: { label: "前往反馈建议版块", href: forum.feedbackUrl },
      },
      {
        question: "群内消息和经验贴里的信息都准确吗？",
        answer: "群内消息可能有遗漏，经验贴中的往年情况也可能发生变化，可作为保研准备的参考。招生条件、材料要求、报名时间和录取安排，请以院校当年的官方通知为准。",
      },
    ],
  },
];
