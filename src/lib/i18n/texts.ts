import { i18nTexts } from "@/hooks/useTexts";

export const APPNAME = "Permane.world";
export const CORPNAME = "K&M ERA LTD.";
export const COPYRIGHT = "© "+new Date().getFullYear()+" "+CORPNAME;

export const ZhTexts = {
  navApply: "申请",
  navMemorial: "追忆廊",
  navCloud: "云祭奠",

  heroTitle: "为您打造更温馨的回忆空间",
  heroSubtitle: "死亡不是终点，遗忘才是。",
  heroApply: "立即申请",
  // 产品与跳转
  goHaveATry: "前往",
  // 产品与跳转
  memorialName: "追忆廊",
  memorialDesc: "混合 Web3/Web2 的文章平台，存储至 Arweave，去中心化，支持祭奠与献花。",
  cloudName: "云祭奠",
  cloudDesc: "数字孪生、数字永生平台，置身场景与故者对话，数据直接上链。",
  viewDetails: "了解更多",
  visitSite: "访问站点",
  // 主题切换
  toggleTheme: "切换主题",
  // 追忆廊说明
  memorialTitle: "追忆廊：去中心化的纪念与记录空间",
  memorialP1: "追忆廊是一个混合 Web3 和 Web2 的文章平台，用户可以发送人物生平信息、图片等内容。",
  memorialP2: "所有文章将存储到 Web3 Arweave 链，完全去中心化，任何人都可以永久访问。",
  memorialP3: "人们可以在此祭奠与献花，需要支付一定费用。我们不会全部获取，而是将其转化为等额的币替您保管，您可随时取出。",
  // 云祭奠说明
  cloudTitle: "云祭奠：数字孪生与数字永生",
  cloudP1: "云祭奠是一个数字孪生、数字永生平台，人们将置身于特定场景，与已故亲人进行对话。",
  cloudP2: "您可以创建云祭奠空间，也可以修改其可见性以控制访问。",
  cloudP3: "所有数据将直接上链，不会在我们的平台进行存储与中转，最大程度保障隐私性。",
  backHome: "返回首页",
  sectionProducts: "产品与服务",
  sectionMore: "了解更多",
  sectionIntro: "为纪念因疾病与战争离世的亲人，我们提供两项核心服务。",
  applyHint: "如需试用或合作，请点击上方申请。",
  // 申请表单
  applyEmailLabel: "联系邮箱",
  applyPhoneLabel: "手机号（可选）",
  applyNeedsLabel: "个性化业务需求",
  applySubmit: "提交申请",
  applyCustomNote: "如您有更为个性化的定制需求，期待与我们进一步沟通，我们将为您提供细致、私密且有温度的专属服务。",
  // 图片与引言
  galleryTitle: "纪念与思考",
  galleryQuoteEn: "Death is not the end, forgetting is.",
  galleryQuoteZh: "死亡不是生命的终点",
  galleryDesc: "我们用黑白影像，铭记因疾病与战争离去的生命。愿记忆延续，愿爱不止。",
  imgDiseaseAlt: "疾病带来的离别",
  imgWarfareAlt: "战争带来的离别",
  imgWarfare2Alt: "战火后的沉寂",
  // 单图文案
  imgDiseaseTitle: "与病痛对抗的身影",
  imgDiseaseText: "他们经历漫长的治疗与守候，生命的坚韧在每一次呼吸之间闪光。",
  imgWarfareTitle: "战火中的决绝",
  imgWarfareText: "硝烟之外是家与国，选择与牺牲把名字刻入了我们的共同记忆。",
  imgWarfare2Title: "沉寂后的余温",
  imgWarfare2Text: "当喧嚣散尽，世界需要一种温柔的方式，去安放悲伤与爱。",
  
  // 关于我们
  aboutTitle: "关于" ,
  aboutMission: "我们希望为因疾病与战争离世的亲人，留存可被轻触的记忆与可被守护的隐私。",
  aboutWhatWeDo: "我们构建了两项核心服务：去中心化的追忆廊与上链的云祭奠。前者将文字与图片存入 Arweave，后者以数字孪生承载对话与陪伴，数据直达链上。",
  aboutTeamTitle: "我们的团队",
  teamMembers: [
    { name: "Wesley", role: "前端/产品/体验", desc: "关注告别仪式的温度与简单，减少每一次点击背后的负担。" },
    { name: "Quan", role: "后端/链上/可访问性", desc: "确保数据可验证与可取回，让隐私只属于家属。" },
  ]
} as const satisfies i18nTexts;

