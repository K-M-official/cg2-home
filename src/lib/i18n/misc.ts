import { i18nPolicies } from "@/hooks/useTexts";
import { APPNAME } from "./texts";

export const ZhMisc = {
  howItWorksTitle: "如何运作",
  howItWorksBody: [
    APPNAME + "以极简与隐私为先的原则设计。您在追忆廊发布的图文将上载至 Web3 Arweave 网络，形成不可篡改的去中心化存证；云祭奠的空间配置与交互数据，将直接上链，不经过我们的中转存储。",
    "为保证体验与可用性，我们在前端进行必要的加密与脱敏处理，仅在用户本地与链上交互，最大化降低数据暴露面。",
    "祭奠与献花所产生的费用，会按等额数字资产为您托管，您可在页面随时发起提取，链上透明可查。",
  ],

  termsTitle: "服务条款",
  termsBody: [
    "使用" + APPNAME +  "代表您已年满法定年龄并具备完全民事行为能力。请勿上传违法、侵权、诽谤、仇恨、暴力与其他违反当地法律或公共秩序的内容。",
    "平台不对用户生成内容承担审查义务，但保留依据法律法规、权利人通知与平台规则下线相关内容与限制访问的权利。",
    "对于因区块链网络拥堵、第三方节点异常、智能合约风险、不可抗力等造成的服务异常或数据延迟，平台不承担由此产生的直接或间接损失。",
    "若您使用到费用托管与提取功能，您应自行妥善保管密钥、助记词与钱包权限，由此产生的资产风险由您自行承担。",
  ],

  privacyTitle: "隐私政策",
  privacyBody: [
    "我们尽量减少对个人信息的收集。除必要的功能性 Cookie 与防滥用安全策略外，我们不进行行为跟踪分析。",
    "用户在追忆廊与云祭奠内产生的数据，默认直接上链或进入去中心化存储；我们不在服务器侧保留可识别您身份的明文数据。",
    "您在提交申请或联系我们时填写的邮箱、手机号等联络信息，仅用于沟通与服务交付，不会出售给第三方。",
    "在法律要求或为履行法定义务的范围内，我们可能配合执法与司法机关提供必要信息，但会严格遵循合法性与最小化原则。",
  ],
} as const satisfies i18nPolicies;

export const EnMisc = {
  howItWorksTitle: "How It Works",
  howItWorksBody: [
    APPNAME + "is designed with simplicity and privacy first principles. The text and images you post in the Memorial Hall are uploaded to the Web3 Arweave network, forming an immutable decentralized record.",
    "The configuration and interaction data of the Cloud Memorial will be directly uploaded to the chain without storage or transit through our platform, ensuring maximum privacy protection.",
    "For the sake of experience and usability, we perform necessary encryption and de-sensitization processing on the frontend, only interacting with the chain locally, maximizing the data exposure surface.",
  ],
  termsTitle: "Terms of Service",
  termsBody: [
    "Using " + APPNAME + " represents that you are at least the age of majority and have full legal capacity. Please do not upload content that violates laws, infringes on rights, defames, incites hatred, violence, or other illegal or public order content.",
    "The platform does not assume the obligation to review user-generated content, but reserves the right to take down related content and restrict access according to laws, regulations, rights holder notifications, and platform rules.",
    "For service exceptions or data delays caused by blockchain network congestion, third-party node exceptions, smart contract risks, or unforeseeable factors, the platform does not assume responsibility for direct or indirect losses resulting from such exceptions.",
    "If you use the fee托管与提取 functionality, you should properly store the keys, mnemonics, and wallet permissions yourself, and the asset risks resulting from such operations are borne by you.",
  ],
  privacyTitle: "Privacy Policy",
  privacyBody: [
    "We try to minimize the collection of personal information. Except for necessary functional Cookies and anti-abuse security strategies, we do not perform behavior tracking analysis.",
    "The data generated in the Memorial Hall and Cloud Memorial is defaulted to be directly uploaded to the chain or entered into decentralized storage; we do not retain identifiable plaintext data on the server side.",
    "The email, phone number, and other contact information you fill in when submitting an application or contacting us are only used for communication and service delivery and will not be sold to third parties.",
    "Under the requirements of laws or obligations to fulfill legal obligations, we may provide necessary information to law enforcement and judicial authorities, but will strictly follow the principles of legality and minimization.",
  ],
  } as const satisfies i18nPolicies;