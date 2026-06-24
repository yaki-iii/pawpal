import { HealthRecordType, PetSpecies, ReminderStatus, CircleType } from '../types';

// ==================== API Paths ====================

export const API_PATHS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },
  users: {
    profile: '/users',
    update: '/users',
    notifications: '/users/notifications',
    readNotification: '/users/notifications',
    follow: '/users',
    exportData: '/users/export',
    deleteAccount: '/users',
  },
  pets: {
    list: '/pets',
    create: '/pets',
    detail: '/pets',
    update: '/pets',
    delete: '/pets',
  },
  health: {
    records: '/pets',
    weight: '/pets',
    reminders: '/pets',
  },
  community: {
    posts: '/posts',
    feed: '/posts/feed',
    postDetail: '/posts',
    like: '/posts',
    comments: '/posts',
    circles: '/circles',
    circleDetail: '/circles',
    joinCircle: '/circles',
    leaveCircle: '/circles',
  },
  ai: {
    consult: '/ai/consult',
    sessions: '/ai/sessions',
    sessionDetail: '/ai/sessions',
    updateStatus: '/ai/sessions',
  },
  knowledge: {
    list: '/knowledge',
    search: '/knowledge/search',
    detail: '/knowledge',
  },
} as const;

// ==================== Breed Lists ====================

export const DOG_BREEDS: string[] = [
  '柯基', '金毛', '拉布拉多', '柴犬', '哈士奇', '泰迪', '边牧', '法斗',
  '博美', '萨摩耶', '德牧', '阿拉斯加', '比熊', '雪纳瑞', '约克夏',
  '中华田园犬', '其他',
];

export const CAT_BREEDS: string[] = [
  '布偶', '英短', '美短', '橘猫', '暹罗', '缅因', '加菲', '折耳',
  '狸花', '波斯', '斯芬克斯', '孟加拉', '俄罗斯蓝猫', '其他',
];

// ==================== Health Record Type Labels ====================

export const HEALTH_RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  [HealthRecordType.VACCINE]: '疫苗记录',
  [HealthRecordType.DEWORMING]: '驱虫记录',
  [HealthRecordType.CHECKUP]: '体检记录',
  [HealthRecordType.VISIT]: '就诊记录',
};

export const HEALTH_RECORD_TYPE_COLORS: Record<HealthRecordType, string> = {
  [HealthRecordType.VACCINE]: '#4ECDC4',
  [HealthRecordType.DEWORMING]: '#FF8C42',
  [HealthRecordType.CHECKUP]: '#7FE0D8',
  [HealthRecordType.VISIT]: '#E53935',
};

export const HEALTH_RECORD_TYPE_ICONS: Record<HealthRecordType, string> = {
  [HealthRecordType.VACCINE]: '💉',
  [HealthRecordType.DEWORMING]: '💊',
  [HealthRecordType.CHECKUP]: '🩺',
  [HealthRecordType.VISIT]: '🏥',
};

// ==================== Reminder Status Labels ====================

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  [ReminderStatus.PENDING]: '待提醒',
  [ReminderStatus.NOTIFIED]: '已通知',
  [ReminderStatus.DONE]: '已完成',
  [ReminderStatus.OVERDUE]: '已过期',
};

export const REMINDER_STATUS_COLORS: Record<ReminderStatus, string> = {
  [ReminderStatus.PENDING]: '#4CAF50',
  [ReminderStatus.NOTIFIED]: '#FF9800',
  [ReminderStatus.DONE]: '#9E9E9E',
  [ReminderStatus.OVERDUE]: '#E53935',
};

// ==================== Reminder Default Cycles (days) ====================

export const REMINDER_CYCLES: Record<string, number> = {
  VACCINE: 365,
  DEWORMING: 90,
  CHECKUP: 365,
};

// ==================== Circle Type Labels ====================

export const CIRCLE_TYPE_LABELS: Record<CircleType, string> = {
  [CircleType.BREED]: '品种圈',
  [CircleType.CITY]: '同城圈',
  [CircleType.TOPIC]: '话题圈',
};

// ==================== Species Labels ====================

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  [PetSpecies.DOG]: '犬',
  [PetSpecies.CAT]: '猫',
};

// ==================== AI Disclaimer ====================

export const AI_DISCLAIMER =
  '以上内容来自社区和网络公开信息总结，仅供参考，不构成专业兽医建议，复杂情况请及时就医。';

// ==================== Question Type Labels ====================

export const QUESTION_TYPES: string[] = [
  '消化问题', '皮肤问题', '行为异常', '眼部问题', '耳部问题', '口腔问题',
  '呼吸道问题', '泌尿问题', '骨科问题', '营养饮食', '其他',
];

// ==================== Default Page Sizes ====================

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// ==================== Navigation Items ====================

export const NAV_ITEMS = [
  { label: '首页', path: '/', icon: 'Home' },
  { label: '我的宠物', path: '/pets', icon: 'PawPrint' },
  { label: '圈子广场', path: '/circles', icon: 'Users' },
  { label: 'AI 助手', path: '/ai', icon: 'Bot' },
  { label: '个人主页', path: '/profile', icon: 'User' },
] as const;