export const EnTexts = {
  navApply: "Apply",
  navMemorial: "Memorial",
  navCloud: "Cloud",

  heroTitle: "Creating a warmer space for your memories",
  heroSubtitle: "Death is not the end, forgetting is.",
  heroApply: "Apply Now",
  // 产品与跳转
  goHaveATry: "Go To",
  // 产品与跳转
  memorialName: "Memorial",
  memorialDesc: "A hybrid Web3/Web2 article platform, stored on Arweave, decentralized, supporting memorial and flower offerings.",
  cloudName: "Cloud",
  cloudDesc: "Digital twin and digital immortality platform, immerse in scenarios to dialogue with the departed, data directly on-chain.",
  viewDetails: "Learn More",
  visitSite: "Visit Site",
  // 主题切换
  toggleTheme: "Toggle Theme",
  // 追忆廊说明
  memorialTitle: "Memorial: Decentralized Memorial and Recording Space",
  memorialP1: "Memorial Hall is a hybrid Web3 and Web2 article platform where users can share biographical information and images of people.",
  memorialP2: "All articles are stored on the Web3 Arweave chain, completely decentralized, accessible to anyone permanently.",
  memorialP3: "People can memorialize and offer flowers here, requiring payment. We don't keep everything, but convert it to equivalent tokens for your safekeeping, which you can withdraw anytime.",
  // 云祭奠说明
  cloudTitle: "Cloud: Digital Twin and Digital Immortality",
  cloudP1: "Cloud Memorial is a digital twin and digital immortality platform where people immerse themselves in specific scenarios to dialogue with departed loved ones.",
  cloudP2: "You can create cloud memorial spaces and modify their visibility to control access.",
  cloudP3: "All data goes directly on-chain, without storage or transit through our platform, ensuring maximum privacy protection.",
  backHome: "Back to Home",
  sectionProducts: "Products & Services",
  sectionMore: "Learn More",
  sectionIntro: "To commemorate loved ones who passed away due to illness and war, we provide two core services.",
  applyHint: "For trials or partnerships, please click Apply above.",
  // 申请表单
  applyEmailLabel: "Contact Email",
  applyPhoneLabel: "Phone Number (Optional)",
  applyNeedsLabel: "Personalized Business Needs",
  applySubmit: "Submit Application",
  applyCustomNote: "If you have more personalized customization needs, we look forward to further communication and will provide you with detailed, private, and warm exclusive services.",
  // 图片与引言
  galleryTitle: "Memorial & Reflection",
  galleryQuoteEn: "Death is not the end, forgetting is.",
  galleryQuoteZh: "Death is not the end of life",
  galleryDesc: "We use black and white imagery to remember lives lost to illness and war. May memories continue, may love never cease.",
  imgDiseaseAlt: "Parting brought by illness",
  imgWarfareAlt: "Parting brought by war",
  imgWarfare2Alt: "Silence after the flames of war",
  // 单图文案
  imgDiseaseTitle: "Figures Fighting Against Illness",
  imgDiseaseText: "They endured long treatments and waiting, with life's resilience shining through every breath.",
  imgWarfareTitle: "Resolve in the Flames of War",
  imgWarfareText: "Beyond the smoke are home and country, choices and sacrifices that carved names into our shared memory.",
  imgWarfare2Title: "Warmth After the Silence",
  imgWarfare2Text: "When the noise fades, the world needs a gentle way to hold grief and love.",

  // 关于我们
  aboutTitle: "About",
  aboutMission: "We hope to preserve touchable memories and protectable privacy for loved ones who passed away due to illness and war.",
  aboutWhatWeDo: "We built two core services: decentralized Memorial Hall and on-chain Cloud Memorial. The former stores text and images on Arweave, while the latter carries dialogue and companionship through digital twins, with data going directly on-chain.",
  aboutTeamTitle: "Our Team",
  teamMembers: [
    { name: "Wesley", role: "Frontend/Product/Experience", desc: "Focuses on the warmth and simplicity of farewell ceremonies, reducing the burden behind every click." },
    { name: "Quan", role: "Backend/On-chain/Accessibility", desc: "Ensures data verifiability and retrievability, keeping privacy only for families." },
  ]
} as const satisfies i18nTexts;


