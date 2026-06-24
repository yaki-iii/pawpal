import { z } from 'zod';

/**
 * Email validation schema.
 */
export const emailSchema = z
  .string()
  .min(1, '请输入邮箱地址')
  .email('邮箱格式不正确');

/**
 * Password validation schema.
 * Requires at least 6 characters.
 */
export const passwordSchema = z
  .string()
  .min(6, '密码至少6位')
  .max(50, '密码最多50位');

/**
 * Nickname validation schema.
 */
export const nicknameSchema = z
  .string()
  .min(1, '请输入昵称')
  .max(20, '昵称最多20个字符');

/**
 * Login form validation schema.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Register form validation schema.
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
});

/**
 * Pet form validation schema.
 */
export const petFormSchema = z.object({
  name: z.string().min(1, '请输入宠物名称').max(20, '名称最多20个字符'),
  species: z.enum(['DOG', 'CAT']),
  breed: z.string().min(1, '请选择品种'),
  gender: z.enum(['MALE', 'FEMALE']),
  birthday: z.string().optional().default(''),
  weight: z.number().min(0, '体重不能为负').max(200, '体重数值过大'),
  neutered: z.boolean(),
});

/**
 * Health record form validation schema.
 */
export const healthRecordSchema = z.object({
  type: z.enum(['VACCINE', 'DEWORMING', 'CHECKUP', 'VISIT']),
  date: z.string().min(1, '请选择日期'),
  itemName: z.string().min(1, '请输入项目名称').max(100, '项目名称最多100字'),
  notes: z.string().max(500, '备注最多500字').default(''),
  images: z.array(z.string()).default([]),
});

/**
 * Post form validation schema.
 */
export const postFormSchema = z.object({
  title: z.string().min(1, '请输入标题').max(100, '标题最多100字'),
  content: z.string().min(1, '请输入内容').max(5000, '内容最多5000字'),
  circleId: z.string().optional(),
  petId: z.string().optional(),
  tags: z.array(z.string()).max(5, '最多添加5个标签').default([]),
});

/**
 * AI consult validation schema.
 */
export const aiConsultSchema = z.object({
  question: z.string().min(5, '请详细描述问题（至少5个字）').max(1000, '问题最多1000字'),
  petId: z.string().optional(),
  imageUrls: z.array(z.string()).max(4, '最多上传4张图片').default([]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PetFormData = z.infer<typeof petFormSchema>;
export type HealthRecordFormData = z.infer<typeof healthRecordSchema>;
export type PostFormData = z.infer<typeof postFormSchema>;
export type AIConsultFormData = z.infer<typeof aiConsultSchema>;
